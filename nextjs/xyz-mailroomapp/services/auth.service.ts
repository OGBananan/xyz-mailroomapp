import { apiClient, apiBaseUrl } from "./api-client"
import type { User } from "@/types/api"

// Auth routes live at /auth/* on the backend (no /api prefix)
export const authService = {
  /** Fetch the currently authenticated user. Throws ApiError(401) when not logged in. */
  getMe: () => apiClient.get<User>("/auth/me"),

  /** Clear the server session and the sid cookie. */
  logout: () => apiClient.post<{ ok: boolean }>("/auth/logout"),

  /** Initiate Google OAuth — navigates the browser away from the app. */
  loginWithGoogle: () => {
    window.location.href = `${apiBaseUrl}/auth/google`
  },
}
