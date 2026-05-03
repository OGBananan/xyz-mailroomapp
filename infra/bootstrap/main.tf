provider "aws" {
  region = var.region
}

locals {
  name = "${var.app_name}-tfstate"
}

# ── S3 state bucket ────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "state" {
  bucket = local.name

  lifecycle {
    prevent_destroy = true
  }

  tags = { Name = local.name }
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── DynamoDB lock table ────────────────────────────────────────────────────────

resource "aws_dynamodb_table" "lock" {
  name         = local.name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = { Name = local.name }
}
