export interface Meeting {
  id: string
  title: string
  date: Date
  time: string
  duration: string
  attendees: { name: string; initials: string }[]
  brief: string
  isNext?: boolean
}

export interface Transaction {
  id: string
  label: string
  source: string
  amount: number
  date: string
  category: "salary" | "freelance" | "refund" | "transfer" | "subscription" | "shopping" | "utilities" | "travel" | "food" | "other"
}

export interface UpcomingPayment {
  id: string
  label: string
  amount: number
  dueIn: string
  dueDate: string
  type: "rent" | "subscription" | "invoice" | "loan" | "insurance" | "utility"
  urgent: boolean
}

export interface SpendCategory {
  label: string
  amount: number
  color: string
}

// ── Meetings ────────────────────────────────────────────────────────────────

const d = (offset: number, h: number, m = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  date.setHours(h, m, 0, 0)
  return date
}

export const MEETINGS: Meeting[] = [
  // Today
  {
    id: "m1",
    title: "Q4 Budget Review",
    date: d(0, 10),
    time: "10:00 AM",
    duration: "45 min",
    attendees: [
      { name: "Sarah Mitchell", initials: "SM" },
      { name: "Jordan Park", initials: "JP" },
    ],
    brief: "Sarah needs sign-off on 3 line items before Friday — infra overage, contractor invoices, and monitoring tooling. She sent the spreadsheet this morning.",
    isNext: true,
  },
  {
    id: "m2",
    title: "Investor Check-in · Marcus Webb",
    date: d(0, 14),
    time: "2:00 PM",
    duration: "30 min",
    attendees: [{ name: "Marcus Webb", initials: "MW" }],
    brief: "Follow-up on the seed term sheet. Marcus emailed questions about the ESOP pool and the convertible note cap — he wants answers before closing their investment decision this month.",
  },
  {
    id: "m3",
    title: "Brand Assets Walkthrough",
    date: d(0, 16, 30),
    time: "4:30 PM",
    duration: "30 min",
    attendees: [{ name: "Liam Torres", initials: "LT" }],
    brief: "Liam finished the logo suite, icon set, and color tokens. He needs your approval by Wednesday so he can start the component library next week.",
  },
  // Tomorrow
  {
    id: "m4",
    title: "Engineering Standup",
    date: d(1, 9, 30),
    time: "9:30 AM",
    duration: "15 min",
    attendees: [
      { name: "Sam Rivera", initials: "SR" },
      { name: "Morgan Lee", initials: "ML" },
      { name: "Jordan Park", initials: "JP" },
    ],
    brief: "Daily standup. Sam is unblocked on the inbox UI, Morgan flagged a blocker on the auth migration — needs a decision on the provider before EOD.",
  },
  {
    id: "m5",
    title: "Partnership Scoping · Priya Nair",
    date: d(1, 15),
    time: "3:00 PM",
    duration: "30 min",
    attendees: [{ name: "Priya Nair", initials: "PN" }],
    brief: "Priya from PartnerHQ wants to scope a bi-directional email sync integration. She followed up after SaaStr — this is the first real scoping call.",
  },
  // Day after tomorrow
  {
    id: "m6",
    title: "Product Review · May Sprint",
    date: d(2, 11),
    time: "11:00 AM",
    duration: "60 min",
    attendees: [
      { name: "Sam Rivera", initials: "SR" },
      { name: "Alex Chen", initials: "AC" },
    ],
    brief: "End-of-sprint review. Inbox UI and auth migration are the two items to demo. Alex has feedback on the dark mode PR — she left comments in the thread yesterday.",
  },
  // +4 days
  {
    id: "m7",
    title: "1:1 with Jordan",
    date: d(4, 10),
    time: "10:00 AM",
    duration: "30 min",
    attendees: [{ name: "Jordan Park", initials: "JP" }],
    brief: "Regular 1:1. Jordan mentioned in Slack he wants to talk about the component library ownership — he's been driving it solo and wants a clearer mandate.",
  },
  // +5 days
  {
    id: "m8",
    title: "Seed Round Prep",
    date: d(5, 14),
    time: "2:00 PM",
    duration: "90 min",
    attendees: [
      { name: "Marcus Webb", initials: "MW" },
      { name: "Sarah Mitchell", initials: "SM" },
    ],
    brief: "Pre-close working session with Marcus. Bring answers on ESOP pool (pre vs post), the angel convertible note cap, and pro-rata rights. Sarah is joining for the financials portion.",
  },
  // +7 days
  {
    id: "m9",
    title: "Design System Handoff",
    date: d(7, 13),
    time: "1:00 PM",
    duration: "45 min",
    attendees: [{ name: "Liam Torres", initials: "LT" }],
    brief: "Liam is handing off the final component library. He'll walk through the Figma tokens and the updated icon set. This should be the last design review before implementation.",
  },
  // +10 days — busy day with 15 meetings
  { id: "m10", title: "Engineering Standup", date: d(10, 9, 0), time: "9:00 AM", duration: "15 min", attendees: [{ name: "Sam Rivera", initials: "SR" }, { name: "Morgan Lee", initials: "ML" }], brief: "Daily standup. Blocking issues: auth migration needs a decision on session token storage strategy before the team can proceed." },
  { id: "m11", title: "Infra Cost Review", date: d(10, 9, 30), time: "9:30 AM", duration: "30 min", attendees: [{ name: "Jordan Park", initials: "JP" }], brief: "AWS bill came in 40% over forecast. Jordan pulled the breakdown — most of it is data transfer costs from the new CDN setup. Needs a decision on caching strategy." },
  { id: "m12", title: "Auth Migration Sync", date: d(10, 10, 0), time: "10:00 AM", duration: "45 min", attendees: [{ name: "Morgan Lee", initials: "ML" }, { name: "Alex Chen", initials: "AC" }], brief: "Morgan hit a blocker — the new auth provider doesn't support silent refresh the same way. Alex has a workaround but it needs sign-off before they implement." },
  { id: "m13", title: "Customer Call · Ravi Shankar", date: d(10, 11, 0), time: "11:00 AM", duration: "30 min", attendees: [{ name: "Ravi Shankar", initials: "RS" }], brief: "Ravi is an early beta user running a 12-person ops team. He emailed yesterday about wanting bulk actions in the inbox view — worth understanding the exact workflow." },
  { id: "m14", title: "Lunch with Priya", date: d(10, 12, 30), time: "12:30 PM", duration: "60 min", attendees: [{ name: "Priya Nair", initials: "PN" }], brief: "Informal lunch to discuss the PartnerHQ integration scope ahead of the formal scoping call. Priya mentioned she wants to understand the data model first." },
  { id: "m15", title: "Legal Review · Terms of Service", date: d(10, 14, 0), time: "2:00 PM", duration: "45 min", attendees: [{ name: "Anika Mehra", initials: "AM" }], brief: "Anika flagged three clauses in the ToS that need updating before launch — data retention, AI processing disclosure, and the arbitration clause. Sent redlines yesterday." },
  { id: "m16", title: "Investor Update · Webb Ventures", date: d(10, 14, 30), time: "2:30 PM", duration: "30 min", attendees: [{ name: "Marcus Webb", initials: "MW" }], brief: "Monthly investor update. Marcus wants MRR, churn, and a product roadmap snapshot. Prepare the deck from last month's template and update the metrics." },
  { id: "m17", title: "Design Critique", date: d(10, 15, 0), time: "3:00 PM", duration: "45 min", attendees: [{ name: "Liam Torres", initials: "LT" }, { name: "Sam Rivera", initials: "SR" }], brief: "Liam presenting three directions for the card redesign. Sam has strong opinions about information density — likely a long one." },
  { id: "m18", title: "Onboarding Flow Review", date: d(10, 15, 30), time: "3:30 PM", duration: "30 min", attendees: [{ name: "Alex Chen", initials: "AC" }], brief: "Alex redesigned the onboarding flow after user testing showed 60% drop-off at step 3. New flow removes the Gmail auth step from the critical path." },
  { id: "m19", title: "API Docs Walkthrough", date: d(10, 16, 0), time: "4:00 PM", duration: "30 min", attendees: [{ name: "Jordan Park", initials: "JP" }], brief: "Jordan finished the OpenAPI spec for v2. Needs a review before publishing — specifically the webhook event schema which changed significantly from v1." },
  { id: "m20", title: "Hiring Panel · Backend Engineer", date: d(10, 16, 30), time: "4:30 PM", duration: "60 min", attendees: [{ name: "Morgan Lee", initials: "ML" }, { name: "Sarah Mitchell", initials: "SM" }], brief: "Final round interview for the senior backend role. Candidate is strong on distributed systems. Morgan is leading the technical portion, Sarah is doing the culture fit section." },
  { id: "m21", title: "Board Prep", date: d(10, 17, 30), time: "5:30 PM", duration: "45 min", attendees: [{ name: "Sarah Mitchell", initials: "SM" }], brief: "Prep session for next week's board meeting. Sarah is putting together the financial summary. Need to align on the narrative around slower growth in April before the deck goes out." },
  { id: "m22", title: "Q3 Roadmap Planning", date: d(10, 18, 0), time: "6:00 PM", duration: "60 min", attendees: [{ name: "Sam Rivera", initials: "SR" }, { name: "Alex Chen", initials: "AC" }, { name: "Morgan Lee", initials: "ML" }], brief: "First pass at Q3 priorities. Three competing bets: deepen the Gmail integration, build the mobile app, or focus on team/multi-user support. Need to pick one and go deep." },
  { id: "m23", title: "Security Audit Readout", date: d(10, 18, 30), time: "6:30 PM", duration: "30 min", attendees: [{ name: "Anika Mehra", initials: "AM" }, { name: "Jordan Park", initials: "JP" }], brief: "Anika's team finished the dependency audit. Two critical CVEs flagged — both in dev dependencies, but one could affect the build pipeline. Jordan needs to patch before next deploy." },
  { id: "m24", title: "End-of-Day Sync", date: d(10, 19, 0), time: "7:00 PM", duration: "15 min", attendees: [{ name: "Sam Rivera", initials: "SR" }], brief: "Quick EOD check-in with Sam. Usually a 10-minute verbal standup on blockers, what shipped, and what's carrying over to tomorrow." },
]

export function getMeetingsForDate(date: Date): Meeting[] {
  return MEETINGS.filter(
    (m) =>
      m.date.getFullYear() === date.getFullYear() &&
      m.date.getMonth() === date.getMonth() &&
      m.date.getDate() === date.getDate(),
  )
}

export function getDatesWithMeetings(): Date[] {
  const seen = new Set<string>()
  return MEETINGS.reduce<Date[]>((acc, m) => {
    const key = m.date.toDateString()
    if (!seen.has(key)) {
      seen.add(key)
      acc.push(new Date(m.date.getFullYear(), m.date.getMonth(), m.date.getDate()))
    }
    return acc
  }, [])
}

// ── Per-month financial data ──────────────────────────────────────────────────

export interface MonthFinance {
  incoming: Transaction[]
  outgoing: Transaction[]
  upcoming: UpcomingPayment[]
  spendCategories: SpendCategory[]
}

const FINANCE_BY_MONTH: Record<string, MonthFinance> = {
  "2026-05": {
    incoming: [
      { id: "i1", label: "Salary — May", source: "Acme Corp Payroll", amount: 8500, date: "May 1", category: "salary" },
      { id: "i2", label: "Client invoice paid", source: "PartnerHQ Ltd", amount: 3200, date: "Apr 29", category: "freelance" },
      { id: "i3", label: "AWS credits refund", source: "Amazon Web Services", amount: 420, date: "Apr 27", category: "refund" },
      { id: "i4", label: "Stripe payout", source: "Stripe Payments", amount: 1140, date: "Apr 25", category: "freelance" },
      { id: "i5", label: "Security deposit return", source: "Previous Landlord", amount: 2000, date: "Apr 20", category: "transfer" },
    ],
    outgoing: [
      { id: "o1", label: "Figma", source: "figma.com", amount: 15, date: "May 1", category: "subscription" },
      { id: "o2", label: "Linear", source: "linear.app", amount: 8, date: "May 1", category: "subscription" },
      { id: "o3", label: "Vercel Pro", source: "vercel.com", amount: 20, date: "Apr 30", category: "subscription" },
      { id: "o4", label: "Amazon order · 3 items", source: "amazon.in", amount: 3240, date: "Apr 28", category: "shopping" },
      { id: "o5", label: "Electricity bill", source: "BESCOM", amount: 1840, date: "Apr 26", category: "utilities" },
      { id: "o6", label: "Zomato orders · 4 this week", source: "zomato.com", amount: 1260, date: "Apr 25", category: "food" },
      { id: "o7", label: "Notion", source: "notion.so", amount: 8, date: "Apr 24", category: "subscription" },
    ],
    upcoming: [
      { id: "u1", label: "Rent — June", amount: 28000, dueIn: "3 days", dueDate: "May 5", type: "rent", urgent: true },
      { id: "u2", label: "GitHub Copilot", amount: 10, dueIn: "5 days", dueDate: "May 7", type: "subscription", urgent: false },
      { id: "u3", label: "Google Workspace", amount: 840, dueIn: "8 days", dueDate: "May 10", type: "subscription", urgent: false },
      { id: "u4", label: "Invoice #INV-0042 due", amount: 45000, dueIn: "10 days", dueDate: "May 12", type: "invoice", urgent: false },
      { id: "u5", label: "Car insurance renewal", amount: 12400, dueIn: "14 days", dueDate: "May 16", type: "insurance", urgent: false },
      { id: "u6", label: "Postmark email API", amount: 1200, dueIn: "18 days", dueDate: "May 20", type: "subscription", urgent: false },
    ],
    spendCategories: [
      { label: "Subscriptions", amount: 51, color: "bg-primary" },
      { label: "Shopping", amount: 3240, color: "bg-muted-foreground/40" },
      { label: "Food", amount: 1260, color: "bg-muted-foreground/25" },
      { label: "Utilities", amount: 1840, color: "bg-muted-foreground/15" },
    ],
  },
  "2026-04": {
    incoming: [
      { id: "i1", label: "Salary — April", source: "Acme Corp Payroll", amount: 8500, date: "Apr 1", category: "salary" },
      { id: "i2", label: "Freelance project", source: "Designlabs Studio", amount: 5500, date: "Mar 28", category: "freelance" },
      { id: "i3", label: "Stripe payout", source: "Stripe Payments", amount: 870, date: "Mar 22", category: "freelance" },
    ],
    outgoing: [
      { id: "o1", label: "Figma", source: "figma.com", amount: 15, date: "Apr 1", category: "subscription" },
      { id: "o2", label: "Linear", source: "linear.app", amount: 8, date: "Apr 1", category: "subscription" },
      { id: "o3", label: "Flight to Mumbai", source: "Indigo Airlines", amount: 4200, date: "Mar 30", category: "travel" },
      { id: "o4", label: "Hotel · 2 nights", source: "Taj Lands End", amount: 9800, date: "Mar 29", category: "travel" },
      { id: "o5", label: "Electricity bill", source: "BESCOM", amount: 1650, date: "Mar 26", category: "utilities" },
      { id: "o6", label: "Grocery & dining", source: "Various", amount: 3100, date: "Mar 24", category: "food" },
    ],
    upcoming: [
      { id: "u1", label: "Rent — May", amount: 28000, dueIn: "2 days", dueDate: "Apr 5", type: "rent", urgent: true },
      { id: "u2", label: "Vercel Pro", amount: 20, dueIn: "6 days", dueDate: "Apr 9", type: "subscription", urgent: false },
      { id: "u3", label: "Q1 advance tax", amount: 18000, dueIn: "15 days", dueDate: "Apr 18", type: "loan", urgent: false },
    ],
    spendCategories: [
      { label: "Travel", amount: 14000, color: "bg-primary" },
      { label: "Food", amount: 3100, color: "bg-muted-foreground/40" },
      { label: "Utilities", amount: 1650, color: "bg-muted-foreground/25" },
      { label: "Subscriptions", amount: 23, color: "bg-muted-foreground/15" },
    ],
  },
  "2026-03": {
    incoming: [
      { id: "i1", label: "Salary — March", source: "Acme Corp Payroll", amount: 8500, date: "Mar 1", category: "salary" },
      { id: "i2", label: "Invoice #INV-0038 paid", source: "BuildCo Inc", amount: 12000, date: "Feb 27", category: "freelance" },
    ],
    outgoing: [
      { id: "o1", label: "Figma", source: "figma.com", amount: 15, date: "Mar 1", category: "subscription" },
      { id: "o2", label: "MacBook Pro repair", source: "Apple Service Centre", amount: 8400, date: "Feb 28", category: "shopping" },
      { id: "o3", label: "Electricity bill", source: "BESCOM", amount: 1420, date: "Feb 25", category: "utilities" },
      { id: "o4", label: "Swiggy + Zomato", source: "Various", amount: 2200, date: "Feb 22", category: "food" },
      { id: "o5", label: "Adobe CC", source: "adobe.com", amount: 540, date: "Feb 20", category: "subscription" },
    ],
    upcoming: [
      { id: "u1", label: "Rent — April", amount: 28000, dueIn: "4 days", dueDate: "Mar 5", type: "rent", urgent: true },
      { id: "u2", label: "Domain renewals · 3", amount: 3600, dueIn: "12 days", dueDate: "Mar 13", type: "subscription", urgent: false },
    ],
    spendCategories: [
      { label: "Shopping", amount: 8400, color: "bg-primary" },
      { label: "Food", amount: 2200, color: "bg-muted-foreground/40" },
      { label: "Utilities", amount: 1420, color: "bg-muted-foreground/25" },
      { label: "Subscriptions", amount: 555, color: "bg-muted-foreground/15" },
    ],
  },
  "2026-06": {
    incoming: [
      { id: "i1", label: "Salary — June", source: "Acme Corp Payroll", amount: 8500, date: "Jun 1", category: "salary" },
      { id: "i2", label: "Stripe payout", source: "Stripe Payments", amount: 2340, date: "May 30", category: "freelance" },
    ],
    outgoing: [
      { id: "o1", label: "Figma", source: "figma.com", amount: 15, date: "Jun 1", category: "subscription" },
      { id: "o2", label: "Annual domain renewal", source: "namecheap.com", amount: 1200, date: "May 31", category: "subscription" },
      { id: "o3", label: "Electricity bill", source: "BESCOM", amount: 2100, date: "May 28", category: "utilities" },
      { id: "o4", label: "Team offsite dinner", source: "ITC Windsor", amount: 6800, date: "May 26", category: "food" },
    ],
    upcoming: [
      { id: "u1", label: "Rent — July", amount: 28000, dueIn: "5 days", dueDate: "Jun 5", type: "rent", urgent: true },
      { id: "u2", label: "LinkedIn Premium", amount: 2600, dueIn: "9 days", dueDate: "Jun 9", type: "subscription", urgent: false },
      { id: "u3", label: "Invoice #INV-0045 due", amount: 35000, dueIn: "20 days", dueDate: "Jun 20", type: "invoice", urgent: false },
    ],
    spendCategories: [
      { label: "Food", amount: 6800, color: "bg-primary" },
      { label: "Utilities", amount: 2100, color: "bg-muted-foreground/40" },
      { label: "Subscriptions", amount: 1215, color: "bg-muted-foreground/25" },
    ],
  },
}

const FALLBACK_FINANCE: MonthFinance = {
  incoming: [],
  outgoing: [],
  upcoming: [],
  spendCategories: [],
}

export function getFinanceForMonth(date: Date): MonthFinance {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  return FINANCE_BY_MONTH[key] ?? FALLBACK_FINANCE
}

// ── Packages ─────────────────────────────────────────────────────────────────

export interface TrackingEvent {
  label: string
  location?: string
  time: string
  completed: boolean
}

export interface Package {
  id: string
  item: string
  carrier: string
  eta?: string
  events: TrackingEvent[]
}

export function getLatestEvent(pkg: Package): TrackingEvent {
  return [...pkg.events].reverse().find(e => e.completed) ?? pkg.events[0]
}

export function isDelivered(pkg: Package): boolean {
  return pkg.events.at(-1)?.completed === true && pkg.events.at(-1)?.label.toLowerCase().includes("deliver") === true
}

const PACKAGES_BY_MONTH: Record<string, Package[]> = {
  "2026-05": [
    {
      id: "p1",
      item: "Logitech MX Keys Mini",
      carrier: "FedEx",
      eta: "Today by 8 PM",
      events: [
        { label: "Order placed", time: "Apr 30, 9:14 AM", completed: true },
        { label: "Picked up by FedEx", location: "Bangalore hub", time: "May 1, 3:45 PM", completed: true },
        { label: "Departed facility", location: "Bangalore International", time: "May 1, 11:30 PM", completed: true },
        { label: "Arrived at local facility", location: "Koramangala sorting", time: "May 2, 6:20 AM", completed: true },
        { label: "Out for delivery", location: "Koramangala", time: "May 2, 8:55 AM", completed: true },
        { label: "Delivered", location: "Front door", time: "Expected by 8 PM", completed: false },
      ],
    },
    {
      id: "p2",
      item: "2× items from Amazon",
      carrier: "Amazon Logistics",
      eta: "Tomorrow",
      events: [
        { label: "Order confirmed", time: "May 1, 11:02 AM", completed: true },
        { label: "Packed at fulfillment centre", location: "Amazon FC, Hyderabad", time: "May 1, 7:30 PM", completed: true },
        { label: "In transit", location: "Hyderabad → Bangalore", time: "May 2, 2:10 AM", completed: true },
        { label: "Out for delivery", time: "Expected May 3", completed: false },
        { label: "Delivered", time: "Expected May 3", completed: false },
      ],
    },
  ],
  "2026-04": [
    {
      id: "p3",
      item: "Sony WH-1000XM5 Headphones",
      carrier: "Amazon Logistics",
      events: [
        { label: "Order confirmed", time: "Apr 10, 10:30 AM", completed: true },
        { label: "Packed at fulfillment centre", location: "Amazon FC, Chennai", time: "Apr 10, 6:00 PM", completed: true },
        { label: "In transit", location: "Chennai → Bangalore", time: "Apr 11, 3:15 AM", completed: true },
        { label: "Out for delivery", location: "Indiranagar", time: "Apr 12, 9:00 AM", completed: true },
        { label: "Delivered", location: "Received by resident", time: "Apr 12, 1:44 PM", completed: true },
      ],
    },
    {
      id: "p4",
      item: "Standing desk mat",
      carrier: "Delhivery",
      events: [
        { label: "Shipment booked", time: "Apr 6, 2:00 PM", completed: true },
        { label: "Picked up", location: "Seller warehouse, Pune", time: "Apr 7, 10:30 AM", completed: true },
        { label: "In transit", location: "Pune → Bangalore", time: "Apr 7, 8:00 PM", completed: true },
        { label: "Delivered", location: "Left at door", time: "Apr 8, 4:12 PM", completed: true },
      ],
    },
    {
      id: "p5",
      item: "HDMI 2.1 cable × 2",
      carrier: "BlueDart",
      events: [
        { label: "Shipment created", time: "Apr 2, 3:30 PM", completed: true },
        { label: "In transit", location: "Mumbai → Bangalore", time: "Apr 2, 10:00 PM", completed: true },
        { label: "Arrived at Bangalore hub", time: "Apr 3, 7:15 AM", completed: true },
        { label: "Out for delivery", time: "Apr 3, 10:00 AM", completed: true },
        { label: "Delivered", location: "Signed by Anurag", time: "Apr 3, 2:30 PM", completed: true },
      ],
    },
  ],
  "2026-03": [
    {
      id: "p6",
      item: "iPad Pro M4 + Pencil",
      carrier: "Apple Express",
      events: [
        { label: "Order placed", time: "Mar 20, 8:00 AM", completed: true },
        { label: "Prepared for shipment", location: "Apple Store, Mumbai", time: "Mar 21, 11:00 AM", completed: true },
        { label: "In transit", location: "Mumbai → Bangalore", time: "Mar 21, 6:00 PM", completed: true },
        { label: "Out for delivery", time: "Mar 22, 9:30 AM", completed: true },
        { label: "Delivered", location: "Signed by resident", time: "Mar 22, 12:05 PM", completed: true },
      ],
    },
    {
      id: "p7",
      item: "Keychron K2 keyboard",
      carrier: "FedEx",
      events: [
        { label: "Order confirmed", time: "Mar 12, 4:00 PM", completed: true },
        { label: "Picked up", location: "Keychron warehouse, Shanghai", time: "Mar 13, 9:00 AM", completed: true },
        { label: "Customs clearance", location: "Chennai Air Cargo", time: "Mar 14, 2:30 PM", completed: true },
        { label: "In transit", location: "Chennai → Bangalore", time: "Mar 14, 8:00 PM", completed: true },
        { label: "Delivered", location: "Front door", time: "Mar 15, 11:20 AM", completed: true },
      ],
    },
  ],
  "2026-06": [],
}

export function getPackagesForMonth(date: Date): Package[] {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  return PACKAGES_BY_MONTH[key] ?? []
}
