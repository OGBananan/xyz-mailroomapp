const req = (key: string): string => {
  const v = process.env[key]
  if (!v) throw new Error(`Missing env var: ${key}`)
  return v
}
const opt = (key: string, fallback: string): string => process.env[key] ?? fallback

export const env = {
  PORT:     Number(process.env['PORT'] ?? 4000),
  NODE_ENV: opt('NODE_ENV', 'development'),

  // Google OAuth
  GOOGLE_CLIENT_ID:     req('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: req('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI:  req('GOOGLE_REDIRECT_URI'),

  // Session
  SESSION_SECRET:      req('SESSION_SECRET'),
  SESSION_TTL_SECONDS: Number(process.env['SESSION_TTL_SECONDS'] ?? 604800),

  // AWS — region only; credentials resolved by SDK provider chain at runtime.
  // For DynamoDB Local set AWS_ENDPOINT_URL_DYNAMODB=http://localhost:8000 in your env.
  AWS_REGION: opt('AWS_REGION', 'ap-south-1'),

  // AgentCore — two separate runtimes
  AGENT_RUNTIME_URL:       req('AGENT_RUNTIME_URL'),
  EVALUATOR_RUNTIME_ARN:   req('EVALUATOR_RUNTIME_ARN'),   // triage/evaluator agent
  DRAFT_RUNTIME_ARN:       req('DRAFT_RUNTIME_ARN'),       // draft + refine agent
  AGENTCORE_QUALIFIER:     opt('AGENTCORE_QUALIFIER', ''),
  AGENT_CLIENT:            opt('AGENT_CLIENT', 'agentcore'),  // 'agentcore' | 'stub'

  // Frontend
  FRONTEND_ORIGIN: opt('FRONTEND_ORIGIN', 'http://localhost:3000'),

  // Sync
  SYNC_CRON:         opt('SYNC_CRON', '*/2 * * * *'),
  SYNC_BACKFILL_MAX: Number(process.env['SYNC_BACKFILL_MAX'] ?? 50),

  // Agent timeout (ms)
  AGENT_TIMEOUT_MS: Number(process.env['AGENT_TIMEOUT_MS'] ?? 60_000),
}
