import type { Email } from './email.js'

export type BoardColumn = 'needs-you' | 'drafted' | 'done' | 'hidden'

export type TriageReason = 'personal-reply-expected' | 'decision-needed' | 'question-for-you'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface Card {
  id: string
  email: Email
  column: BoardColumn
  triageReason: TriageReason
  confidence: ConfidenceLevel
  draft: string | null
  isDraftStreaming: boolean
  createdAt: string
  updatedAt: string
}

export interface BoardState {
  cards: Card[]
  isTriaging: boolean
  lastTriagedAt: string | null
}
