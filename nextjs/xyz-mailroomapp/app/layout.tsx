import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider }  from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider }   from "@/contexts/auth-context"
import { AuthGate }       from "@/components/auth-gate"
import { cn } from "@/lib/utils"

const geist     = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono  = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider delay={300}>
            <AuthProvider>
              <AuthGate>{children}</AuthGate>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
