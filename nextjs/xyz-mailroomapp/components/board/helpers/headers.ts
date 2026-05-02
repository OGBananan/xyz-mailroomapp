import type { gmail_v1 } from "googleapis"
import { parseAddress, type ParsedAddress } from "./address"

export function getHeader(msg: gmail_v1.Schema$Message | undefined, name: string): string {
  return msg?.payload?.headers?.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value ?? ""
}

export function getSubject(msg: gmail_v1.Schema$Message | undefined): string {
  return getHeader(msg, "Subject")
}

export function getDateLabel(msg: gmail_v1.Schema$Message | undefined): string {
  return getHeader(msg, "Date")
}

export function getFrom(msg: gmail_v1.Schema$Message | undefined): ParsedAddress {
  return parseAddress(getHeader(msg, "From"))
}

export function getToList(msg: gmail_v1.Schema$Message | undefined): ParsedAddress[] {
  const raw = getHeader(msg, "To")
  if (!raw) return []
  return raw.split(",").map(parseAddress)
}
