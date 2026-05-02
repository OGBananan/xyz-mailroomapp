"use client"

import { useState, useRef, useEffect } from "react"
import { Pencil, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StatusIcon } from "./status-icon"
import { BoardCard } from "./board-card"
import type { EmailCard } from "./types/email"
import type { Status } from "./types/status"

interface BoardColumnProps {
  status: Status
  label: string
  description: string
  emails: EmailCard[]
  onCardClick: (email: EmailCard) => void
}

export function BoardColumn({ status, label, description, emails, onCardClick }: BoardColumnProps) {
  const [editing, setEditing] = useState(false)
  const [prompt, setPrompt] = useState(description)
  const [draft, setDraft] = useState(description)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function startEdit() {
    setDraft(prompt)
    setEditing(true)
  }
  function confirm() {
    setPrompt(draft.trim() || prompt)
    setEditing(false)
  }
  function cancel() {
    setDraft(prompt)
    setEditing(false)
  }

  return (
    <div className="flex min-h-0 flex-col gap-0">
      {/* Column header */}
      <div className="group/col flex flex-col gap-1 px-1 pb-3">
        <div className="flex items-center gap-2">
          <StatusIcon status={status} />
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground/50 tabular-nums">{emails.length}</span>
          {!editing && (
            <Button
              variant="ghost"
              className="ml-auto size-6 p-0 text-muted-foreground/30 opacity-0 transition-opacity hover:text-muted-foreground group-hover/col:opacity-100"
              onClick={startEdit}
            >
              <Pencil className="size-3" />
            </Button>
          )}
        </div>

        {editing ? (
          <div className="flex flex-col gap-1.5 pl-[22px]">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); confirm() }
                if (e.key === "Escape") cancel()
              }}
              rows={2}
              className="w-full resize-none rounded-md border border-border bg-muted/50 px-2 py-1.5 text-[11px] text-foreground/80 outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
            />
            <div className="flex gap-1">
              <Button variant="ghost" className="h-5 gap-1 px-1.5 text-[11px] text-muted-foreground hover:text-foreground" onClick={confirm}>
                <Check className="size-3" />Save
              </Button>
              <Button variant="ghost" className="h-5 gap-1 px-1.5 text-[11px] text-muted-foreground hover:text-foreground" onClick={cancel}>
                <X className="size-3" />Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="pl-[22px] text-[11px] text-muted-foreground/40">{prompt}</p>
        )}
      </div>

      {/* Cards */}
      <ScrollArea className="min-h-0 flex-1">
        <div className={cn(
          "flex flex-col gap-1.5 rounded-lg pb-4 pr-2 min-h-16",
          emails.length === 0 && "items-center justify-center pt-6",
        )}>
          {emails.length === 0 ? (
            <p className="text-xs text-muted-foreground/30">No emails</p>
          ) : (
            emails.map(email => (
              <BoardCard
                key={email.thread.id}
                email={email}
                onClick={onCardClick}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
