variable "region" {
  type    = string
  default = "ap-south-1"
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN for the custom domain (must be in us-east-1)."
  default     = ""
}

# ── Backend ───────────────────────────────────────────────────────────────────

variable "backend_prefix" {
  type        = string
  description = "Reverse-domain project prefix (e.g. xyz-mailroomapp for mailroomapp.xyz). Must match TABLE_NAME constants."
  default     = "xyz-mailroomapp"
}

variable "backend_service_name" {
  type        = string
  description = "Service identifier used in IAM resource names (e.g. nestjs-api). Result: {prefix}-{service_name}."
  default     = "nestjs-api"
}

variable "backend_agentcore_runtime_arns" {
  type        = list(string)
  description = "AgentCore Runtime ARNs the backend may invoke. Leave empty until agents are deployed."
  default     = []
}

variable "backend_enable_pitr" {
  type        = bool
  description = "Enable DynamoDB point-in-time recovery."
  default     = false
}

variable "tags" {
  type    = map(string)
  default = {}
}
