import { env } from '../config/env.js'

export interface InvokeAgentParams {
  action: 'triage' | 'draft'
  input: unknown
  sessionId?: string | undefined
}

export async function invokeAgent({ action, input, sessionId }: InvokeAgentParams): Promise<unknown> {
  const res = await fetch(env.AGENT_RUNTIME_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(sessionId ? { 'x-session-id': sessionId } : {}),
    },
    body: JSON.stringify({ action, input }),
  })

  if (!res.ok) {
    throw new Error(`Agent runtime returned ${res.status}: ${await res.text()}`)
  }

  return res.json()
}
