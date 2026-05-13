"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cardsService }      from "@/services/cards.service"
import { syncService }       from "@/services/sync.service"
import { createEventStream } from "@/services/events.service"
import { boardCardToEmailCard, upgradeWithDetail } from "@/lib/card-transform"
import type { BoardColumn } from "@/types/api"
import type { EmailCard }   from "@/components/board/types/email"
import type { Status }      from "@/components/board/types/status"

const SYNC_INTERVAL_MS = 2 * 60 * 1000   // 2 minutes

export interface UseBoardReturn {
  emails:      EmailCard[]
  isLoading:   boolean
  isSyncing:   boolean
  lastSynced:  Date | null
  error:       string | null
  reload:      () => Promise<void>
  refresh:     () => void
  loadDetail:  (threadId: string) => Promise<void>
  moveCard:    (threadId: string, column: BoardColumn) => void
  hideCard:    (threadId: string) => void
  appendDraftChunk: (threadId: string, token: string) => void
}

export function useBoard(): UseBoardReturn {
  const [emails,     setEmails]     = useState<EmailCard[]>([])
  const [isLoading,  setIsLoading]  = useState(true)
  const [isSyncing,  setIsSyncing]  = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [error,      setError]      = useState<string | null>(null)

  const unsubRef = useRef<(() => void) | null>(null)

  // ── board reload ────────────────────────────────────────────────────────────

  const reload = useCallback(async () => {
    try {
      const board = await cardsService.getBoard()
      const all = [
        ...board.decide.map(boardCardToEmailCard),
        ...board.review.map(boardCardToEmailCard),
        ...board.ready.map(boardCardToEmailCard),
      ]
      setEmails(all)
      setLastSynced(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── SSE + 2-min auto-refresh ────────────────────────────────────────────────

  useEffect(() => {
    reload()

    // Kick off a sync every 2 minutes — backend triages new emails,
    // SSE sync.completed event triggers a board reload when done
    const interval = setInterval(() => {
      syncService.kickoff().catch(console.error)
    }, SYNC_INTERVAL_MS)

    unsubRef.current = createEventStream({
      "sync.started":   ()                       => setIsSyncing(true),
      "sync.completed": ()                       => { setIsSyncing(false); reload() },
      "card.created":   ()                       => reload(),
      "card.updated":   ({ threadId, column })   => {
        if (column === "hidden") {
          setEmails(prev => prev.filter(e => e.thread.id !== threadId))
          return
        }
        setEmails(prev => prev.map(e =>
          e.thread.id === threadId ? { ...e, state: column as Status } : e,
        ))
      },
      "draft.chunk":  ({ threadId, token })      => appendDraftChunk(threadId, token),
      "draft.ready":  ({ threadId })             => {
        setEmails(prev => prev.map(e =>
          e.thread.id === threadId && !e.draft
            ? { ...e, draft: { body: "", generatedAt: "Just now" } }
            : e,
        ))
      },
    })

    return () => {
      clearInterval(interval)
      unsubRef.current?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── actions ─────────────────────────────────────────────────────────────────

  const refresh = useCallback(() => {
    reload()
  }, [reload])

  const loadDetail = useCallback(async (threadId: string) => {
    try {
      const detail = await cardsService.getCard(threadId)
      setEmails(prev => prev.map(e =>
        e.thread.id === threadId ? upgradeWithDetail(e, detail) : e,
      ))
    } catch (err) {
      console.error("[useBoard] loadDetail failed", err)
    }
  }, [])

  const moveCard = useCallback((threadId: string, column: BoardColumn) => {
    if (column === "hidden") {
      setEmails(prev => prev.filter(e => e.thread.id !== threadId))
    } else {
      setEmails(prev => prev.map(e =>
        e.thread.id === threadId ? { ...e, state: column as Status } : e,
      ))
    }
    cardsService.moveCard(threadId, column).catch(err => {
      console.error("[useBoard] moveCard failed", err)
      reload()
    })
  }, [reload])

  const hideCard = useCallback((threadId: string) => {
    setEmails(prev => prev.filter(e => e.thread.id !== threadId))
    cardsService.hideCard(threadId).catch(err => {
      console.error("[useBoard] hideCard failed", err)
      reload()
    })
  }, [reload])

  function appendDraftChunk(threadId: string, token: string) {
    setEmails(prev => prev.map(e => {
      if (e.thread.id !== threadId) return e
      const currentBody = e.draft?.body ?? ""
      return {
        ...e,
        draft: { body: currentBody + token, generatedAt: e.draft?.generatedAt ?? "Streaming…" },
      }
    }))
  }

  return {
    emails, isLoading, isSyncing, lastSynced, error,
    reload, refresh, loadDetail, moveCard, hideCard, appendDraftChunk,
  }
}
