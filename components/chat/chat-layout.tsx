"use client"

import * as React from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ChatWindow } from "./chat-window"
import { ConversationList } from "./conversation-list"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ChatLayoutProps {
  onClose: () => void
}

export function ChatLayout({ onClose }: ChatLayoutProps) {
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null)

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold">Direct Messages</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close chat</span>
        </Button>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={30} minSize={20}>
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} minSize={40}>
          {selectedConversationId ? (
            <ChatWindow conversationId={selectedConversationId} onClose={() => setSelectedConversationId(null)} />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              <p>Select a conversation to view messages</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
