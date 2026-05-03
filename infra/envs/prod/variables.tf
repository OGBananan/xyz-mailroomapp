variable "region" {
  type    = string
  default = "ap-south-1"
}

variable "agentcore_runtime_arn" {
  type        = string
  description = "Bedrock AgentCore Runtime ARN for the backend agent."
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN (must be in us-east-1) for the custom domain."
  default     = ""
}

variable "aliases" {
  type        = list(string)
  description = "Custom domain aliases for CloudFront, e.g. [\"app.example.com\"]."
  default     = []
}
