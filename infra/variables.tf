variable "region" {
  type    = string
  default = "ap-south-1"
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN for the custom domain (must be in us-east-1)."
  default     = ""
}

# ── Backend module ────────────────────────────────────────────────────────────

variable "backend_prefix" {
  type        = string
  description = "Prefix for all backend resources. Must match TABLE_NAME constants in entity files."
  default     = "xyz-mailroomapp"
}

variable "backend_compute_principal" {
  type        = string
  description = "Who assumes the backend IAM role: ecs-tasks | ec2 | lambda | iam-user."
  default     = "iam-user"
}

variable "backend_iam_user_arn" {
  type        = string
  description = "IAM user ARN for static-credential deployments (Railway). Required when backend_compute_principal = iam-user."
  default     = ""
}

variable "backend_agentcore_runtime_arns" {
  type        = list(string)
  description = "AgentCore Runtime ARNs the backend may invoke (evaluator + draft). Leave empty until agents are deployed."
  default     = []
}

variable "backend_enable_pitr" {
  type    = bool
  default = false
}

variable "tags" {
  type    = map(string)
  default = {}
}
