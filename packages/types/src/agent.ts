import type { Email } from './email.js'
import type { Card, TriageReason, ConfidenceLevel } from './board.js'

// AG-UI protocol event types
export type AgentEventType =
  | 'RUN_STARTED'
  | 'RUN_FINISHED'
  | 'RUN_ERROR'
  | 'TEXT_MESSAGE_START'
  | 'TEXT_MESSAGE_DELTA'
  | 'TEXT_MESSAGE_END'
  | 'TOOL_CALL_START'
  | 'TOOL_CALL_DELTA'
  | 'TOOL_CALL_END'
  | 'STATE_DELTA'

export interface AgentStreamEvent {
  type: AgentEventType
  data: unknown
}

// Triage agent
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

// Draft agent
export interface DraftAgentInput {
  card: Card
  userContext?: string
}

export interface DraftAgentOutput {
  draft: string
}
