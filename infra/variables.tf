variable "region" {
  type        = string
  description = "AWS region."
  default     = "ap-south-1"
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN for the custom domain (must be in us-east-1). Leave empty for CloudFront default domain."
  default     = ""
}
