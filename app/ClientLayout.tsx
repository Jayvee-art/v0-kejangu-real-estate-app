"use client"

import type React from "react"

import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { ChatAssistant } from "@/components/chat-assistant"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { ChatLayout } from "@/components/chat/chat-layout"
import { useState } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
            <ChatAssistant /> {/* Floating chatbot */}
            <Toaster />
            {/* Floating Chat Button for Direct Messaging */}
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="fixed bottom-4 right-4 md:bottom-8 md:right-8 rounded-full h-14 w-14 shadow-lg z-50"
                  aria-label="Open chat messages"
                >
                  <MessageSquare className="h-7 w-7" />
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 border-none bg-transparent max-w-none w-auto h-auto">
                <ChatLayout />
              </DialogContent>
            </Dialog>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
