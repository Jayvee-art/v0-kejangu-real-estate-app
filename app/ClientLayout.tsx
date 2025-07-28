"use client"

import type { ReactNode } from "react"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { AppSessionProvider } from "@/components/auth-provider" // Import AppSessionProvider

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AppSessionProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </AppSessionProvider>
  )
}
