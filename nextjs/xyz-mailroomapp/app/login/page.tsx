"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { authService } from "@/services/auth.service"

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/")
  }, [isAuthenticated, isLoading, router])

  function handleGoogleLogin() {
    setIsRedirecting(true)
    setTimeout(() => authService.loginWithGoogle(), 300)
  }

  return (
    /*
     * Force dark mode on the login page so the background colour comes from
     * the dark-mode CSS variables — the board app is dark-first.
     */
    <div className="dark">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground">

        {/* Subtle radial glow — sits behind the content, top-left of viewport */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, oklch(0.45 0.08 260) 0%, transparent 70%)",
          }}
        />

        {/* ── Two-column panel, centred and width-capped ─────────── */}
        <div className="relative z-10 flex w-full max-w-[880px] min-h-[520px] rounded-2xl border border-border bg-card/40 shadow-2xl overflow-hidden mx-6">

          {/* ── Left column ─────────────────────────────────────────── */}
          <div className="flex flex-1 flex-col justify-between px-12 py-10">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Mailroom" className="size-7" />
              <span className="text-sm font-semibold tracking-tight">Mailroom</span>
            </div>

            {/* Main copy — vertically centred */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  AI-powered inbox
                </p>
                <h1 className="text-[2.75rem] font-bold leading-[1.08] tracking-tight text-foreground">
                  Triage your inbox.
                  <br />
                  <span className="text-muted-foreground/60">Not your time.</span>
                </h1>
              </div>

              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Mailroom reads your Gmail, classifies what matters,
                drafts replies in your voice, and puts you in control
                of every send.
              </p>

              {/* Feature list */}
              <ul className="flex flex-col gap-2.5">
                {[
                  "Classifies threads automatically — decide, review, or hide",
                  "Agent drafts replies; you edit or approve",
                  "Nothing leaves your inbox without your click",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-foreground/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom attribution */}
            <p className="text-xs text-muted-foreground/40">
              © 2026 Mailroom
            </p>
          </div>

          {/* Vertical divider */}
          <div className="w-px self-stretch bg-border" />

          {/* ── Right column — slightly elevated bg to separate from left ── */}
          <div className="flex w-[340px] shrink-0 flex-col justify-center bg-card/60 px-10 py-10">
            <div className="w-full">
              {/* Card header */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold">Sign in</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect your Google account to get started.
                </p>
              </div>

              {/* Google button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isRedirecting}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60 disabled:pointer-events-none"
              >
                {isRedirecting
                  ? <Loader2 className="size-4 shrink-0 animate-spin" />
                  : <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>}
                {isRedirecting ? "Redirecting…" : "Continue with Google"}
              </button>

              {/* Divider */}
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground/50">Access & permissions</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Permissions */}
              <div className="flex flex-col gap-2.5">
                {[
                  { icon: "✦", label: "Read Gmail threads and labels" },
                  { icon: "✦", label: "Create and update labels for triage" },
                  { icon: "✦", label: "Save draft replies on your behalf" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <span className="text-[10px] text-muted-foreground/40">{icon}</span>
                    {label}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <p className="mt-8 text-xs text-muted-foreground/40">
                Mailroom will never send email without your explicit approval.{" "}
                <a href="#" className="underline underline-offset-2 transition-colors hover:text-muted-foreground">
                  Privacy policy
                </a>
              </p>
            </div>
          </div>

        </div>{/* end two-column panel */}
      </div>
    </div>
  )
}
