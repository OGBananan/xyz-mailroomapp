output "state_bucket" {
  value       = aws_s3_bucket.state.bucket
  description = "Paste this into envs/*/versions.tf backend.bucket"
}

output "lock_table" {
  value       = aws_dynamodb_table.lock.name
  description = "Paste this into envs/*/versions.tf backend.dynamodb_table"
}
