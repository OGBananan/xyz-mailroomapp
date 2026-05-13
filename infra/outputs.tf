output "frontend_bucket" {
  value       = module.frontend.bucket_name
  description = "Upload built Next.js output: aws s3 sync out/ s3://<bucket> --delete"
}

output "cloudfront_distribution_id" {
  value       = module.frontend.cloudfront_distribution_id
  description = "Invalidate after deploy: aws cloudfront create-invalidation --distribution-id <id> --paths '/*'"
}

output "cloudfront_domain" {
  value       = module.frontend.cloudfront_domain
  description = "CloudFront domain (or your custom alias if configured)."
}

# ── Backend ───────────────────────────────────────────────────────────────────

output "backend_role_arn" {
  value       = module.backend.role_arn
  description = "IAM role ARN — attach to ECS task / EC2 profile / Roles Anywhere profile."
}

output "backend_kms_key_id" {
  value       = module.backend.kms_key_id
  description = "Set as KMS_KEY_ID env var on the backend service."
}

output "backend_table_names" {
  value       = module.backend.table_names
  description = "Map of logical key → DynamoDB table name."
}
