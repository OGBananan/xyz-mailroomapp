import type { gmail_v1 } from "googleapis"
import { getSubject } from "./headers"

export function getLatestMessage(thread: gmail_v1.Schema$Thread): gmail_v1.Schema$Message | undefined {
  return thread.messages?.[thread.messages.length - 1]
}

export function getThreadSubject(thread: gmail_v1.Schema$Thread): string {
  return getSubject(thread.messages?.[0]) || getSubject(getLatestMessage(thread))
}
