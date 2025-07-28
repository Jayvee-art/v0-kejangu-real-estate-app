"use client"

import { useState, useEffect } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ConversationList } from "./conversation-list"
import { ChatWindow } from "./chat-window"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useSearchParams, useRouter } from "next/navigation"

interface ChatLayoutProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatLayout({ open, onOpenChange }: ChatLayoutProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  useEffect(() => {
    const convId = searchParams.get("conversationId")
    if (convId) {
      setSelectedConversationId(convId)
      onOpenChange(true) // Open the dialog if a conversationId is in URL
    }
  }, [searchParams, onOpenChange])

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
    // Update URL to reflect selected conversation
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("conversationId", id)
    router.replace(`?${newSearchParams.toString()}`, { scroll: false })
  }

  const handleCloseChat = () => {
    setSelectedConversationId(null)
    onOpenChange(false)
    // Remove conversationId from URL
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.delete("conversationId")
    router.replace(`?${newSearchParams.toString()}`, { scroll: false })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col h-[90vh] max-h-[800px] w-[95vw] max-w-[1200px] p-0 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
          <ResizablePanel defaultSize={30} minSize={20}>
            <ConversationList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} minSize={50}>
            {selectedConversationId ? (
              <ChatWindow conversationId={selectedConversationId} onClose={handleCloseChat} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to start chatting.
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </DialogContent>
    </Dialog>
  )
}
