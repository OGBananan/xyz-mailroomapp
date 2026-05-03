variable "name" {
  type        = string
  description = "Resource name prefix, e.g. xyz-mailroomapp-dev."
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN for the custom domain (must be in us-east-1). Leave empty to use the CloudFront default domain."
  default     = ""
}

variable "aliases" {
  type        = list(string)
  description = "Custom domain aliases for the CloudFront distribution, e.g. [\"app.example.com\"]."
  default     = []
}

variable "tags" {
  type        = map(string)
  description = "Tags applied to all resources."
  default     = {}
}
