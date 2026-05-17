import type { Email } from './email.js'
import type { Card, TriageReason, ConfidenceLevel } from './board.js'

export interface TriageAgentInput {
  emails: Email[]
}

export interface TriagedEmail {
  emailId: string
  include: boolean
  reason: TriageReason | null
  confidence: ConfidenceLevel
}

export interface TriageAgentOutput {
  results: TriagedEmail[]
}

export interface DraftEmailContext {
  threadId: string
  messageId: string
  subject: string
  from: { name: string; email: string }
  snippet: string
}

export interface DraftAgentInput {
  email: DraftEmailContext
  userContext?: string
}

export interface DraftAgentOutput {
  draft: string
}

export type AgentPayload =
  | { action: 'triage'; input: TriageAgentInput; userId: string; accessToken: string }
  | { action: 'draft'; input: DraftAgentInput; userId: string; accessToken: string }
