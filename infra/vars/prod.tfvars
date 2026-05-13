region          = "ap-south-1"
certificate_arn = "arn:aws:acm:us-east-1:856096730646:certificate/60116b31-ccf7-4d4f-abeb-34718c0c81ad"

# Backend
backend_prefix            = "xyz-mailroomapp"
backend_compute_principal = "iam-user"
# Set to the ARN of the IAM user used for Railway / local dev credentials
# e.g. "arn:aws:iam::856096730646:user/xyz-mailroomapp-backend"
backend_iam_user_arn      = ""

# Add ARNs once AgentCore runtimes are deployed:
# backend_agentcore_runtime_arns = [
#   "arn:aws:bedrock:ap-south-1:856096730646:agent-runtime/evaluator-id",
#   "arn:aws:bedrock:ap-south-1:856096730646:agent-runtime/draft-id",
# ]
backend_agentcore_runtime_arns = []

backend_enable_pitr = false

tags = {
  project     = "xyz-mailroomapp"
  environment = "prod"
}
