import { apiClient } from "./api-client"
import type { Board, CardDetail, BoardColumn } from "@/types/api"

export const cardsService = {
  /** Fetch the full board — all four columns. */
  getBoard: () => apiClient.get<Board>("/api/cards"),

  /** Fetch a single card with its full Gmail thread + current draft. */
  getCard: (threadId: string) =>
    apiClient.get<CardDetail>(`/api/cards/${threadId}`),

  /** Move a card to a different column and flip the Gmail label. */
  moveCard: (threadId: string, column: BoardColumn) =>
    apiClient.patch<{ ok: boolean; threadId: string; column: BoardColumn }>(
      `/api/cards/${threadId}`,
      { column },
    ),

  /** Soft-delete: move card to the hidden column. */
  hideCard: (threadId: string) =>
    apiClient.delete<{ ok: boolean }>(`/api/cards/${threadId}`),
}
