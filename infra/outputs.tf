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
