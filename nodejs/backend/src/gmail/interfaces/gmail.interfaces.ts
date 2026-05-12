export const TRIAGE_LABELS = {
  decide: 'triage/needs-you',
  review: 'triage/drafted',
  ready:  'triage/done',
  hidden: 'triage/hidden',
} as const

export type BoardColumn = keyof typeof TRIAGE_LABELS

export interface ThreadSummary {
  threadId:        string
  latestMessageId: string
  from:            string
  subject:         string
  snippet:         string
  receivedAt:      string
  labelIds:        string[]
}

export interface NewThreadInfo {
  threadId:        string
  latestMessageId: string
  from:            string
  subject:         string
  snippet:         string
  receivedAt:      string
}

export interface DraftInfo {
  draftId: string
  body:    string
}
