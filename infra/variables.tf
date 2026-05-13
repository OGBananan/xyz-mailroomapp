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
  description = "Prefix for all backend resources. Must match TABLE_NAME constants in entity files."
  default     = "xyz-mailroomapp"
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
