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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,         setUser]         = useState<User | null>(null)
  const [isLoading,    setIsLoading]    = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    authService
      .getMe()
      .then(setUser)
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 401)) {
          console.error("[auth] unexpected error", err)
        }
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const logout = useCallback(async () => {
    setIsLoggingOut(true)
    try { await authService.logout() } catch { /* ignore */ }
    // Deliberate pause — gives the user a moment to register something happened
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
