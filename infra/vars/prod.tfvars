region          = "ap-south-1"
certificate_arn = "arn:aws:acm:us-east-1:856096730646:certificate/60116b31-ccf7-4d4f-abeb-34718c0c81ad"

backend_prefix      = "xyz-mailroomapp"
backend_enable_pitr = false

# Add ARNs once AgentCore runtimes are deployed:
# backend_agentcore_runtime_arns = [
#   "arn:aws:bedrock:ap-south-1:<account>:agent-runtime/evaluator-id",
#   "arn:aws:bedrock:ap-south-1:<account>:agent-runtime/draft-id",
# ]
backend_agentcore_runtime_arns = []

tags = {
  project     = "xyz-mailroomapp"
  environment = "prod"
}
