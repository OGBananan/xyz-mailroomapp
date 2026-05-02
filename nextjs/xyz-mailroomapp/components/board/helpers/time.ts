export function relativeTime(rfc2822Date: string): string {
  if (!rfc2822Date) return ""
  const ts = Date.parse(rfc2822Date)
  if (isNaN(ts)) return rfc2822Date
  const diffMs = Date.now() - ts
  const mins  = Math.floor(diffMs / 60_000)
  if (mins < 1)   return "just now"
  if (mins < 60)  return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days  = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7)   return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5)  return `${weeks}w ago`
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
