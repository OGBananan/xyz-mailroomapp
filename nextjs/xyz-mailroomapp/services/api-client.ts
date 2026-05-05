const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, (body as { error?: string }).error ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const apiClient = {
  get:    <T>(path: string)                    => request<T>(path),
  post:   <T>(path: string, body?: unknown)    => request<T>(path, { method: "POST",   body: body != null ? JSON.stringify(body) : undefined }),
  put:    <T>(path: string, body?: unknown)    => request<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown)    => request<T>(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: <T>(path: string)                    => request<T>(path, { method: "DELETE" }),
}

/** Base URL for things that navigate the browser (OAuth redirect). */
export const apiBaseUrl = API_URL
