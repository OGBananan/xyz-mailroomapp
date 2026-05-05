import type { BoardCard } from "@/types/api"
import type { EmailCard } from "@/components/board/types/email"
import type { Status } from "@/components/board/types/status"

/**
 * Convert a lightweight BoardCard (board list response) into the EmailCard
 * shape that the existing board components expect.
 *
 * We build a minimal gmail_v1.Schema$Thread stub — just enough for the helpers
 * (getFrom, getThreadSubject, getLatestMessage) to work on the card-level view.
 * When the dialog opens, the full thread is fetched and replaces this stub.
 */
export function boardCardToEmailCard(card: BoardCard): EmailCard {
  const thread = {
    id:       card.threadId,
    snippet:  card.snippet,
    messages: [
      {
        id:           card.latestMessageId,
        threadId:     card.threadId,
        snippet:      card.snippet,
        internalDate: String(new Date(card.receivedAt).getTime()),
        labelIds:     card.labelIds,
        payload: {
          mimeType: "text/plain",
          headers: [
            { name: "From",    value: card.from },
            { name: "Subject", value: card.subject },
            { name: "Date",    value: card.receivedAt },
          ],
          parts: [],
          body:  { data: "" },
        },
      },
    ],
  }

  const state: Status =
    card.column === "decide" ? "decide"
    : card.column === "review" ? "review"
    : card.column === "ready"  ? "ready"
    : "decide" // hidden cards shouldn't reach the board UI

  return {
    thread,
    classification: {
      label:      card.triageReason ?? "triaged",
      confidence: card.confidence === "high" ? "high" : "low",
      reason:     card.triageReason ?? "",
    },
    state,
    ...(card.hasDraft ? { draft: { body: "", generatedAt: "" } } : {}),
  }
}

/**
 * Given a fetched CardDetail, upgrade an existing EmailCard with the
 * real full thread and live draft body.
 */
export function upgradeWithDetail(
  card: EmailCard,
  detail: import("@/types/api").CardDetail,
): EmailCard {
  return {
    ...card,
    thread: detail.thread ?? card.thread,
    draft:  detail.draft
      ? { body: detail.draft.body, generatedAt: "Just now" }
      : card.draft,
  }
}
