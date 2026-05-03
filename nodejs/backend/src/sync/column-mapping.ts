import type { BoardColumn } from '../gmail/gmail.service.js'

type Confidence = 'high' | 'medium' | 'low'
type Reason     = 'personal-reply-expected' | 'decision-needed' | 'question-for-you' | string

export interface TriageVerdict {
  include:    boolean
  reason:     Reason | null
  confidence: Confidence
}

export interface ColumnDecision {
  column:    BoardColumn
  autoDraft: boolean
}

/** Pure function — no side effects, fully unit-testable. */
export function mapVerdictToColumn(verdict: TriageVerdict): ColumnDecision {
  if (!verdict.include) return { column: 'hidden', autoDraft: false }

  const { reason, confidence } = verdict
  if (confidence === 'low') return { column: 'decide', autoDraft: false }

  if (reason === 'personal-reply-expected') {
    return confidence === 'high'
      ? { column: 'review', autoDraft: true }
      : { column: 'decide', autoDraft: false }
  }

  // decision-needed, question-for-you, unknown
  return { column: 'decide', autoDraft: false }
}
