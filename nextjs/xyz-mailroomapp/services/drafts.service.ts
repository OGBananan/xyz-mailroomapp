import { apiClient } from "./api-client"

export const draftsService = {
  /**
   * Ask the agent to generate a draft for a thread.
   * Returns a jobId immediately; actual draft arrives token-by-token via SSE
   * (draft.chunk events), finalised with draft.ready.
   */
  requestDraft: (threadId: string) =>
    apiClient.post<{ jobId: string }>(`/api/cards/${threadId}/draft`),

  /**
   * Ask the agent to refine the existing draft based on user feedback.
   * Same async SSE pattern as requestDraft.
   */
  refineDraft: (threadId: string, feedback: string) =>
    apiClient.post<{ jobId: string }>(`/api/cards/${threadId}/draft/refine`, { feedback }),

  /**
   * Persist a user-edited draft body to Gmail Drafts.
   * Called after any manual edit in the dialog.
   */
  saveDraft: (threadId: string, body: string) =>
    apiClient.put<{ ok: boolean }>(`/api/cards/${threadId}/draft`, { body }),

  /**
   * Send the stored Gmail draft as a reply, then move the card to 'ready'.
   */
  sendDraft: (threadId: string) =>
    apiClient.post<{ ok: boolean }>(`/api/cards/${threadId}/send`),
}
