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

export interface DraftAgentInput {
  card: Card
  userContext?: string
}

export interface DraftAgentOutput {
  draft: string
}
