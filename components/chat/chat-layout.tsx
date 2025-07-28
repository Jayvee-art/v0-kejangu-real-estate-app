"use client"

import { useState, useEffect } from "react"
import { ConversationList } from "@/components/chat/conversation-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { useAuth } from "@/components/auth-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { NewConversationDialog } from "@/components/chat/new-conversation-dialog"

export default function ChatLayout() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false)
  const [newConversationRecipientId, setNewConversationRecipientId] = useState<string | null>(null)
  const [newConversationPropertyName, setNewConversationPropertyName] = useState<string | null>(null)
  const [newConversationPropertyId, setNewConversationPropertyId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your messages.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    const conversationIdFromUrl = searchParams.get("conversationId")
    const conversationWith = searchParams.get("conversationWith")
    const propertyId = searchParams.get("propertyId")
    const propertyName = searchParams.get("propertyName")

    if (conversationIdFromUrl) {
      setSelectedConversationId(conversationIdFromUrl)
    } else if (conversationWith && propertyId && propertyName) {
      // If starting a new conversation from URL params
      setNewConversationRecipientId(conversationWith)
      setNewConversationPropertyId(propertyId)
      setNewConversationPropertyName(propertyName)
      setShowNewConversationDialog(true)
    }
  }, [user, authLoading, router, searchParams, toast])

  const handleNewConversationSuccess = (newConvId: string) => {
    setShowNewConversationDialog(false)
    setNewConversationRecipientId(null)
    setNewConversationPropertyId(null)
    setNewConversationPropertyName(null)
    setSelectedConversationId(newConvId)
    router.replace(`/messages?conversationId=${newConvId}`) // Update URL without full reload
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading messages...</span>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)] max-h-[calc(100vh-64px)]">
      <div className="w-80 border-r bg-white dark:bg-gray-950">
        <ConversationList
          onSelectConversation={setSelectedConversationId}
          selectedConversationId={selectedConversationId}
        />
      </div>
      <div className="flex-1">
        <ChatWindow conversationId={selectedConversationId} />
      </div>

      {newConversationRecipientId && (
        <NewConversationDialog
          open={showNewConversationDialog}
          onOpenChange={setShowNewConversationDialog}
          recipientId={newConversationRecipientId}
          propertyName={newConversationPropertyName || undefined}
          propertyId={newConversationPropertyId || undefined}
          onSuccess={handleNewConversationSuccess}
        />
      )}
    </div>
  )
}
