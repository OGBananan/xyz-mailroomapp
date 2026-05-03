output "bucket_name" {
  value       = aws_s3_bucket.app.bucket
  description = "S3 bucket name — deploy built Next.js output here."
}

output "bucket_arn" {
  value = aws_s3_bucket.app.arn
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.app.id
  description = "Run invalidation after each deploy: aws cloudfront create-invalidation --distribution-id <id> --paths '/*'"
}

output "cloudfront_domain" {
  value       = aws_cloudfront_distribution.app.domain_name
  description = "CloudFront domain name (or your custom alias if configured)."
}

output "cloudfront_arn" {
  value = aws_cloudfront_distribution.app.arn
}
