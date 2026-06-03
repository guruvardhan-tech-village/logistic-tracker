# GCS bucket for Terraform state
resource "google_storage_bucket" "terraform_state" {
  name          = "${var.gcp_project_id}-tf-state"
  location      = var.gcp_region
  force_destroy = false

  versioning {
    enabled = true
  }

  uniform_bucket_level_access = true

  encryption {
    default_kms_key_name = google_kms_crypto_key.terraform_key.id
  }

  lifecycle {
    prevent_destroy = true
  }

  depends_on = [google_kms_crypto_key_iam_binding.terraform_sa_key_binding]
}

# KMS key for state file encryption
resource "google_kms_key_ring" "terraform" {
  name     = "${var.project_name}-tf-keyring"
  location = var.gcp_region
}

resource "google_kms_crypto_key" "terraform_key" {
  name            = "${var.project_name}-tf-key"
  key_ring        = google_kms_key_ring.terraform.id
  rotation_period = "7776000s" # 90 days

  lifecycle {
    prevent_destroy = true
  }
}

# Service account for Terraform to use the KMS key
resource "google_service_account" "terraform" {
  account_id   = "${var.project_name}-tf-sa"
  display_name = "Terraform Service Account"
}

resource "google_kms_crypto_key_iam_binding" "terraform_sa_key_binding" {
  crypto_key_id = google_kms_crypto_key.terraform_key.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"

  members = [
    "serviceAccount:${google_service_account.terraform.email}",
  ]
}

# Cloud SQL for PostgreSQL
resource "google_sql_database_instance" "postgres" {
  name                = "${var.project_name}-postgres"
  database_version    = "POSTGRES_15"
  region              = var.gcp_region
  deletion_protection = true

  settings {
    tier      = "db-f1-micro"
    disk_type = "PD_SSD"
    disk_size = 20

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
    }

    ip_configuration {
      require_ssl = true
      dynamic "authorized_networks" {
        for_each = [google_compute_subnetwork.subnet]
        content {
          name  = "gke-subnet"
          value = authorized_networks.value.ip_cidr_range
        }
      }
      private_network = google_compute_network.vpc.id
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
    }
  }

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

resource "google_sql_database" "logistic_db" {
  name     = "logistic_tracker"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "app_user" {
  name     = "logistic_app"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Private VPC connection for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "${var.project_name}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# Cloud Storage bucket for application data
resource "google_storage_bucket" "app_data" {
  name     = "${var.gcp_project_id}-app-data"
  location = var.gcp_region

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      num_newer_versions = 5
    }
    action {
      type = "Delete"
    }
  }
}

output "database_instance_connection_name" {
  value       = google_sql_database_instance.postgres.connection_name
  description = "Cloud SQL instance connection name"
}

output "database_password" {
  value       = random_password.db_password.result
  sensitive   = true
  description = "Database password (store in secret manager)"
}

output "app_data_bucket" {
  value       = google_storage_bucket.app_data.name
  description = "Application data bucket name"
}
