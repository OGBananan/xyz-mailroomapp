"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Inbox, Settings, HelpCircle, Sun, Moon, Home, LogOut, Loader2 } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context"

interface NavItemProps {
  icon: React.ReactNode
  label: string
  href: string
  count?: number
}

function NavItem({ icon, label, href, count }: NavItemProps) {
  const pathname = usePathname()
  const active = pathname === href || pathname === href + "/"

  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      <span className={cn("shrink-0 [&>svg]:size-[14px]", active ? "text-foreground" : "text-muted-foreground/70")}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] font-normal tabular-nums">
          {count}
        </Badge>
      )}
    </Link>
  )
}

export function BoardSidebar() {
  const { resolvedTheme, setTheme } = useTheme()
  const { user, logout, isLoggingOut } = useAuth()

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-muted/30">
      {/* Workspace header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <Image src="/logo.svg" alt="Mailroom" width={24} height={24} className="shrink-0" />
        <span className="flex-1 truncate text-sm font-semibold">Mailroom</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
        <NavItem icon={<Home />} label="Home" href="/" />
        <NavItem icon={<Inbox />} label="Inbox" href="/inbox" count={3} />
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-0.5 px-2 py-2">
        <NavItem icon={<Settings />}    label="Settings"      href="/settings" />
        <NavItem icon={<HelpCircle />}  label="Help & Support" href="/help" />

        {/* Theme toggle */}
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <span className="shrink-0 text-muted-foreground/70 [&>svg]:size-[14px]">
            {resolvedTheme === "dark" ? <Moon /> : <Sun />}
          </span>
          <span className="flex-1 text-sm text-muted-foreground">Theme</span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  className="size-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                />
              }
            >
              {resolvedTheme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </TooltipTrigger>
            <TooltipContent side="right">
              Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
            </TooltipContent>
          </Tooltip>
        </div>

        {/* User + logout */}
        {user && (
          <>
            <Separator className="my-1" />
            <div className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 transition-opacity duration-300",
              isLoggingOut && "opacity-50",
            )}>
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 truncate text-sm text-muted-foreground">
                {isLoggingOut ? "Signing out…" : user.name}
              </span>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="size-6 p-0 text-muted-foreground hover:text-destructive disabled:pointer-events-none"
                      onClick={logout}
                      disabled={isLoggingOut}
                    />
                  }
                >
                  {isLoggingOut
                    ? <Loader2 className="size-3.5 animate-spin" />
                    : <LogOut className="size-3.5" />
                  }
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
