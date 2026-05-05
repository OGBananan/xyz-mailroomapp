"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter }    from "next/navigation"
import { useAuth }                   from "@/contexts/auth-context"

const PUBLIC_PATHS = ["/login"]

/**
 * Redirects unauthenticated users to /login.
 * Redirects authenticated users away from /login.
 * Renders nothing while the auth state is still loading (avoids flash).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const router   = useRouter()

  const isPublic = PUBLIC_PATHS.includes(pathname)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated && !isPublic) router.replace("/login")
    if (isAuthenticated  &&  isPublic) router.replace("/")
  }, [isAuthenticated, isLoading, isPublic, router])

  // Show nothing while we're resolving auth to avoid a flash of wrong content
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    )
  }

  // Suppress rendering protected content before the redirect fires
  if (!isAuthenticated && !isPublic) return null
  if (isAuthenticated  &&  isPublic) return null

  return <>{children}</>
}
