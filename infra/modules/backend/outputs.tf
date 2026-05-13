output "table_names" {
  value       = { for k, t in aws_dynamodb_table.tables : k => t.name }
  description = "Map of logical key → DynamoDB table name."
}

output "table_arns" {
  value = { for k, t in aws_dynamodb_table.tables : k => t.arn }
}

output "iam_user_name" {
  value       = aws_iam_user.backend.name
  description = "IAM user name for the backend service."
}

output "access_key_id" {
  value       = aws_iam_access_key.backend.id
  description = "AWS_ACCESS_KEY_ID for the backend service."
  sensitive   = true
}

output "secret_access_key" {
  value       = aws_iam_access_key.backend.secret
  description = "AWS_SECRET_ACCESS_KEY for the backend service."
  sensitive   = true
}
