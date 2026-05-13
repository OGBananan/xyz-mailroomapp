variable "prefix" {
  type        = string
  description = "Resource name prefix. Must match TABLE_NAME constants in entity files (e.g. \"xyz-mailroomapp\")."
}

variable "enable_pitr" {
  type        = bool
  description = "Enable DynamoDB point-in-time recovery."
  default     = false
}

variable "agentcore_runtime_arns" {
  type        = list(string)
  description = "Bedrock AgentCore Runtime ARNs the backend may invoke. Leave empty until agents are deployed."
  default     = []
}

variable "tags" {
  type    = map(string)
  default = {}
}
