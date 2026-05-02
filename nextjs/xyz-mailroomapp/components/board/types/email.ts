import type { gmail_v1 } from "googleapis"
import type { Status } from "./status"

export interface Classification {
  label: string
  confidence: "high" | "low"
  reason: string
}

export interface Draft {
  body: string
  generatedAt: string
  to?: string[]
  cc?: string[]
  bcc?: string[]
  subject?: string
}

export interface EmailCard {
  thread: gmail_v1.Schema$Thread
  classification: Classification
  state: Status
  draft?: Draft
}
