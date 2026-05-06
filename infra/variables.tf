variable "env" {
  type        = string
  description = "Deployment environment: dev, uat, or prod."

  validation {
    condition     = contains(["dev", "uat", "prod"], var.env)
    error_message = "Must be one of: dev, uat, prod."
  }
}

variable "region" {
  type        = string
  description = "AWS region."
  default     = "ap-south-1"
}

variable "agentcore_runtime_arn" {
  type        = string
  description = "Bedrock AgentCore Runtime ARN for the backend agent."
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN for the custom domain (must be in us-east-1). Leave empty for CloudFront default domain."
  default     = ""
}

variable "aliases" {
  type        = list(string)
  description = "Custom domain aliases for CloudFront, e.g. [\"app.example.com\"]."
  default     = []
}

variable "enable_pitr" {
  type        = bool
  description = "Enable DynamoDB point-in-time recovery. Recommended true for prod."
  default     = false
}
