import { apiBaseUrl } from "./api-client"

export type SseEventType =
  | "connected"
  | "ping"
  | "sync.started"
  | "sync.completed"
  | "card.created"
  | "card.updated"
  | "draft.chunk"
  | "draft.done"
  | "draft.ready"
  | "error"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler<T = any> = (data: T) => void

export interface SseHandlers {
  "connected"?:      Handler<{ userId: string }>
  "ping"?:           Handler<{ ts: number }>
  "sync.started"?:   Handler<{ userId: string }>
  "sync.completed"?: Handler<{ userId: string; count: number }>
  "card.created"?:   Handler<{ threadId: string; column: string; triageReason: string | null; confidence: string | null }>
  "card.updated"?:   Handler<{ threadId: string; column: string }>
  "draft.chunk"?:    Handler<{ threadId: string; token: string }>
  "draft.done"?:     Handler<{ threadId: string }>
  "draft.ready"?:    Handler<{ threadId: string }>
  "error"?:          Handler<{ message: string }>
}

/**
 * Open an SSE connection to the backend and register event handlers.
 * Returns a cleanup function — call it on component unmount.
 */
export function createEventStream(handlers: SseHandlers): () => void {
  const es = new EventSource(`${apiBaseUrl}/api/events`, { withCredentials: true })

  for (const [event, handler] of Object.entries(handlers)) {
    if (!handler) continue
    es.addEventListener(event, (e: Event) => {
      const msg = e as MessageEvent<string>
      try {
        handler(JSON.parse(msg.data))
      } catch {
        handler(msg.data)
      }
    })
  }

  es.onerror = () => {
    // EventSource auto-reconnects; log quietly in dev
    if (process.env.NODE_ENV === "development") {
      console.warn("[SSE] connection error — browser will retry")
    }
  }

  return () => es.close()
}
