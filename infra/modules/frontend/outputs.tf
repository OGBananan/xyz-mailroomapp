output "bucket_name" {
  value       = aws_s3_bucket.xyz-mailroomapp-web.bucket
  description = "S3 bucket name — deploy built Next.js output here."
}

output "bucket_arn" {
  value = aws_s3_bucket.xyz-mailroomapp-web.arn
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.xyz-mailroomapp-web.id
  description = "Run invalidation after each deploy: aws cloudfront create-invalidation --distribution-id <id> --paths '/*'"
}

output "cloudfront_domain" {
  value       = aws_cloudfront_distribution.xyz-mailroomapp-web.domain_name
  description = "CloudFront domain name (or your custom alias if configured)."
}

output "cloudfront_arn" {
  value = aws_cloudfront_distribution.xyz-mailroomapp-web.arn
}
