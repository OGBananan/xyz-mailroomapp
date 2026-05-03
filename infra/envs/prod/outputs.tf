output "frontend_bucket" {
  value       = module.frontend.bucket_name
  description = "Deploy built Next.js output here: aws s3 sync out/ s3://<bucket>"
}

output "cloudfront_distribution_id" {
  value       = module.frontend.cloudfront_distribution_id
  description = "Invalidate after deploy: aws cloudfront create-invalidation --distribution-id <id> --paths '/*'"
}

output "cloudfront_domain" {
  value = module.frontend.cloudfront_domain
}

output "backend_role_arn" {
  value       = module.backend.role_arn
  description = "Attach to ECS task definition as task role."
}

output "kms_key_id" {
  value       = module.backend.kms_key_id
  description = "Set as KMS_KEY_ID env var on the backend service."
}

output "table_names" {
  value = module.backend.table_names
}
