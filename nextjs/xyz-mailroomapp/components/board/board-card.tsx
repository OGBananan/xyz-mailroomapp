"use client"

import { Sparkles, AlertTriangle, Send, Edit3, MailOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { EmailCard } from "./types/email"
import { getFrom, getDateLabel } from "./helpers/headers"
import { getLatestMessage, getThreadSubject } from "./helpers/thread"
import { relativeTime } from "./helpers/time"

interface BoardCardProps {
  email: EmailCard
  onClick: (email: EmailCard) => void
}

function ClassificationBadge({ classification }: { classification: EmailCard["classification"] }) {
  const lowConf = classification.confidence === "low"
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "inline-flex w-fit items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
              lowConf
                ? "border-dashed border-muted-foreground/30 text-muted-foreground/60"
                : "border-border bg-secondary text-secondary-foreground",
            )}
          >
            {lowConf
              ? <AlertTriangle className="size-2.5" />
              : <Sparkles className="size-2.5 text-primary" />}
            {classification.label}
          </span>
        }
      />
      <TooltipContent side="top" className="max-w-xs">
        <span className="text-[11px] leading-relaxed">{classification.reason}</span>
      </TooltipContent>
    </Tooltip>
  )
}

function StateBadge({ state }: { state: EmailCard["state"] }) {
  switch (state) {
    case "decide":
      return null
    case "review":
      return (
        <span className="flex items-center gap-1 text-[11px] text-primary">
          <Edit3 className="size-2.5" />
          Draft ready
        </span>
      )
    case "ready":
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-[hsl(142,71%,45%)]">
          <Send className="size-2.5" />
          Ready to send
        </span>
      )
  }
}

export function BoardCard({ email, onClick }: BoardCardProps) {
  const latest = getLatestMessage(email.thread)
  const sender = getFrom(latest)
  const subject = getThreadSubject(email.thread)
  const received = relativeTime(getDateLabel(latest))
  const snippet = latest?.snippet ?? ""

  return (
    <button
      onClick={() => onClick(email)}
      className={cn(
        "group/card flex w-full flex-col gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-left transition-all",
        "hover:border-border/70 hover:shadow-sm hover:shadow-black/5 dark:hover:shadow-black/20",
        email.state === "ready" && "hover:border-[hsl(142,71%,45%)]/30",
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar size="sm" className="mt-0.5 size-6 shrink-0">
          <AvatarFallback className="text-[10px]">{sender.initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-xs font-semibold text-foreground">{sender.name}</span>
            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground/50 tabular-nums">{received}</span>
          </div>
          <span className="line-clamp-2 text-sm leading-snug text-foreground/90">
            {subject}
          </span>
        </div>
      </div>

      {email.state === "decide" && (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/70">
          {snippet}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <ClassificationBadge classification={email.classification} />
        <StateBadge state={email.state} />
      </div>
    </button>
  )
}
