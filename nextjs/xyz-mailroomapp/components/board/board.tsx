"use client"

import { useState, useMemo } from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { BoardSidebar } from "./board-sidebar"
import { BoardColumn } from "./board-column"
import { ComposePopup } from "./compose-popup"
import { EmailDialog } from "./email-dialog"
import { COLUMNS, MOCK_EMAILS, type EmailCard, type Status } from "./data"

export function Board() {
  const [emails, setEmails] = useState<EmailCard[]>(MOCK_EMAILS)
  const [openEmailId, setOpenEmailId] = useState<string | null>(null)
  const [composing, setComposing] = useState<EmailCard | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date>(() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - 4)
    return d
  })

  function refresh() {
    if (syncing) return
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setLastSynced(new Date())
    }, 1400)
  }

  const minAgo = Math.floor((Date.now() - lastSynced.getTime()) / 60000)
  const syncLabel = minAgo === 0 ? "just now" : `${minAgo}m ago`

  const byColumn = useMemo(() => {
    const out: Record<Status, EmailCard[]> = { decide: [], review: [], ready: [] }
    emails.forEach(e => out[e.state].push(e))
    return out
  }, [emails])

  // Lookup current email by id so dialog reflects state changes (decide → review)
  const openEmail = openEmailId ? emails.find(e => e.id === openEmailId) ?? null : null

  function handleCardClick(email: EmailCard) {
    if (email.state === "ready") {
      setComposing(email)
    } else {
      setOpenEmailId(email.id)
    }
  }

  function moveTo(id: string, state: Status) {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, state } : e))
  }

  function generateDraft(id: string) {
    setEmails(prev => prev.map(e => e.id === id
      ? {
          ...e,
          state: "review",
          draft: e.draft ?? {
            generatedAt: "Drafted just now",
            body: `Hey ${e.sender.name.split(" ")[0]},\n\nThanks for the note. Quick reply incoming — I'll get back to you with specifics shortly.\n\n- Anurag`,
          },
        }
      : e
    ))
  }

  function removeEmail(id: string) {
    setEmails(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40 text-foreground">
      <BoardSidebar />

      <div className="flex flex-1 overflow-hidden px-3 py-2 pl-0">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <header className="flex items-center gap-2 border-b border-border px-5 py-2.5">
            <span className="text-sm font-medium text-foreground">Agent Tasks</span>

            <div className="ml-auto flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground/40">
                <span className={cn(
                  "size-1.5 rounded-full",
                  syncing ? "animate-pulse bg-amber-400" : "bg-green-500",
                )} />
                {syncing ? "Syncing with Gmail…" : `Synced ${syncLabel} · refreshes every 5 min`}
              </span>
              <button
                onClick={refresh}
                disabled={syncing}
                className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <RefreshCw className={cn("size-3", syncing && "animate-spin")} />
                Refresh
              </button>
            </div>
          </header>

          <div className="grid flex-1 grid-cols-3 gap-4 overflow-hidden px-5 pt-4 pb-0">
            {COLUMNS.map(col => (
              <BoardColumn
                key={col.id}
                status={col.id}
                label={col.label}
                description={col.description}
                emails={byColumn[col.id]}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </div>
      </div>

      <EmailDialog
        email={openEmail}
        onClose={() => setOpenEmailId(null)}
        onDraft={generateDraft}
        onArchive={removeEmail}
        onSend={(id) => { moveTo(id, "ready"); setOpenEmailId(null) }}
      />

      <ComposePopup
        email={composing}
        onClose={() => setComposing(null)}
        onSent={removeEmail}
      />
    </div>
  )
}
