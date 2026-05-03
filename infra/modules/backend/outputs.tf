output "role_arn" {
  value       = aws_iam_role.backend.arn
  description = "IAM role ARN — attach to ECS task definition / EC2 instance profile / Lambda function."
}

output "kms_key_id" {
  value       = aws_kms_key.backend.key_id
  description = "KMS key ID — set as KMS_KEY_ID env var on the backend service."
}

output "kms_key_arn" {
  value = aws_kms_key.backend.arn
}

output "table_names" {
  value       = { for k, t in aws_dynamodb_table.tables : k => t.name }
  description = "Map of logical key → actual DynamoDB table name."
}

output "table_arns" {
  value = { for k, t in aws_dynamodb_table.tables : k => t.arn }
}
