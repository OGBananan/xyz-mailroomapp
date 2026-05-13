variable "prefix" {
  type        = string
  description = "Resource name prefix. Must match the hardcoded TABLE_NAME constants in the backend entity files, e.g. \"xyz-mailroomapp\"."
}

variable "compute_principal" {
  type        = string
  description = "AWS service principal that will assume the backend role: \"ecs-tasks\", \"ec2\", \"lambda\", or \"iam-user\" (static credentials, e.g. Railway)."
  default     = "ecs-tasks"

  validation {
    condition     = contains(["ecs-tasks", "ec2", "lambda", "iam-user"], var.compute_principal)
    error_message = "Must be one of: ecs-tasks, ec2, lambda, iam-user."
  }
}

variable "iam_user_arn" {
  type        = string
  description = "IAM user ARN allowed to assume the backend role. Required when compute_principal = \"iam-user\"."
  default     = ""
}

variable "kms_admin_role_arns" {
  type        = list(string)
  description = "IAM role ARNs that can administer (rotate, disable, delete) the KMS key."
  default     = []
}

variable "enable_pitr" {
  type        = bool
  description = "Enable DynamoDB point-in-time recovery. Set true for prod."
  default     = false
}

variable "agentcore_runtime_arns" {
  type        = list(string)
  description = "Bedrock AgentCore Runtime ARNs the backend is permitted to invoke (evaluator + draft)."
  default     = []
}

variable "tags" {
  type    = map(string)
  default = {}
}
