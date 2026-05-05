import { apiClient } from "./api-client"

export interface ComposePayload {
  to:      string
  cc?:     string
  bcc?:    string
  subject: string
  body:    string
}

export const composeService = {
  /** Send a brand-new email (not a reply to an existing thread). */
  send: (payload: ComposePayload) =>
    apiClient.post<{ ok: boolean }>("/api/compose", payload),
}
