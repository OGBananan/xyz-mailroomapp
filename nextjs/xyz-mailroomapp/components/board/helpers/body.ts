import type { gmail_v1 } from "googleapis"

export function getBody(msg: gmail_v1.Schema$Message | undefined): string {
  if (!msg?.payload) return ""
  return findText(msg.payload) ?? ""
}

function findText(part: gmail_v1.Schema$MessagePart): string | undefined {
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

function decode(data: string): string {
  if (/^[A-Za-z0-9_-]+={0,2}$/.test(data) && data.length % 4 === 0) {
    try {
      return typeof atob === "function" ? atob(data.replace(/-/g, "+").replace(/_/g, "/")) : data
    } catch {
      return data
    }
  }
  return data
}
