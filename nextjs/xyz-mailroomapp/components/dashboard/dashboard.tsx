"use client"

import { useState, useRef, useEffect } from "react"
import {
  Package,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { BoardSidebar } from "@/components/board/board-sidebar"
import {
  getFinanceForMonth,
  getPackagesForMonth,
  isDelivered,
  getLatestEvent,
  getMeetingsForDate,
  getDatesWithMeetings,
  type Transaction,
  type UpcomingPayment,
  type Meeting,
} from "./data"

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1000
    ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
    : `₹${n}`
}

function CategoryDot({ category }: { category: Transaction["category"] }) {
  const colors: Record<Transaction["category"], string> = {
    salary: "bg-primary",
    freelance: "bg-primary/70",
    refund: "bg-muted-foreground/50",
    transfer: "bg-muted-foreground/40",
    subscription: "bg-muted-foreground/60",
    shopping: "bg-muted-foreground/50",
    utilities: "bg-muted-foreground/40",
    travel: "bg-muted-foreground/30",
    food: "bg-muted-foreground/35",
    other: "bg-muted-foreground/25",
  }
  return <span className={cn("size-1.5 shrink-0 rounded-full", colors[category])} />
}

function PaymentTypeIcon({ type }: { type: UpcomingPayment["type"] }) {
  const colors: Record<UpcomingPayment["type"], string> = {
    rent: "text-destructive",
    invoice: "text-destructive/70",
    insurance: "text-muted-foreground",
    subscription: "text-muted-foreground/70",
    loan: "text-muted-foreground",
    utility: "text-muted-foreground/70",
  }
  return <CalendarClock className={cn("size-3.5 shrink-0", colors[type])} />
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
  className,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
          {title}
        </h2>
        {subtitle && (
          <span className="text-xs text-muted-foreground/40">{subtitle}</span>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Meeting card ──────────────────────────────────────────────────────────────

function MeetingCard({ m }: { m: Meeting }) {
  return (
    <div
      className={cn(
        "relative flex gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-all",
        "hover:border-border/60 hover:shadow-sm hover:shadow-black/5 dark:hover:shadow-black/20",
        m.isNext && "border-primary/20 bg-primary/[0.03]",
      )}
    >
      {m.isNext && (
        <span className="absolute top-3 right-3">
          <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal">
            Next
          </Badge>
        </span>
      )}
      <div className="flex w-14 shrink-0 flex-col gap-0.5 pt-0.5">
        <span className="text-sm font-medium tabular-nums text-foreground">{m.time}</span>
        <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground/50">
          <Clock className="size-2.5" />
          {m.duration}
        </span>
      </div>
      <Separator orientation="vertical" className="h-auto self-stretch" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground leading-snug pr-12">
          {m.title}
        </span>
        <p className="text-xs leading-relaxed text-muted-foreground/70 line-clamp-2">
          {m.brief}
        </p>
        <AvatarGroup className="mt-0.5">
          {m.attendees.map((a) => (
            <Avatar key={a.initials} size="sm" className="size-5">
              <AvatarFallback className="text-[9px]">{a.initials}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>
    </div>
  )
}

// ── Meetings list ─────────────────────────────────────────────────────────────

function MeetingsList({ meetings, dateLabel }: { meetings: Meeting[]; dateLabel: string }) {
  const scrollable = meetings.length > 3
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [hasMore, setHasMore] = useState(scrollable)

  useEffect(() => {
    if (!scrollable) return
    const viewport = wrapperRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    if (!viewport) return

    function check() {
      if (!viewport) return
      setHasMore(viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 8)
    }

    check()
    viewport.addEventListener("scroll", check)
    return () => viewport.removeEventListener("scroll", check)
  }, [scrollable, meetings])

  function scrollDown() {
    const viewport = wrapperRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    viewport?.scrollBy({ top: 240, behavior: "smooth" })
  }

  return (
    <div className="flex flex-1 flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between pb-1">
        <p className="text-xs font-medium text-muted-foreground/60">{dateLabel}</p>
        <span className="text-xs tabular-nums text-muted-foreground/40">
          {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}
        </span>
      </div>

      <div ref={wrapperRef} className="relative">
        <ScrollArea className="h-[380px]">
          <div className="flex flex-col gap-2 pr-3 pb-8">
            {meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
                <CalendarDays className="size-5 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/40">No meetings this day</p>
              </div>
            ) : (
              meetings.map((m) => <MeetingCard key={m.id} m={m} />)
            )}
          </div>
        </ScrollArea>

        {hasMore && (
          <div className="absolute inset-x-0 bottom-0 flex h-16 flex-col items-center justify-end pb-2 bg-gradient-to-t from-background to-transparent">
            <button
              onClick={scrollDown}
              className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronDown className="size-3" />
              more meetings
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Meetings section ──────────────────────────────────────────────────────────

function MeetingsSection({
  selectedDate,
  onSelectDate,
  onMonthChange,
}: {
  selectedDate: Date
  onSelectDate: (d: Date) => void
  onMonthChange: (d: Date) => void
}) {
  const meetings = getMeetingsForDate(selectedDate)
  const datesWithMeetings = getDatesWithMeetings()

  const meetingCountByDate = datesWithMeetings.reduce<Record<string, number>>((acc, d) => {
    acc[d.toDateString()] = getMeetingsForDate(d).length
    return acc
  }, {})

  const isToday =
    selectedDate.toDateString() === new Date().toDateString()

  const dateLabel = isToday
    ? "Today"
    : selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  return (
    <Section title="Calendar">
      <div className="flex gap-6 items-start">
        {/* Calendar */}
        <div className="shrink-0 rounded-lg border border-border bg-card p-3">
          <Calendar
            className="[--cell-size:--spacing(12)]"
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && onSelectDate(d)}
            onMonthChange={onMonthChange}
            modifiers={{ hasMeeting: datesWithMeetings }}
            components={{
              DayButton: ({ day, modifiers, ...props }) => {
                const count = meetingCountByDate[day.date.toDateString()] ?? 0
                const dots = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3
                const dotColor = modifiers.selected ? "bg-primary-foreground/70" : "bg-primary/60"
                return (
                  <button
                    {...props}
                    className={cn(
                      "relative flex aspect-square w-full min-w-[48px] flex-col items-center justify-center gap-1 rounded-md text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      modifiers.selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      modifiers.today && !modifiers.selected && "bg-muted font-semibold",
                      modifiers.outside && "text-muted-foreground/40",
                      modifiers.disabled && "pointer-events-none opacity-30",
                    )}
                  >
                    {day.date.getDate()}
                    {dots > 0 && (
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: dots }).map((_, i) => (
                          <span key={i} className={cn("size-1 rounded-full", dotColor)} />
                        ))}
                      </span>
                    )}
                  </button>
                )
              },
            }}
          />
        </div>

        {/* Meeting cards */}
        <MeetingsList meetings={meetings} dateLabel={dateLabel} />
      </div>
    </Section>
  )
}

// ── Finance columns ───────────────────────────────────────────────────────────

const INCOME_COLOR = "hsl(142 71% 45%)"
const EXPENSE_COLOR = "hsl(0 72% 51%)"

function FinanceRow({ tx, tint }: { tx: Transaction; tint: "green" | "red" }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <CategoryDot category={tx.category} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-foreground/90">{tx.label}</span>
        <span className="truncate text-xs text-muted-foreground/50">{tx.source}</span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: tint === "green" ? INCOME_COLOR : EXPENSE_COLOR }}
        >
          {tint === "green" ? "+" : "-"}{fmt(tx.amount)}
        </span>
        <span className="text-[11px] text-muted-foreground/40 tabular-nums">{tx.date}</span>
      </div>
    </div>
  )
}

function UpcomingRow({ payment }: { payment: UpcomingPayment }) {
  const daysMatch = payment.dueIn.match(/(\d+)/)
  const days = daysMatch ? parseInt(daysMatch[1]) : 30
  const urgency = Math.max(0, Math.min(1, 1 - days / 30))

  return (
    <div className="flex flex-col gap-1.5 py-2.5">
      <div className="flex items-center gap-3">
        <PaymentTypeIcon type={payment.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground/90">{payment.label}</span>
          <span className={cn(
            "text-xs tabular-nums",
            payment.urgent ? "text-destructive/80" : "text-muted-foreground/50",
          )}>
            due in {payment.dueIn}
          </span>
        </div>
        <span
          className="shrink-0 text-sm font-semibold tabular-nums"
          style={{ color: payment.urgent ? EXPENSE_COLOR : undefined }}
        >
          {fmt(payment.amount)}
        </span>
      </div>
      {/* Urgency bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${urgency * 100}%`,
            backgroundColor: urgency > 0.8 ? EXPENSE_COLOR : urgency > 0.5 ? "hsl(38 92% 50%)" : "hsl(142 71% 45%)",
          }}
        />
      </div>
    </div>
  )
}

function SpendBar({ categories }: { categories: { label: string; amount: number; color: string }[] }) {
  const total = categories.reduce((s, c) => s + c.amount, 0)
  if (total === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2 w-full overflow-hidden rounded-full gap-0.5">
        {categories.map((c) => (
          <div
            key={c.label}
            className={cn("h-full first:rounded-l-full last:rounded-r-full", c.color)}
            style={{ width: `${(c.amount / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {categories.map((c) => (
          <div key={c.label} className="flex items-center gap-2">
            <span className={cn("size-2 shrink-0 rounded-full", c.color)} />
            <span className="flex-1 text-xs text-muted-foreground/70">{c.label}</span>
            <span className="text-xs tabular-nums font-medium text-foreground/80">{fmt(c.amount)}</span>
            <span className="w-8 text-right text-[11px] tabular-nums text-muted-foreground/40">
              {Math.round((c.amount / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NetBalanceBar({ totalIn, totalOut, monthLabel }: { totalIn: number; totalOut: number; monthLabel: string }) {
  const net = totalIn - totalOut
  const isPositive = net >= 0
  const inPct = totalIn + totalOut === 0 ? 50 : (totalIn / (totalIn + totalOut)) * 100

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-5 py-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50">Net · {monthLabel}</span>
        <span className="text-xl font-semibold tabular-nums" style={{ color: isPositive ? INCOME_COLOR : EXPENSE_COLOR }}>
          {isPositive ? "+" : "-"}{fmt(Math.abs(net))}
        </span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        <div className="h-full rounded-l-full" style={{ width: `${inPct}%`, backgroundColor: INCOME_COLOR }} />
        <div className="h-full flex-1 rounded-r-full" style={{ backgroundColor: EXPENSE_COLOR }} />
      </div>
      <div className="flex justify-between">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <span className="size-2 rounded-full" style={{ backgroundColor: INCOME_COLOR }} />
          Income {fmt(totalIn)}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <span className="size-2 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} />
          Spent {fmt(totalOut)}
        </span>
      </div>
    </div>
  )
}

function FinanceSection({ syncing, month }: { syncing: boolean; month: Date }) {
  const finance = getFinanceForMonth(month)
  const totalIn = finance.incoming.reduce((s, t) => s + t.amount, 0)
  const totalOut = finance.outgoing.reduce((s, t) => s + t.amount, 0)
  const monthLabel = month.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <Section title="Money">
      <div className="flex flex-col gap-3">
        <NetBalanceBar totalIn={totalIn} totalOut={totalOut} monthLabel={monthLabel} />
        <div className="grid grid-cols-3 gap-3">
          {/* Incoming */}
          <div className="flex flex-col rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <ArrowDownLeft className="size-4 shrink-0" style={{ color: INCOME_COLOR }} />
              <span className="text-sm font-medium text-foreground">Incoming</span>
              <span className="ml-auto text-base font-bold tabular-nums" style={{ color: INCOME_COLOR }}>
                {fmt(totalIn)}
              </span>
            </div>
            <div className="flex flex-col px-4 divide-y divide-border">
              {finance.incoming.length === 0
                ? <p className="py-6 text-center text-xs text-muted-foreground/40">No data for this month</p>
                : finance.incoming.map((tx) => <FinanceRow key={tx.id} tx={tx} tint="green" />)}
            </div>
          </div>

          {/* Outgoing */}
          <div className="flex flex-col rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <ArrowUpRight className="size-4 shrink-0" style={{ color: EXPENSE_COLOR }} />
              <span className="text-sm font-medium text-foreground">Outgoing</span>
              <span className="ml-auto text-base font-bold tabular-nums" style={{ color: EXPENSE_COLOR }}>
                {fmt(totalOut)}
              </span>
            </div>
            <div className="flex flex-col px-4 divide-y divide-border">
              {finance.outgoing.length === 0
                ? <p className="py-6 text-center text-xs text-muted-foreground/40">No data for this month</p>
                : finance.outgoing.map((tx) => <FinanceRow key={tx.id} tx={tx} tint="red" />)}
            </div>
            {finance.spendCategories.length > 0 && (
              <div className="border-t border-border px-4 py-4">
                <SpendBar categories={finance.spendCategories} />
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div className="flex flex-col rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <CalendarClock className="size-4 shrink-0 text-muted-foreground/60" />
              <span className="text-sm font-medium text-foreground">Upcoming</span>
              <span className="ml-auto text-base font-bold tabular-nums text-foreground">
                {fmt(finance.upcoming.reduce((s, p) => s + p.amount, 0))}
              </span>
            </div>
            <div className="flex flex-col px-4 divide-y divide-border">
              {finance.upcoming.length === 0
                ? <p className="py-6 text-center text-xs text-muted-foreground/40">No data for this month</p>
                : finance.upcoming.map((p) => <UpcomingRow key={p.id} payment={p} />)}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

// ── Packages ──────────────────────────────────────────────────────────────────

function PackageCard({ pkg }: { pkg: ReturnType<typeof getPackagesForMonth>[number] }) {
  const [expanded, setExpanded] = useState(false)
  const delivered = isDelivered(pkg)
  const latest = getLatestEvent(pkg)
  const isActive = !delivered && pkg.events.some(e => e.completed && e.label.toLowerCase().includes("out for delivery"))

  return (
    <div className={cn(
      "flex flex-col rounded-lg border bg-card transition-colors",
      isActive ? "border-primary/25 bg-primary/[0.02]" : "border-border",
      delivered && "opacity-55",
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md",
          isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/40",
        )}>
          <Package className="size-3.5" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground/90">{pkg.item}</span>
          <span className="text-xs text-muted-foreground/50">{pkg.carrier}</span>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className={cn(
            "text-xs font-medium",
            isActive ? "text-primary" : "text-muted-foreground/60",
          )}>
            {latest.label}
          </span>
          <span className="text-[11px] text-muted-foreground/40 tabular-nums">{latest.time}</span>
        </div>

        <ChevronDown className={cn(
          "ml-1 size-3.5 shrink-0 text-muted-foreground/30 transition-transform",
          expanded && "rotate-180",
        )} />
      </button>

      {/* Timeline */}
      {expanded && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex flex-col gap-0">
            {pkg.events.map((event, i) => (
              <div key={i} className="flex gap-3">
                {/* Spine */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "size-2 shrink-0 rounded-full mt-0.5",
                    event.completed ? "bg-primary/70" : "bg-muted-foreground/20",
                  )} />
                  {i < pkg.events.length - 1 && (
                    <div className={cn(
                      "w-px flex-1 my-0.5",
                      event.completed ? "bg-primary/20" : "bg-muted-foreground/10",
                    )} />
                  )}
                </div>
                {/* Content */}
                <div className={cn("pb-3 min-w-0", i === pkg.events.length - 1 && "pb-0")}>
                  <span className={cn(
                    "text-xs font-medium leading-none",
                    event.completed ? "text-foreground/80" : "text-muted-foreground/35",
                  )}>
                    {event.label}
                  </span>
                  {event.location && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground/50">{event.location}</p>
                  )}
                  <p className={cn(
                    "mt-0.5 text-[11px] tabular-nums",
                    event.completed ? "text-muted-foreground/40" : "text-muted-foreground/25",
                  )}>
                    {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PackagesSection({ month }: { month: Date }) {
  const packages = getPackagesForMonth(month)
  const active = packages.filter(p => !isDelivered(p))
  const delivered = packages.filter(p => isDelivered(p))

  return (
    <Section title="Packages">
      {packages.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-8">
          <p className="text-xs text-muted-foreground/40">No packages this month</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {active.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
          {delivered.length > 0 && (
            <>
              {active.length > 0 && (
                <p className="pt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/35">
                  Delivered
                </p>
              )}
              {delivered.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
            </>
          )}
        </div>
      )}
    </Section>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
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

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40 text-foreground">
      <BoardSidebar />

      <div className="flex flex-1 overflow-hidden px-3 py-2 pl-0">
        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-background shadow-sm">
        <div className="px-8 py-8">
          <div className="flex flex-col gap-10">

            {/* Greeting + sync */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground/50 mb-0.5 tabular-nums">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <h1 className="text-lg font-semibold text-foreground">{greeting}, Anurag.</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground/40">
                  <span className={cn(
                    "size-1.5 rounded-full",
                    syncing ? "animate-pulse bg-amber-400" : "bg-green-500",
                  )} />
                  {syncing
                    ? "Syncing with Gmail…"
                    : `Synced ${syncLabel} · refreshes every 5 min`}
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
            </div>

            <MeetingsSection selectedDate={selectedDate} onSelectDate={setSelectedDate} onMonthChange={setCalendarMonth} />
            <Separator />
            <FinanceSection syncing={syncing} month={calendarMonth} />
            <Separator />
            <PackagesSection month={calendarMonth} />

          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
