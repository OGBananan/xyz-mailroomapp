terraform {
  required_version = "~> 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # key is intentionally omitted — pass it at init time:
  #   terraform init -backend-config="key=dev/terraform.tfstate"
  backend "s3" {
    bucket         = "xyz-mailroomapp-tfstate"
    region         = "ap-south-1"
    encrypt        = true
    use_lockfile   = true
  }
}

provider "aws" {
  region = var.region
}
