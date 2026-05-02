"use client"

import { useState, useEffect } from "react"
import { Sparkles, MailOpen, ChevronRight, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { EmailCard } from "../types/email"
import { getFrom } from "../helpers/headers"
import { getLatestMessage, getThreadSubject } from "../helpers/thread"
import { ThreadView } from "./thread-view"

interface EmailDialogProps {
  email: EmailCard | null
  onClose: () => void
  onDraft: (id: string) => void
  onArchive: (id: string) => void
  onSend: (id: string) => void
}

export function EmailDialog({ email, onClose, onDraft, onArchive, onSend }: EmailDialogProps) {
  const [body, setBody] = useState("")
  const [feedback, setFeedback] = useState("")
  const [showThread, setShowThread] = useState(true)

  useEffect(() => {
    if (email) {
      setBody(email.draft?.body ?? "")
      setFeedback("")
      setShowThread(email.state === "decide")
    }
  }, [email])

  if (!email) return null

  const isReview     = email.state === "review"
  const messages     = email.thread.messages ?? []
  const latest       = getLatestMessage(email.thread)
  const latestSender = getFrom(latest)
  const subject      = getThreadSubject(email.thread)
  const threadId     = email.thread.id ?? ""

  function sendFeedback() {
    if (!feedback.trim()) return
    onClose()
  }

  return (
    <Dialog open={!!email} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[80vh] w-[80vw] !max-w-5xl flex-col !gap-0 !p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border px-6 py-4">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <DialogTitle className="text-base font-semibold leading-snug">{subject}</DialogTitle>
            <p className="text-xs text-muted-foreground/60 tabular-nums">
              {messages.length} {messages.length === 1 ? "message" : "messages"} in this thread
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="mx-auto max-w-3xl px-8 py-6 flex flex-col gap-6">
            {showThread || !isReview ? (
              <div className="flex flex-col gap-2">
                {isReview && (
                  <button
                    onClick={() => setShowThread(false)}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors self-start"
                  >
                    <ChevronRight className="size-3 rotate-90" />
                    Hide thread
                  </button>
                )}
                <ThreadView thread={email.thread} />
              </div>
            ) : (
              <button
                onClick={() => setShowThread(true)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors self-start"
              >
                <ChevronRight className="size-3" />
                Show thread ({messages.length} {messages.length === 1 ? "message" : "messages"})
              </button>
            )}

            {isReview && (
              <div className="flex flex-col gap-3">
                {/* Draft styled like a thread message */}
                <div className="rounded-lg border border-primary/30 bg-card shadow-sm shadow-primary/5">
                  <div className="flex items-start gap-3 border-b border-primary/15 bg-primary/[0.04] px-4 py-3 rounded-t-lg">
                    <Avatar size="sm" className="mt-0.5 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-[10px] text-primary">AB</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">Anurag Bansal</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-px text-[10px] font-medium text-primary">
                          <Sparkles className="size-2.5" />
                          Drafted by agent
                        </span>
                        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground/50">
                          {email.draft?.generatedAt}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground/60">to {latestSender.email}</span>
                    </div>
                  </div>
                  <Textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={Math.max(6, body.split("\n").length + 1)}
                    className="min-h-0 resize-none rounded-none rounded-b-lg border-0 bg-transparent px-4 py-3 font-sans text-sm leading-relaxed shadow-none focus-visible:ring-0"
                  />
                </div>

                {/* Feedback bar */}
                <div className="flex flex-col gap-1">
                  <div className={cn(
                    "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-colors",
                    "border-border focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/15",
                  )}>
                    <Sparkles className="size-3.5 shrink-0 text-muted-foreground/40" />
                    <input
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFeedback() }
                      }}
                      placeholder="Tell the agent how to adjust this draft…"
                      className="flex-1 bg-transparent text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none"
                    />
                    <Button
                      size="sm"
                      className="h-7 shrink-0 gap-1 px-2.5 text-xs"
                      onClick={sendFeedback}
                      disabled={!feedback.trim()}
                    >
                      <Send className="size-3" />
                      Send to agent
                    </Button>
                  </div>
                  <p className="px-1 text-[10px] text-muted-foreground/40">
                    The agent will revise in the background — you'll see the updated draft on the board when it's ready. Or edit directly above.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-6 py-3">
          {email.state === "decide" ? (
            <>
              <Button
                variant="ghost"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => { onArchive(threadId); onClose() }}
              >
                <MailOpen className="size-3.5" />
                Mark as read
              </Button>
              <Button className="gap-1.5" onClick={() => onDraft(threadId)}>
                <Sparkles className="size-3.5" />
                Draft a reply
              </Button>
            </>
          ) : (
            <>
              <span className="text-xs text-muted-foreground/50">Edits save automatically</span>
              <Button className="gap-1.5" onClick={() => { onSend(threadId); onClose() }}>
                <Send className="size-3.5" />
                Move to Send
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
