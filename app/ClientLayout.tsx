"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { ChatAssistant } from "@/components/chat-assistant"
import { useAuth } from "@/components/auth-provider"
import { ChatLayout } from "@/components/chat/chat-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
        {!isLoading && user && (
          <>
            <ChatAssistant /> {/* Existing AI Chatbot */}
            {/* Floating Chat Button for Direct Messaging */}
            <Button
              className="fixed bottom-4 right-4 md:bottom-8 md:right-8 rounded-full w-14 h-14 shadow-lg z-50"
              onClick={() => setIsChatOpen(true)}
              aria-label="Open direct messages"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
              <DialogContent className="p-0 max-w-4xl h-[90vh] flex flex-col">
                <ChatLayout onClose={() => setIsChatOpen(false)} />
              </DialogContent>
            </Dialog>
          </>
        )}
      </ThemeProvider>
    </AuthProvider>
  )
}
