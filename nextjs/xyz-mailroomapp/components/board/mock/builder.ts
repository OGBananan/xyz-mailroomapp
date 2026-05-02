import type { gmail_v1 } from "googleapis"

let msgCounter = 0
const nextId = () => `m-${++msgCounter}`

export interface MessageInput {
  from: string
  to: string
  date: string
  body: string
  subject?: string
}

export function buildMessage(threadId: string, input: MessageInput): gmail_v1.Schema$Message {
  return {
    id: nextId(),
    threadId,
    snippet: input.body.split("\n").find(l => l.trim())?.slice(0, 120) ?? "",
    payload: {
      mimeType: "text/plain",
      headers: [
        { name: "From",    value: input.from },
        { name: "To",      value: input.to },
        { name: "Subject", value: input.subject ?? "" },
        { name: "Date",    value: input.date },
      ],
      body: { data: input.body, size: input.body.length },
    },
    sizeEstimate: input.body.length,
    labelIds: ["INBOX"],
  }
}

export function buildThread(
  threadId: string,
  subject: string,
  messages: Omit<MessageInput, "subject">[],
): gmail_v1.Schema$Thread {
  const built = messages.map((m, i) =>
    buildMessage(threadId, { ...m, subject: i === 0 ? subject : `Re: ${subject}` }),
  )
  return {
    id: threadId,
    historyId: "1",
    messages: built,
    snippet: built[built.length - 1].snippet,
  }
}
