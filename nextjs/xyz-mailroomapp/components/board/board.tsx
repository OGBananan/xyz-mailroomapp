"use client"

import { useState, useMemo } from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { BoardSidebar }  from "./board-sidebar"
import { BoardColumn }   from "./board-column"
import { ComposePopup }  from "./compose-popup"
import { EmailDialog }   from "./email-dialog/index"
import { COLUMNS }       from "./config"
import { useBoard }      from "@/hooks/use-board"
import type { EmailCard } from "./types/email"
import type { Status }    from "./types/status"

export function Board() {
  const {
    emails,
    isLoading,
    isSyncing,
    lastSynced,
    refresh,
    loadDetail,
    moveCard,
    hideCard,
    movingThreadId,
  } = useBoard()

  const [openEmailId, setOpenEmailId] = useState<string | null>(null)
  const [composing,   setComposing]   = useState<EmailCard | null>(null)

  const syncLabel = useMemo(() => {
    if (!lastSynced) return "never"
    const minAgo = Math.floor((Date.now() - lastSynced.getTime()) / 60_000)
    return minAgo === 0 ? "just now" : `${minAgo}m ago`
  }, [lastSynced])

  const byColumn = useMemo(() => {
    const out: Record<Status, EmailCard[]> = { decide: [], review: [], ready: [] }
    emails.forEach(e => out[e.state].push(e))
    return out
  }, [emails])

  const openEmail = openEmailId
    ? emails.find(e => e.thread.id === openEmailId) ?? null
    : null

  function handleCardClick(email: EmailCard) {
    if (email.state === "ready") {
      setComposing(email)
    } else {
      const threadId = email.thread.id ?? null
      setOpenEmailId(threadId)
      if (threadId) loadDetail(threadId)
    }
  }

  function handleDraft(threadId: string) {
    moveCard(threadId, "review")
  }

  function handleSend(threadId: string) {
    moveCard(threadId, "ready")
    setOpenEmailId(null)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40 text-foreground">
      <BoardSidebar />

      <div className="flex flex-1 overflow-hidden px-3 py-2 pl-0">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm">

          {/* Header */}
          <header className="flex items-center gap-2 border-b border-border px-5 py-2.5">
            <span className="text-sm font-medium text-foreground">Inbox</span>

            <div className="ml-auto flex items-center gap-2">
              {isLoading ? (
                <span className="text-xs text-muted-foreground/40">Loading…</span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground/40">
                  <span className={cn(
                    "size-1.5 rounded-full transition-colors",
                    isSyncing ? "animate-pulse bg-amber-400" : "bg-green-500",
                  )} />
                  {isSyncing
                    ? "Syncing with Gmail…"
                    : `Synced ${syncLabel} · refreshes every 2 min`}
                </span>
              )}

              <button
                onClick={refresh}
                disabled={isSyncing || isLoading}
                className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <RefreshCw className={cn("size-3", isSyncing && "animate-spin")} />
                Refresh
              </button>
            </div>
          </header>

          {/* Columns */}
          <div className="grid flex-1 grid-cols-3 gap-4 overflow-hidden px-5 pt-4 pb-0">
            {COLUMNS.map(col => (
              <BoardColumn
                key={col.id}
                status={col.id}
                label={col.label}
                description={col.description}
                emails={byColumn[col.id] ?? []}
                movingThreadId={movingThreadId}
                isLoading={isLoading}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </div>
      </div>

      <EmailDialog
        email={openEmail}
        onClose={() => setOpenEmailId(null)}
        onDraft={handleDraft}
        onArchive={(id) => { hideCard(id); setOpenEmailId(null) }}
        onSend={handleSend}
      />

      <ComposePopup
        email={composing}
        onClose={() => setComposing(null)}
        onSent={(id) => { hideCard(id); setComposing(null) }}
      />
    </div>
  )
}
