import type { gmail_v1 } from "googleapis"

// ── App-level metadata not in the Gmail wire format ─────────────────────────

export type Status = "decide" | "review" | "ready"

export interface Classification {
  label: string
  confidence: "high" | "low"
  reason: string
}

export interface Draft {
  body: string
  generatedAt: string
  to?: string[]
  cc?: string[]
  bcc?: string[]
  subject?: string
}

export interface EmailCard {
  thread: gmail_v1.Schema$Thread
  classification: Classification
  state: Status
  draft?: Draft
}

// ── Gmail message helpers (operate on Schema$Message) ───────────────────────

export function getHeader(msg: gmail_v1.Schema$Message | undefined, name: string): string {
  return msg?.payload?.headers?.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value ?? ""
}

export interface ParsedAddress {
  name: string
  email: string
  initials: string
}

export function parseAddress(value: string): ParsedAddress {
  // Matches "Name <email@host>" or just "email@host"
  const match = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/)
  if (match) {
    const name = match[1].trim() || match[2]
    return { name, email: match[2].trim(), initials: makeInitials(name) }
  }
  const email = value.trim()
  return { name: email, email, initials: makeInitials(email) }
}

function makeInitials(s: string): string {
  const parts = s.replace(/[<>"]/g, "").trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (parts[0]?.slice(0, 2) ?? "??").toUpperCase()
}

export function getFrom(msg: gmail_v1.Schema$Message | undefined): ParsedAddress {
  return parseAddress(getHeader(msg, "From"))
}

export function getToList(msg: gmail_v1.Schema$Message | undefined): ParsedAddress[] {
  const raw = getHeader(msg, "To")
  if (!raw) return []
  return raw.split(",").map(parseAddress)
}

export function getSubject(msg: gmail_v1.Schema$Message | undefined): string {
  return getHeader(msg, "Subject")
}

export function getDateLabel(msg: gmail_v1.Schema$Message | undefined): string {
  return getHeader(msg, "Date")
}

/** Walk the MIME tree and return the best-effort plain text body. */
export function getBody(msg: gmail_v1.Schema$Message | undefined): string {
  if (!msg?.payload) return ""
  const findText = (part: gmail_v1.Schema$MessagePart): string | undefined => {
    if (part.mimeType === "text/plain" && part.body?.data) return decode(part.body.data)
    if (part.parts) {
      for (const child of part.parts) {
        const found = findText(child)
        if (found) return found
      }
    }
    if (part.body?.data) return decode(part.body.data)
    return undefined
  }
  return findText(msg.payload) ?? ""
}

function decode(data: string): string {
  // Mock data uses plain text; real Gmail uses base64url. Detect and decode if needed.
  if (/^[A-Za-z0-9_-]+={0,2}$/.test(data) && data.length % 4 === 0) {
    try {
      const b64 = data.replace(/-/g, "+").replace(/_/g, "/")
      return typeof atob === "function" ? atob(b64) : data
    } catch {
      return data
    }
  }
  return data
}

// ── Thread helpers ───────────────────────────────────────────────────────────

export function getLatestMessage(thread: gmail_v1.Schema$Thread): gmail_v1.Schema$Message | undefined {
  return thread.messages?.[thread.messages.length - 1]
}

export function getThreadSubject(thread: gmail_v1.Schema$Thread): string {
  return getSubject(thread.messages?.[0]) || getSubject(getLatestMessage(thread))
}

// ── Mock data builder ────────────────────────────────────────────────────────

let messageCounter = 0
const nextMsgId = () => `m-${++messageCounter}`

interface MessageInput {
  from: string
  to: string
  subject?: string
  date: string
  body: string
}

function buildMessage(threadId: string, input: MessageInput): gmail_v1.Schema$Message {
  return {
    id: nextMsgId(),
    threadId,
    snippet: input.body.split("\n").find(l => l.trim())?.slice(0, 120) ?? "",
    payload: {
      mimeType: "text/plain",
      headers: [
        { name: "From", value: input.from },
        { name: "To", value: input.to },
        { name: "Subject", value: input.subject ?? "" },
        { name: "Date", value: input.date },
      ],
      body: { data: input.body, size: input.body.length },
    },
    sizeEstimate: input.body.length,
    labelIds: ["INBOX"],
  }
}

function buildThread(threadId: string, subject: string, messages: Omit<MessageInput, "subject">[]): gmail_v1.Schema$Thread {
  const built = messages.map((m, i) => buildMessage(threadId, {
    ...m,
    // Gmail copies the original subject to all replies; we mimic that
    subject: i === 0 ? subject : `Re: ${subject}`,
  }))
  return {
    id: threadId,
    historyId: "1",
    messages: built,
    snippet: built[built.length - 1].snippet,
  }
}

// ── Mock emails ──────────────────────────────────────────────────────────────

export const MOCK_EMAILS: EmailCard[] = [
  // ── DECIDE ────────────────────────────────────────────────────────────────
  {
    thread: buildThread("t-001", "Q4 budget review — action required", [
      {
        from: "Sarah Mitchell <sarah@acme.com>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Mon, 28 Apr 2025 09:14:00 -0700",
        body: `Hey Anurag,

Heads-up: Q4 budget review starts next week. I'll send you the full spreadsheet on Friday. Anything specific you want me to call out?

Sarah`,
      },
      {
        from: "Anurag Bansal <anurag@mailroom.io>",
        to: "Sarah Mitchell <sarah@acme.com>",
        date: "Mon, 28 Apr 2025 11:32:00 -0700",
        body: `Just the infra overage — I want to understand exactly where the AWS migration costs landed before I sign off.

Anurag`,
      },
      {
        from: "Sarah Mitchell <sarah@acme.com>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Fri, 02 May 2025 09:14:00 -0700",
        body: `Hi Anurag,

I've attached the Q4 budget spreadsheet for your review. A few line items need your sign-off before end of week so we can submit to finance on Friday.

Specifically, I need your approval on:
- Infrastructure scaling costs (line 34) — $42,000 overage from the AWS migration
- Engineering contractor invoices (lines 67–71) — total $18,500 across three vendors
- The new monitoring tooling subscription (line 88) — $3,200/yr, moving from DataDog to Grafana Cloud

Everything else is within the approved budget. If you'd like to jump on a quick call to walk through it, I'm free tomorrow between 2–4pm.

Thanks,
Sarah`,
      },
    ]),
    classification: { label: "Decision needed", confidence: "high", reason: "Sarah is requesting an explicit approval before a hard deadline" },
    state: "decide",
  },

  {
    thread: buildThread("t-002", "Partnership proposal — MailroomApp × PartnerHQ", [
      {
        from: "Priya Nair <priya@partnerhq.com>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Fri, 02 May 2025 08:14:00 -0700",
        body: `Hi Anurag,

Great meeting you at SaaStr last week! As promised, I'm following up with a formal partnership proposal.

We believe there's a strong integration opportunity between MailroomApp and PartnerHQ's workflow automation layer:

1. Bi-directional email sync — surface PartnerHQ tasks directly in your inbox
2. Contact enrichment — auto-enrich sender profiles with CRM data
3. Co-marketing opportunity — joint webinar + blog series targeting RevOps teams

Our partnership team has drafted a one-pager I'd love to walk you through. Would you have 30 minutes this week or next?

Looking forward to it,
Priya Nair
Head of Partnerships, PartnerHQ`,
      },
    ]),
    classification: { label: "Question for you", confidence: "high", reason: "She's asking for 30 minutes on your calendar" },
    state: "decide",
  },

  {
    thread: buildThread("t-003", "Two ToS clauses flagged — your call", [
      {
        from: "Anika Mehra <anika@legal.io>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Fri, 02 May 2025 06:00:00 -0700",
        body: `Hey,

I went through the latest ToS draft and I have concerns on two clauses:

1. Data retention (§4.2) — Currently states we retain user email content for 30 days post-account-closure. With the new EU AI Act compliance requirements, we may need to drop that to 7 days for inference data specifically.

2. Arbitration (§9.1) — The mandatory arbitration clause might not be enforceable in California. Worth getting a second opinion from outside counsel before we lock it in.

Neither is blocking, but I wanted to flag them before I push the redlines to counsel. Want to align on a direction first or should I just send my recommendations?

Anika`,
      },
    ]),
    classification: { label: "Decision needed", confidence: "low", reason: "Could be a heads-up rather than a request — confidence is low" },
    state: "decide",
  },

  {
    thread: buildThread("t-004", "Seed term sheet — questions on cap table", [
      {
        from: "Marcus Webb <marcus@webb.vc>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Tue, 22 Apr 2025 16:30:00 -0700",
        body: `Anurag — really enjoyed the call. Sending over our standard term sheet template later this week so we can move quickly.

Marcus`,
      },
      {
        from: "Marcus Webb <marcus@webb.vc>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Thu, 24 Apr 2025 10:15:00 -0700",
        body: `Term sheet attached. Ping me with any pushback — happy to iterate before our partner meeting next week.

Marcus`,
      },
      {
        from: "Anurag Bansal <anurag@mailroom.io>",
        to: "Marcus Webb <marcus@webb.vc>",
        date: "Fri, 25 Apr 2025 15:00:00 -0700",
        body: `Thanks Marcus. Cap table attached. Let me know if anything looks off — happy to walk through the angel round structure on a call if useful.

Anurag`,
      },
      {
        from: "Marcus Webb <marcus@webb.vc>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Thu, 01 May 2025 14:00:00 -0700",
        body: `Anurag,

Thanks for sending over the cap table. We've reviewed it internally and have a few questions before we can finalize the term sheet.

1. The ESOP pool — is the 10% pre or post-money? Our standard ask is 15% post, but we're flexible given your current ARR trajectory.

2. The existing convertible note from angel round — what's the valuation cap? We'd like to understand potential dilution at conversion.

3. Are there any existing pro-rata rights with your current angels that could complicate the round?

Beyond that, we're very excited about the direction. The AI-native inbox angle is differentiated and the early retention numbers are strong. We're hoping to close our investment decision by end of month.

Best,
Marcus
Webb Ventures`,
      },
    ]),
    classification: { label: "Personal reply expected", confidence: "high", reason: "Direct question from your lead investor" },
    state: "decide",
  },

  // ── REVIEW ────────────────────────────────────────────────────────────────
  {
    thread: buildThread("t-005", "Brand assets ready for review", [
      {
        from: "Anurag Bansal <anurag@mailroom.io>",
        to: "Liam Torres <liam@designstudio.io>",
        date: "Fri, 18 Apr 2025 14:00:00 -0700",
        body: `Hey Liam — kicking off the brand refresh. Want to get the logo, icon set, and color tokens locked before the component library work starts. Can you share a first pass by next Friday?`,
      },
      {
        from: "Liam Torres <liam@designstudio.io>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Tue, 22 Apr 2025 11:00:00 -0700",
        body: `On it. First-pass Figma coming Thursday. Will include three logo directions and a rough icon language.`,
      },
      {
        from: "Liam Torres <liam@designstudio.io>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Fri, 02 May 2025 07:30:00 -0700",
        body: `Hey Anurag,

The updated brand assets are ready for your review! I've finalized the logo suite, icon set, and color palette based on our last call.

Here's what's included:
- Full logo (light + dark variants, SVG + PNG)
- Icon set (48 icons, 24px + 48px)
- Updated color tokens (CSS variables + Figma styles)
- Typography scale (Geist pairing with Playfair for headings)

Figma link: https://figma.com/file/xyz-brand-2025

Let me know if any tweaks are needed. I'm planning to wrap up the component library next week, so ideally getting your thumbs-up by Wednesday works best.

Cheers,
Liam`,
      },
    ]),
    classification: { label: "Personal reply expected", confidence: "high", reason: "Liam is waiting on your sign-off to start the next phase" },
    state: "review",
    draft: {
      generatedAt: "Drafted 1m ago",
      body: `Hey Liam,

These look great — the logo suite is exactly what we needed and the icon set is clean. Two small things:

1. Can the dark variant of the logo have slightly more contrast on the mark? It feels a touch muted on near-black backgrounds.
2. The 24px icon set looks good but I'd love to see the 16px versions too — we use a lot of small chrome icons in the inbox view.

Other than that, ready to greenlight. Go ahead and start the component library work.

Thanks,
Anurag`,
    },
  },

  {
    thread: buildThread("t-006", "PR #47: Add inbox board view", [
      {
        from: "GitHub <noreply@github.com>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Fri, 02 May 2025 04:30:00 -0700",
        body: `sam-rivera opened a pull request in mailroomapp/main

Add inbox board view (#47)

This PR adds the three-column triage board with classification badges, draft generation, and the Gmail-style compose popup. Built with shadcn/ui base-nova components.

Changes:
+ components/board/data.ts
+ components/board/board.tsx
+ components/board/board-card.tsx
+ components/board/compose-popup.tsx

Review requested from: @anurag-bansal
Reviewers: 2 approved, 1 pending

View the full diff at: https://github.com/mailroomapp/main/pull/47`,
      },
    ]),
    classification: { label: "Question for you", confidence: "high", reason: "Sam tagged you for review and the PR is blocking the release" },
    state: "review",
    draft: {
      generatedAt: "Drafted 4m ago",
      body: `Looks solid overall. Two things before merge:

- The column header click handler doesn't preventDefault, which causes a flash on Safari. Easy fix.
- The empty state for 'Ready to Send' should match the others — currently it just says 'No emails' but the others have a subtitle.

Approving with comments. Feel free to ship after addressing those.`,
    },
  },

  // ── READY ─────────────────────────────────────────────────────────────────
  {
    thread: buildThread("t-007", "Onboarding flow — LGTM, ship it", [
      {
        from: "Anurag Bansal <anurag@mailroom.io>",
        to: "Alex Chen <alex@product.io>, Sam Rivera <sam@product.io>",
        date: "Wed, 30 Apr 2025 10:00:00 -0700",
        body: `Final onboarding flow ready for review. Sam pushed the redesign yesterday — drops the Gmail auth out of step 1, simplifies step 3. Drop-off should fix itself.`,
      },
      {
        from: "Alex Chen <alex@product.io>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Thu, 01 May 2025 16:45:00 -0700",
        body: `Anurag,

The new flow looks great. I went through it twice on mobile and once on desktop — the simplified Gmail-auth-first path solves the drop-off issue cleanly.

I left two minor comments in Figma:
- The success state on step 4 could use a bit more breathing room
- The "Skip for now" link on step 2 should be slightly less prominent

Neither is blocking. Approved to ship.

— Alex`,
      },
    ]),
    classification: { label: "Personal reply expected", confidence: "high", reason: "Alex needs a confirmation that you'll address her comments" },
    state: "ready",
    draft: {
      generatedAt: "Drafted 8m ago",
      to: ["alex@product.io"],
      cc: ["sam@product.io"],
      subject: "Re: Onboarding flow — LGTM, ship it",
      body: "Thanks Alex! Sam will fold in your two Figma comments before we deploy. Should be live by EOD tomorrow.\n\n- Anurag",
    },
  },

  {
    thread: buildThread("t-008", "AWS overage — patched", [
      {
        from: "Anurag Bansal <anurag@mailroom.io>",
        to: "Jordan Park <jordan@infra.io>",
        date: "Tue, 29 Apr 2025 09:00:00 -0700",
        body: `Jordan — AWS bill landed 40% over forecast. Most of it looks like data transfer from the CDN. Can you take a look?`,
      },
      {
        from: "Jordan Park <jordan@infra.io>",
        to: "Anurag Bansal <anurag@mailroom.io>",
        date: "Wed, 30 Apr 2025 14:00:00 -0700",
        body: `Anurag,

Patched. Switched the CDN caching policy from the default to a 24h TTL for static assets and a 5min TTL for the API response cache. Already seeing a 60% reduction in data transfer over the last hour.

Should bring us back to baseline by end of week. I'll keep an eye on it.

- Jordan`,
      },
    ]),
    classification: { label: "Personal reply expected", confidence: "high", reason: "Acknowledgement expected on the patch" },
    state: "ready",
    draft: {
      generatedAt: "Drafted 14m ago",
      to: ["jordan@infra.io"],
      subject: "Re: AWS overage — patched",
      body: "Nice work, Jordan. Let's review the new numbers next Monday and update the forecast in the budget doc.\n\n- Anurag",
    },
  },
]

export const COLUMNS: { id: Status; label: string; description: string }[] = [
  { id: "decide", label: "Decide",        description: "Pick what should happen with this email" },
  { id: "review", label: "Review",        description: "Edit the agent's draft" },
  { id: "ready",  label: "Ready to Send", description: "Final check before it goes out" },
]

export function getColumnEmails(status: Status): EmailCard[] {
  return MOCK_EMAILS.filter(e => e.state === status)
}

// ── Relative time formatting ────────────────────────────────────────────────

export function relativeTime(rfc2822Date: string): string {
  if (!rfc2822Date) return ""
  const ts = Date.parse(rfc2822Date)
  if (isNaN(ts)) return rfc2822Date
  const diffMs = Date.now() - ts
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
