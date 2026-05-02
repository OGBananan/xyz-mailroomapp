export interface ParsedAddress {
  name: string
  email: string
  initials: string
}

export function parseAddress(value: string): ParsedAddress {
  const match = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/)
  if (match) {
    const name = match[1].trim() || match[2]
    return { name, email: match[2].trim(), initials: toInitials(name) }
  }
  const email = value.trim()
  return { name: email, email, initials: toInitials(email) }
}

function toInitials(s: string): string {
  const parts = s.replace(/[<>"]/g, "").trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (parts[0]?.slice(0, 2) ?? "??").toUpperCase()
}
