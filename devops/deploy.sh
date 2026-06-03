#!/bin/bash
# Logistic Tracker - Automated Deployment Script
# Deploy entire infrastructure in one go

set -e
set -u

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

PROJECT_ID="${GCP_PROJECT_ID:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGION="us-central1"

if [ -z "$PROJECT_ID" ]; then
  log_error "GCP_PROJECT_ID environment variable not set"
  exit 1
fi

log_info "Starting Logistic Tracker Deployment"
log_info "========================================"

# Check prerequisites
log_info "Checking prerequisites..."
for tool in gcloud kubectl helm terraform docker; do
  if ! command -v $tool &> /dev/null; then
    log_error "Missing required tool: $tool"
    exit 1
  fi
done
log_success "All prerequisites met"

# Setup GCP
log_info "Setting up GCP project: $PROJECT_ID"
gcloud config set project $PROJECT_ID

log_info "Enabling required APIs..."
gcloud services enable compute.googleapis.com container.googleapis.com \
  sql-component.googleapis.com cloudbuild.googleapis.com cloudkms.googleapis.com \
  storage-api.googleapis.com servicenetworking.googleapis.com 2>/dev/null
log_success "APIs enabled"

# Terraform
log_info "Initializing Terraform..."
cd "$SCRIPT_DIR/terraform"

BUCKET_NAME="${PROJECT_ID}-tf-state"
if ! gsutil ls gs://$BUCKET_NAME &> /dev/null; then
  log_info "Creating state bucket: $BUCKET_NAME"
  gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME
  gsutil versioning set on gs://$BUCKET_NAME
  gsutil uniformbucketlevelaccess set on gs://$BUCKET_NAME
fi

terraform init

if [ ! -f terraform.tfvars ]; then
  cp terraform.tfvars.example terraform.tfvars
  log_warning "Created terraform.tfvars - please update with your values"
  exit 1
fi

log_info "Validating Terraform..."
terraform validate
terraform fmt -recursive

log_info "Planning deployment..."
terraform plan -out=tfplan

read -p "Deploy infrastructure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  log_info "Deployment cancelled"
  exit 0
fi

log_info "Applying Terraform configuration (45-60 minutes)..."
terraform apply tfplan
log_success "Infrastructure deployed"

# Get credentials
log_info "Retrieving Kubernetes credentials..."
gcloud container clusters get-credentials logistic-tracker-gke \
  --region $REGION --project $PROJECT_ID
kubectl cluster-info
log_success "Cluster accessible"

# Deploy applications
log_info "Deploying applications..."
cd "$SCRIPT_DIR/../k8s"

kubectl create namespace logistic-tracker --dry-run=client -o yaml | kubectl apply -f -

sed -i.bak "s/PROJECT_ID/$PROJECT_ID/g" backend-deployment.yaml frontend-deployment.yaml

kubectl apply -f rbac.yaml
kubectl apply -f mosquitto-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml

log_info "Waiting for deployments..."
kubectl rollout status deployment/backend -n logistic-tracker --timeout=10m
kubectl rollout status deployment/frontend -n logistic-tracker --timeout=10m

log_success "========================================"
log_success "Deployment completed successfully!"
log_info "Next steps:"
log_info "1. kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80"
log_info "2. Access Grafana at http://localhost:3000"
log_info "3. Verify all pods: kubectl get pods -n logistic-tracker"
