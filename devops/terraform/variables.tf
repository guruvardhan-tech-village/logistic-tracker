variable "gcp_project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "logistic-tracker"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "subnet_cidr" {
  description = "CIDR range for the subnet"
  type        = string
  default     = "10.0.0.0/24"
}

variable "pods_cidr" {
  description = "CIDR range for Kubernetes pods"
  type        = string
  default     = "10.1.0.0/16"
}

variable "services_cidr" {
  description = "CIDR range for Kubernetes services"
  type        = string
  default     = "10.2.0.0/16"
}

variable "initial_node_count" {
  description = "Initial number of nodes in the GKE cluster"
  type        = number
  default     = 3
}

variable "min_node_count" {
  description = "Minimum number of nodes in the GKE cluster"
  type        = number
  default     = 2
}

variable "max_node_count" {
  description = "Maximum number of nodes in the GKE cluster"
  type        = number
  default     = 10
}

variable "node_machine_type" {
  description = "Machine type for GKE nodes"
  type        = string
  default     = "n1-standard-2"
}
