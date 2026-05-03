const req = (key: string): string => {
  const v = process.env[key]
  if (!v) throw new Error(`Missing env var: ${key}`)
  return v
}
const opt = (key: string, fallback: string): string => process.env[key] ?? fallback

export const env = {
  PORT: Number(process.env['PORT'] ?? 4000),
  NODE_ENV: opt('NODE_ENV', 'development'),

  // Google OAuth
  GOOGLE_CLIENT_ID:     req('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: req('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI:  req('GOOGLE_REDIRECT_URI'),

  // Session
  SESSION_SECRET:      req('SESSION_SECRET'),
  SESSION_TTL_SECONDS: Number(process.env['SESSION_TTL_SECONDS'] ?? 604800),

  // DynamoDB
  AWS_REGION:          opt('AWS_REGION', 'us-east-1'),
  DYNAMO_ENDPOINT:     process.env['DYNAMO_ENDPOINT'],        // http://localhost:8000 for local
  DYNAMO_TABLE_PREFIX: opt('DYNAMO_TABLE_PREFIX', 'mailroom'),

  // KMS
  KMS_KEY_ID: req('KMS_KEY_ID'),

  // AgentCore
  AGENT_RUNTIME_URL:     req('AGENT_RUNTIME_URL'),
  AGENTCORE_RUNTIME_ARN: req('AGENTCORE_RUNTIME_ARN'),
  AGENTCORE_QUALIFIER:   opt('AGENTCORE_QUALIFIER', ''),
  AGENT_CLIENT:          opt('AGENT_CLIENT', 'agentcore'),    // 'agentcore' | 'stub'

  // Frontend
  FRONTEND_ORIGIN: opt('FRONTEND_ORIGIN', 'http://localhost:3000'),

  // Sync
  SYNC_CRON:         opt('SYNC_CRON', '*/2 * * * *'),
  SYNC_BACKFILL_MAX: Number(process.env['SYNC_BACKFILL_MAX'] ?? 50),
}
