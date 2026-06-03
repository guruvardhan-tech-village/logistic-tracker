# Deploy Prometheus using Helm
resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "54.0.0"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name

  set {
    name  = "prometheus.prometheusSpec.retention"
    value = "15d"
  }

  set {
    name  = "prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage"
    value = "50Gi"
  }

  set {
    name  = "grafana.enabled"
    value = "true"
  }

  set {
    name  = "grafana.adminPassword"
    value = random_password.grafana_password.result
  }

  set {
    name  = "grafana.persistence.enabled"
    value = "true"
  }

  set {
    name  = "grafana.persistence.size"
    value = "10Gi"
  }

  depends_on = [
    google_container_node_pool.primary_nodes,
    kubernetes_namespace.monitoring
  ]
}

# Monitoring namespace
resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"

    labels = {
      name = "monitoring"
    }
  }
}

# Application namespace
resource "kubernetes_namespace" "logistic_tracker" {
  metadata {
    name = "logistic-tracker"

    labels = {
      name = "logistic-tracker"
    }
  }
}

# Grafana datasource for Prometheus
resource "kubernetes_secret" "grafana_prometheus_datasource" {
  metadata {
    name      = "prometheus-datasource"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
  }

  data = {
    "prometheus.yaml" = jsonencode({
      apiVersion = 1
      datasources = [
        {
          name      = "Prometheus"
          type      = "prometheus"
          access    = "proxy"
          url       = "http://prometheus-operated:9090"
          isDefault = true
        }
      ]
    })
  }

  depends_on = [helm_release.prometheus]
}

# ServiceMonitor for application metrics
resource "kubernetes_manifest" "app_service_monitor" {
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "logistic-tracker-monitor"
      namespace = kubernetes_namespace.logistic_tracker.metadata[0].name
    }
    spec = {
      selector = {
        matchLabels = {
          app = "logistic-tracker"
        }
      }
      endpoints = [
        {
          port   = "metrics"
          interval = "30s"
        }
      ]
    }
  }

  depends_on = [helm_release.prometheus]
}

# Alert Rules
resource "kubernetes_manifest" "prometheus_alerts" {
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "PrometheusRule"
    metadata = {
      name      = "logistic-tracker-alerts"
      namespace = kubernetes_namespace.monitoring.metadata[0].name
    }
    spec = {
      groups = [
        {
          name  = "logistic-tracker.rules"
          interval = "30s"
          rules = [
            {
              alert = "HighErrorRate"
              expr  = "rate(http_requests_total{status=~'5..'}[5m]) > 0.05"
              for   = "5m"
              labels = {
                severity = "critical"
              }
              annotations = {
                summary     = "High error rate detected"
                description = "Error rate is above 5% in {{ $labels.instance }}"
              }
            },
            {
              alert = "PodCrashLooping"
              expr  = "rate(kube_pod_container_status_restarts_total[15m]) > 0"
              for   = "5m"
              labels = {
                severity = "warning"
              }
              annotations = {
                summary     = "Pod is crash looping"
                description = "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} is crash looping"
              }
            },
            {
              alert = "HighMemoryUsage"
              expr  = "container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9"
              for   = "5m"
              labels = {
                severity = "warning"
              }
              annotations = {
                summary     = "High memory usage detected"
                description = "Memory usage is above 90% for {{ $labels.pod }}"
              }
            }
          ]
        }
      ]
    }
  }

  depends_on = [helm_release.prometheus]
}

# Random password for Grafana
resource "random_password" "grafana_password" {
  length  = 32
  special = true
}

output "prometheus_service_name" {
  value       = "prometheus-operated"
  description = "Prometheus service name"
}

output "grafana_admin_password" {
  value       = random_password.grafana_password.result
  sensitive   = true
  description = "Grafana admin password"
}

output "monitoring_namespace" {
  value       = kubernetes_namespace.monitoring.metadata[0].name
  description = "Monitoring namespace"
}
