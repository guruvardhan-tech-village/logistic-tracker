gcp_project_id      = "inspired-photon-498305-p8"
gcp_region          = "us-central1"
project_name        = "logistic-tracker"
environment         = "prod"

# Network configuration
subnet_cidr         = "10.0.0.0/24"
pods_cidr           = "10.1.0.0/16"
services_cidr       = "10.2.0.0/16"

# GKE cluster configuration - COST OPTIMIZED FOR FREE TIER
initial_node_count  = 1
min_node_count      = 1
max_node_count      = 3
node_machine_type   = "e2-micro"  # Free tier eligible

# Note: e2-micro is eligible for GCP free tier (750 hours/month)
# Region: us-central1 is free tier eligible
# Storage: 30GB persistent disk free per month
