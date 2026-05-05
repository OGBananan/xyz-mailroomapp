import { apiClient } from "./api-client"
import type { SyncStatus } from "@/types/api"

export const syncService = {
  /** Kick off an incremental Gmail sync for the current user. Returns immediately;
   *  progress and completion arrive via SSE (sync.started, sync.completed). */
  kickoff: () => apiClient.post<{ jobId: string }>("/api/sync"),

  /** Current sync state — useful for polling or initial state hydration. */
  getStatus: () => apiClient.get<SyncStatus>("/api/sync/status"),
}
