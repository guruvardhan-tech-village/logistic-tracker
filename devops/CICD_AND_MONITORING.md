# Logistic Tracker - CI/CD Pipeline & VM Monitoring

Complete CI/CD pipeline setup with GitHub Actions, Cloud Build, and VM-based monitoring stack.

## 📁 Structure

```
.github/
├── workflows/
│   ├── ci-build.yml              # Build and test
│   ├── deploy-gke.yml            # Deploy to GKE
│   ├── deploy-vm.yml             # Deploy monitoring VM
│   └── integration-tests.yml      # End-to-end tests
├── scripts/
│   ├── build.sh                  # Build images
│   ├── test.sh                   # Run tests
│   └── deploy.sh                 # Deploy to GKE
devops/
├── vm/
│   ├── terraform/
│   │   ├── main.tf              # VM configuration
│   │   ├── variables.tf         # VM variables
│   │   └── terraform.tfvars     # VM config values
│   ├── ansible/
│   │   ├── playbook.yml         # Monitoring stack setup
│   │   ├── roles/
│   │   │   ├── prometheus/
│   │   │   ├── grafana/
│   │   │   ├── node-exporter/
│   │   │   └── alertmanager/
│   │   └── inventory.ini        # Host inventory
│   └── scripts/
│       ├── setup-vm.sh          # Initial setup
│       └── monitor.sh           # Monitoring checks
```

## 🎯 What's Included

### CI/CD Pipeline
- ✅ GitHub Actions workflows for automated testing & deployment
- ✅ Docker image builds & push to GCR
- ✅ Automated testing on pull requests
- ✅ Deployment to GKE on main branch merge
- ✅ Rollback capabilities on deployment failure
- ✅ Slack notifications for build status

### VM Infrastructure
- ✅ Compute Engine VM with monitoring stack
- ✅ Prometheus for metrics collection
- ✅ Grafana for visualization
- ✅ Alertmanager for alert routing
- ✅ Node Exporter for system metrics
- ✅ Auto-healing with health checks

### Deployment & Monitoring
- ✅ Blue-Green deployments to GKE
- ✅ Helm-based release management
- ✅ Cross-cluster monitoring
- ✅ Log aggregation from both GKE and VMs
- ✅ Custom dashboards for application metrics

## 🚀 Quick Start

### Phase 1: Setup CI/CD Pipeline (30 minutes)

**Step 1.1**: Create GitHub repository secrets:

```bash
# In GitHub: Settings → Secrets and variables → New repository secret

# Required secrets:
GCP_PROJECT_ID         # Your GCP project ID
GCP_SA_KEY             # Base64-encoded service account key
DOCKER_REGISTRY        # GCR registry (gcr.io/PROJECT_ID)
SLACK_WEBHOOK_URL      # For notifications (optional)
```

**Step 1.2**: Encode service account key:

```bash
base64 < /path/to/service-account-key.json | tr -d '\n'
# Copy output to GCP_SA_KEY secret
```

**Step 1.3**: Configure GitHub Actions workflows (already included in .github/workflows)

### Phase 2: Deploy Monitoring VM (45 minutes)

**Step 2.1**: Navigate to VM terraform:

```bash
cd devops/vm/terraform
cp terraform.tfvars.example terraform.tfvars
```

**Step 2.2**: Update terraform.tfvars:

```hcl
gcp_project_id       = "your-project-id"
gcp_region          = "us-central1"
machine_type        = "n1-standard-1"
vm_name             = "logistic-tracker-monitoring"
environment         = "prod"
```

**Step 2.3**: Deploy VM:

```bash
terraform init
terraform plan
terraform apply
```

**Step 2.4**: Get VM external IP:

```bash
MONITORING_VM_IP=$(terraform output -raw external_ip)
echo "Monitoring VM: $MONITORING_VM_IP"
```

### Phase 3: Configure Monitoring Stack (30 minutes)

**Step 3.1**: SSH into VM:

```bash
gcloud compute ssh logistic-tracker-monitoring --zone=us-central1-a
```

**Step 3.2**: Run Ansible playbook:

```bash
# From your local machine
cd devops/vm/ansible

# Update inventory with VM IP
sed -i "s/MONITORING_VM_IP/$MONITORING_VM_IP/g" inventory.ini

# Install Ansible (if needed)
pip install ansible

# Run playbook
ansible-playbook -i inventory.ini playbook.yml
```

**Step 3.3**: Access monitoring dashboards:

```bash
# Grafana
http://$MONITORING_VM_IP:3000
# Username: admin
# Password: (set in ansible playbook)

# Prometheus
http://$MONITORING_VM_IP:9090

# Alertmanager
http://$MONITORING_VM_IP:9093
```

### Phase 4: Connect VM to GKE Monitoring (20 minutes)

**Step 4.1**: Configure Prometheus to scrape GKE:

```bash
# SSH into VM
gcloud compute ssh logistic-tracker-monitoring --zone=us-central1-a

# Edit Prometheus config
sudo nano /etc/prometheus/prometheus.yml

# Add GKE cluster as scrape target:
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'gke-cluster'
    kubernetes_sd_configs:
      - role: pod
        api_server: 'https://YOUR_GKE_ENDPOINT'
        bearer_token: 'YOUR_K8S_TOKEN'
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
```

**Step 4.2**: Restart Prometheus:

```bash
sudo systemctl restart prometheus
```

## 📊 CI/CD Pipeline Workflows

### 1. CI Build Workflow (ci-build.yml)

Triggers on: Pull requests

**Steps**:
1. Checkout code
2. Run unit tests
3. Build Docker images
4. Push to GCR
5. Run integration tests
6. Post results to PR

### 2. Deploy to GKE Workflow (deploy-gke.yml)

Triggers on: Main branch push

**Steps**:
1. Build Docker images
2. Push to GCR
3. Update Kubernetes manifests
4. Deploy with Helm
5. Run smoke tests
6. Slack notification

### 3. VM Deployment Workflow (deploy-vm.yml)

Triggers on: Manual trigger + release tags

**Steps**:
1. Provision Compute Engine VM
2. Run Ansible playbook
3. Configure monitoring
4. Verify health checks
5. DNS setup

### 4. Integration Tests (integration-tests.yml)

Triggers on: Pull requests + scheduled (daily)

**Tests**:
- API endpoint availability
- Database connectivity
- WebSocket communication
- Frontend page load
- Metrics collection

## 🔄 Deployment Pipelines

### Blue-Green Deployment Strategy

```yaml
# deploy-gke.yml implements blue-green strategy:

1. Deploy new version to inactive slot (green)
2. Run smoke tests against green
3. Switch traffic from blue to green
4. Keep blue running for quick rollback
5. Promote green to blue after 1 hour stability
```

### Rollback Procedure

```bash
# Automatic rollback on test failure
# Manual rollback:
kubectl rollout undo deployment/backend -n logistic-tracker
kubectl rollout undo deployment/frontend -n logistic-tracker

# Or via Helm:
helm rollback logistic-tracker-release 0
```

## 📈 Monitoring Across Infrastructure

### GKE Metrics

```promql
# Via Prometheus scraping GKE
- Pod CPU usage
- Pod memory usage
- Container restarts
- Network I/O
- Disk usage
```

### VM Metrics (Node Exporter)

```promql
# Via VM Node Exporter
- CPU utilization
- Memory usage
- Disk usage
- Network traffic
- System load average
```

### Cross-Cluster Dashboard

Grafana dashboard showing:
- GKE cluster health
- VM status
- Application metrics
- Infrastructure metrics
- Alert status

## 🔐 Secrets Management

### GitHub Actions Secrets

All secrets stored in GitHub with:
- ✅ Encrypted at rest
- ✅ Only decrypted in workflows
- ✅ Access logs available
- ✅ Automatic rotation capability

### Kubernetes Secrets

```bash
# Create secrets for backend
kubectl create secret generic gke-backend-secrets \
  -n logistic-tracker \
  --from-literal=DB_PASSWORD="..." \
  --from-literal=JWT_SECRET="..."

# Create secrets for GCP access
kubectl create secret generic gcp-credentials \
  -n logistic-tracker \
  --from-file=key.json=./gcp-key.json
```

### VM Secrets (via Ansible)

```yaml
# ansible/group_vars/monitoring.yml
grafana_admin_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  ...
```

## 🚨 Alerts Configuration

### Critical Alerts

1. **GKE Pod Down**: Pod not running for 5 minutes
2. **High Error Rate**: > 5% error rate for 5 minutes
3. **Database Connection Failure**: Unable to connect
4. **VM Down**: Monitoring VM unresponsive
5. **Disk Usage**: > 85% disk utilization

### Warning Alerts

1. **High Memory Usage**: > 80%
2. **High CPU Usage**: > 75%
3. **Pod Restart Loop**: > 3 restarts in 15 minutes
4. **Slow Response Time**: > 2 seconds average

### Alert Routing (Alertmanager)

```yaml
# Send to Slack for critical
# Send to PagerDuty for SEV1
# Log to database for all
```

## 📊 Key Dashboards

### 1. Infrastructure Overview
- Cluster health
- Node status
- Resource utilization
- Network traffic

### 2. Application Performance
- Request rate
- Error rate
- Response time
- Database performance

### 3. Business Metrics
- Active users
- Transactions per minute
- Revenue impact
- SLA compliance

### 4. Deployment Status
- Release pipeline status
- Deployment success rate
- Rollback count
- Mean time to recovery

## 🛠️ Troubleshooting

### Pipeline Failures

```bash
# Check GitHub Actions logs:
# Settings → Actions → Workflows → Select workflow → View logs

# Check deployment status:
kubectl rollout status deployment/backend -n logistic-tracker

# Check pod logs:
kubectl logs -n logistic-tracker deployment/backend --tail=100
```

### VM Connection Issues

```bash
# Test SSH connectivity:
gcloud compute ssh logistic-tracker-monitoring --zone=us-central1-a

# Check Prometheus status:
sudo systemctl status prometheus

# View Prometheus logs:
sudo journalctl -u prometheus -f
```

### Monitoring Data Missing

```bash
# Verify Prometheus scraping targets:
curl http://MONITORING_VM_IP:9090/api/v1/targets

# Check metrics collection:
curl http://MONITORING_VM_IP:9090/api/v1/query?query=up

# Verify Grafana data source:
# Visit http://MONITORING_VM_IP:3000 → Configuration → Data Sources
```

## 📚 Related Documentation

- [CI/CD Configuration](../../.github/workflows/README.md)
- [VM Setup Guide](./vm/README.md)
- [Ansible Playbooks](./vm/ansible/README.md)
- [Terraform VM Configuration](./vm/terraform/README.md)
- [GKE Deployment Guide](./DEPLOYMENT_GUIDE.md)

## ✅ Validation Checklist

After complete setup:

- [ ] GitHub Actions workflows visible in repo
- [ ] Secrets configured in GitHub
- [ ] Monitoring VM created and running
- [ ] SSH access to monitoring VM working
- [ ] Prometheus collecting metrics
- [ ] Grafana dashboards accessible
- [ ] Alertmanager configured
- [ ] First deployment successful
- [ ] Monitoring data visible in Grafana
- [ ] Alerts functioning correctly

## 🎯 Next Steps

1. **Configure alerts**: Set up PagerDuty/Slack integration
2. **Create runbooks**: Document common issues
3. **Setup backups**: Configure VM snapshots
4. **Performance tuning**: Adjust HPA thresholds based on metrics
5. **Cost optimization**: Review resource allocation

---

**Status**: Ready for Deployment 🚀
**Last Updated**: June 3, 2026
**Estimated Setup Time**: 2 hours
