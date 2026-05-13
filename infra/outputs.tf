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

output "backend_table_names" {
  value       = module.backend.table_names
  description = "Map of logical key → DynamoDB table name."
}

output "backend_iam_user" {
  value       = module.backend.iam_user_name
  description = "IAM user created for the backend service."
}

output "backend_access_key_id" {
  value       = module.backend.access_key_id
  description = "Set as AWS_ACCESS_KEY_ID in the backend .env"
  sensitive   = true
}

output "backend_secret_access_key" {
  value       = module.backend.secret_access_key
  description = "Set as AWS_SECRET_ACCESS_KEY in the backend .env"
  sensitive   = true
}
