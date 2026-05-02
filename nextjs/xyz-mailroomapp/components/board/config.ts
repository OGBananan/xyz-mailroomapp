import type { Status } from "./types/status"

export const COLUMNS: { id: Status; label: string; description: string }[] = [
  { id: "decide", label: "Decide",        description: "Pick what should happen with this email" },
  { id: "review", label: "Review",        description: "Edit the agent's draft" },
  { id: "ready",  label: "Ready to Send", description: "Final check before it goes out" },
]
