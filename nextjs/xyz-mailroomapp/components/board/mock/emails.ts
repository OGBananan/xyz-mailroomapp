import type { EmailCard } from "../types/email"
import { buildThread } from "./builder"

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
+ components/board/types/email.ts
+ components/board/helpers/
+ components/board/mock/
+ components/board/board.tsx
+ components/board/board-card.tsx
+ components/board/compose-popup.tsx

Review requested from: @anurag-bansal
Reviewers: 2 approved, 1 pending`,
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
