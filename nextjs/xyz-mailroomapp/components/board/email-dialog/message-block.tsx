"use client"

import type { gmail_v1 } from "googleapis"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getFrom, getToList, getDateLabel } from "../helpers/headers"
import { getBody } from "../helpers/body"
import { relativeTime } from "../helpers/time"

interface MessageBlockProps {
  message: gmail_v1.Schema$Message
  expanded: boolean
  onToggle: () => void
  isLatest: boolean
}

export function MessageBlock({ message, expanded, onToggle, isLatest }: MessageBlockProps) {
  const from = getFrom(message)
  const to   = getToList(message)
  const date = getDateLabel(message)
  const body = getBody(message)
  const snippet = message.snippet ?? body.split("\n").find(l => l.trim()) ?? ""

  const recipientLabel = to.length === 0
    ? ""
    : to.length === 1
    ? to[0].email
    : `${to[0].email} +${to.length - 1}`

  return (
    <div className={cn(
      "rounded-lg border transition-colors",
      expanded ? "border-border bg-card" : "border-border/60 bg-muted/30 hover:bg-muted/50",
    )}>
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <Avatar size="sm" className="mt-0.5 shrink-0">
          <AvatarFallback className="text-[10px]">{from.initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{from.name}</span>
            <span className="truncate text-[11px] text-muted-foreground/50">
              &lt;{from.email}&gt;
            </span>
            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground/50 tabular-nums">
              {relativeTime(date)}
            </span>
          </div>
          {expanded ? (
            <span className="text-[11px] text-muted-foreground/50">to {recipientLabel}</span>
          ) : (
            <span className="line-clamp-1 text-xs text-muted-foreground/60">{snippet}</span>
          )}
        </div>
        {!isLatest && (
          <ChevronDown className={cn(
            "mt-1 size-3.5 shrink-0 text-muted-foreground/40 transition-transform",
            expanded && "rotate-180",
          )} />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border/60 px-4 py-3">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
            {body}
          </pre>
        </div>
      )}
    </div>
  )
}
