"use client"

import { useState } from "react"
import type { gmail_v1 } from "googleapis"
import { ChevronDown } from "lucide-react"
import { MessageBlock } from "./message-block"

interface ThreadViewProps {
  thread: gmail_v1.Schema$Thread
}

export function ThreadView({ thread }: ThreadViewProps) {
  const messages = thread.messages ?? []
  const latestId = messages[messages.length - 1]?.id ?? ""
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([latestId]))
  const [showOlder, setShowOlder] = useState(false)

  function toggle(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (messages.length === 0) return null

  const olderMessages = messages.slice(0, -1)
  const latest = messages[messages.length - 1]

  return (
    <div className="flex flex-col gap-2">
      {olderMessages.length > 0 && (
        <>
          {showOlder ? (
            olderMessages.map(m => (
              <MessageBlock
                key={m.id}
                message={m}
                expanded={expandedIds.has(m.id ?? "")}
                onToggle={() => toggle(m.id ?? "")}
                isLatest={false}
              />
            ))
          ) : (
            <button
              onClick={() => setShowOlder(true)}
              className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-2 text-[11px] text-muted-foreground/60 transition-colors hover:border-border hover:bg-muted/30 hover:text-foreground"
            >
              <ChevronDown className="size-3" />
              {olderMessages.length} earlier {olderMessages.length === 1 ? "message" : "messages"}
            </button>
          )}
        </>
      )}
      <MessageBlock
        message={latest}
        expanded={expandedIds.has(latest.id ?? "")}
        onToggle={() => toggle(latest.id ?? "")}
        isLatest
      />
    </div>
  )
}
