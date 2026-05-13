import { apiClient } from "./api-client"

export const syncService = {
  /** Kick off an incremental Gmail sync for the current user.
   *  Returns immediately — progress arrives via SSE (sync.started, sync.completed). */
  kickoff: () => apiClient.post<{ ok: boolean }>("/api/sync"),
}
