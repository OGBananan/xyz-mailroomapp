"use client"

import { useState, useEffect } from "react"
import { Minus, X, Paperclip, Send } from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Input }     from "@/components/ui/input"
import { Textarea }  from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { draftsService }  from "@/services/drafts.service"
import type { EmailCard } from "./types/email"
import { getFrom }                       from "./helpers/headers"
import { getLatestMessage, getThreadSubject } from "./helpers/thread"

interface ComposePopupProps {
  email:   EmailCard | null
  onClose: () => void
  onSent:  (threadId: string) => void
}

export function ComposePopup({ email, onClose, onSent }: ComposePopupProps) {
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [to,        setTo]        = useState("")
  const [cc,        setCc]        = useState("")
  const [bcc,       setBcc]       = useState("")
  const [subject,   setSubject]   = useState("")
  const [body,      setBody]      = useState("")
  const [sending,   setSending]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!email) return
    const sender  = getFrom(getLatestMessage(email.thread))
    const subject = getThreadSubject(email.thread)
    setTo(email.draft?.to?.join(", ") ?? sender.email)
    setCc(email.draft?.cc?.join(", ") ?? "")
    setBcc(email.draft?.bcc?.join(", ") ?? "")
    setSubject(email.draft?.subject ?? `Re: ${subject}`)
    setBody(email.draft?.body ?? "")
    setShowCcBcc(Boolean(email.draft?.cc?.length || email.draft?.bcc?.length))
    setSending(false)
    setError(null)
  }, [email])

  if (!email) return null

  const threadId = email.thread.id ?? ""

  async function handleSend() {
    if (!email || !to.trim() || !body.trim()) return
    setSending(true)
    setError(null)
    try {
      // Save any manual edits to the body first, then send via Gmail
      await draftsService.saveDraft(threadId, body)
      await draftsService.sendDraft(threadId)
      onSent(threadId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send — try again")
      setSending(false)
    }
  }

  const recipientCount =
    to.split(",").filter(Boolean).length +
    cc.split(",").filter(Boolean).length +
    bcc.split(",").filter(Boolean).length

  return (
    <div className="fixed bottom-0 right-6 z-50 flex w-[520px] flex-col rounded-t-lg border border-b-0 border-border bg-card shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 rounded-t-lg bg-foreground px-3 py-2 text-background">
        <span className="flex-1 truncate text-xs font-medium">New message</span>
        <button onClick={onClose} className="rounded p-0.5 text-background/70 hover:bg-background/10 hover:text-background">
          <Minus className="size-3.5" />
        </button>
        <button onClick={onClose} className="rounded p-0.5 text-background/70 hover:bg-background/10 hover:text-background">
          <X className="size-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 border-b border-border px-3 py-1">
          <span className="w-12 shrink-0 text-xs text-muted-foreground/60">To</span>
          <Input
            value={to}
            onChange={e => setTo(e.target.value)}
            className="h-7 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
            placeholder="recipient@example.com"
          />
          {!showCcBcc && (
            <button onClick={() => setShowCcBcc(true)} className="shrink-0 text-[11px] text-muted-foreground/60 hover:text-foreground">
              Cc/Bcc
            </button>
          )}
        </div>

        {showCcBcc && (
          <>
            <div className="flex items-center gap-2 border-b border-border px-3 py-1">
              <span className="w-12 shrink-0 text-xs text-muted-foreground/60">Cc</span>
              <Input value={cc} onChange={e => setCc(e.target.value)} className="h-7 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0" />
            </div>
            <div className="flex items-center gap-2 border-b border-border px-3 py-1">
              <span className="w-12 shrink-0 text-xs text-muted-foreground/60">Bcc</span>
              <Input value={bcc} onChange={e => setBcc(e.target.value)} className="h-7 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0" />
            </div>
          </>
        )}

        <div className="flex items-center gap-2 border-b border-border px-3 py-1">
          <span className="w-12 shrink-0 text-xs text-muted-foreground/60">Subject</span>
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="h-7 border-0 bg-transparent px-0 text-xs font-medium shadow-none focus-visible:ring-0"
          />
        </div>

        <Textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={10}
          className="min-h-[220px] resize-none rounded-none border-0 bg-transparent text-xs leading-relaxed shadow-none focus-visible:ring-0"
          placeholder="Write a reply…"
        />
      </div>

      {/* Footer */}
      <Separator />
      {error && (
        <p className="px-3 py-1 text-[11px] text-red-500">{error}</p>
      )}
      <div className="flex items-center gap-2 px-3 py-2">
        <Button
          onClick={handleSend}
          disabled={sending || !to.trim() || !body.trim()}
          className="h-7 gap-1.5 px-3 text-xs"
        >
          <Send data-icon="inline-start" className="size-3" />
          {sending ? "Sending…" : "Send"}
        </Button>
        <Button variant="ghost" className="size-7 p-0 text-muted-foreground hover:text-foreground">
          <Paperclip className="size-3.5" />
        </Button>
        <span className="ml-auto text-[11px] text-muted-foreground/50 tabular-nums">
          {recipientCount} {recipientCount === 1 ? "recipient" : "recipients"}
        </span>
      </div>
    </div>
  )
}
