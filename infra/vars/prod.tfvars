env                   = "prod"
region                = "ap-south-1"
agentcore_runtime_arn = "arn:aws:bedrock:ap-south-1:ACCOUNT_ID:agent-runtime/AGENT_ID"
enable_pitr           = true
certificate_arn       = ""   # fill in once ACM cert is issued in us-east-1
aliases               = []   # e.g. ["app.yourdomain.com"]
