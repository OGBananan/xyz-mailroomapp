variable "prefix" {
  type        = string
  description = "Reverse-domain project prefix matching TABLE_NAME constants in entity files (e.g. \"xyz-mailroomapp\" for mailroomapp.xyz)."
}

variable "service_name" {
  type        = string
  description = "Name of the service that owns these resources — becomes part of the IAM user and policy name (e.g. \"nestjs-api\"). Results in names like {prefix}-{service_name}."
  default     = "nestjs-api"
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
