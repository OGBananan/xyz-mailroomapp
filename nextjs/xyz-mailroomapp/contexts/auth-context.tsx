"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { authService } from "@/services/auth.service"
import { ApiError }    from "@/services/api-client"
import type { User }   from "@/types/api"

interface AuthState {
  user:            User | null
  isLoading:       boolean
  isAuthenticated: boolean
  isLoggingOut:    boolean
  logout:          () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

/** Fetch /auth/me, retrying once after a short delay on failure.
 *  The retry handles the post-OAuth redirect race where the browser
 *  hasn't committed the cross-origin SameSite=None cookie yet. */
async function fetchMe(): Promise<User | null> {
  try {
    return await authService.getMe()
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      // Brief wait then one retry — covers the cookie commit race on first load
      await new Promise(r => setTimeout(r, 800))
      try { return await authService.getMe() } catch { return null }
    }
    console.error("[auth] unexpected error", err)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,         setUser]         = useState<User | null>(null)
  const [isLoading,    setIsLoading]    = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    fetchMe().then(u => { setUser(u); setIsLoading(false) })
  }, [])

  const logout = useCallback(async () => {
    setIsLoggingOut(true)
    try { await authService.logout() } catch { /* ignore */ }
    await new Promise(r => setTimeout(r, 600))
    window.location.href = "/login/"
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, isLoggingOut, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
