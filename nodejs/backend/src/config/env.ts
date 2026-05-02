const required = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing env var: ${key}`)
  return value
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  AGENT_RUNTIME_URL: required('AGENT_RUNTIME_URL'),
  AWS_REGION: process.env.AWS_REGION ?? 'us-east-1',
}
