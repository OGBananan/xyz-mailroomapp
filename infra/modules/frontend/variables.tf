variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN for the custom domain (must be in us-east-1). Leave empty to use the CloudFront default domain."
  default     = ""
}

