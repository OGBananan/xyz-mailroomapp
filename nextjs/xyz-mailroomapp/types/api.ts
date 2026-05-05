import type { gmail_v1 } from "googleapis"

// ── Shared ────────────────────────────────────────────────────────────────────

export type BoardColumn  = "decide" | "review" | "ready" | "hidden"
export type Confidence   = "high" | "medium" | "low"

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id:    string
  email: string
  name:  string
}

// ── Board / Cards ─────────────────────────────────────────────────────────────

/** Lightweight card returned by GET /api/cards (board list view). */
export interface BoardCard {
  threadId:        string
  latestMessageId: string
  from:            string   // raw RFC 2822 e.g. "Alice <alice@example.com>"
  subject:         string
  snippet:         string
  receivedAt:      string   // ISO 8601
  labelIds:        string[]
  column:          BoardColumn
  triageReason:    string | null
  confidence:      Confidence | null
  hasDraft:        boolean
}

export interface Board {
  decide: BoardCard[]
  review: BoardCard[]
  ready:  BoardCard[]
  hidden: BoardCard[]
}

/** Full card returned by GET /api/cards/:threadId (detail / dialog view). */
export interface CardDetail {
  threadId:     string
  column:       BoardColumn
  triageReason: string | null
  confidence:   Confidence | null
  thread:       gmail_v1.Schema$Thread   // full Gmail thread — FE helpers work on this directly
  draft:        { draftId: string; body: string } | null
}

// ── Sync ──────────────────────────────────────────────────────────────────────

export interface SyncStatus {
  lastSyncedAt:  string | null
  status:        "idle" | "syncing"
  lastHistoryId: string | null
}
