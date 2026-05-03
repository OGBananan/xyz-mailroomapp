variable "region" {
  type    = string
  default = "ap-south-1"
}

variable "agentcore_runtime_arn" {
  type        = string
  description = "Bedrock AgentCore Runtime ARN for the backend agent."
}
