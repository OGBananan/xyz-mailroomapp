variable "app_name" {
  type        = string
  description = "Application name used as prefix for all resources."
  default     = "xyz-mailroomapp"
}

variable "region" {
  type        = string
  description = "AWS region."
  default     = "ap-south-1"
}
