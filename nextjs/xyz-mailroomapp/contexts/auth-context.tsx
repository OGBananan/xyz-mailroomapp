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
  logout:          () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    authService
      .getMe()
      .then(setUser)
      .catch((err) => {
        // 401 is expected when not logged in — everything else is a real error
        if (!(err instanceof ApiError && err.status === 401)) {
          console.error("[auth] unexpected error", err)
        }
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch { /* ignore */ }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, logout }}
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
