"use client"

import { cn } from "@/lib/utils"
import type { Status } from "./types/status"

interface StatusIconProps {
  status: Status
  className?: string
}

export function StatusIcon({ status, className }: StatusIconProps) {
  const base = cn("shrink-0", className)

  switch (status) {
    case "decide":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={cn(base, "text-[hsl(25,85%,52%)]")}>
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 4.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="7" cy="9.5" r="0.75" fill="currentColor" />
        </svg>
      )
    case "review":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={cn(base, "text-[hsl(226,70%,55%)]")}>
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 1.5C7 1.5 12.5 4 12.5 7C12.5 10 7 12.5 7 12.5V1.5Z" fill="currentColor" />
        </svg>
      )
    case "ready":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={cn(base, "text-[hsl(142,71%,45%)]")}>
          <circle cx="7" cy="7" r="5.5" fill="currentColor" />
          <path d="M4.5 7L6.5 9L9.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}
