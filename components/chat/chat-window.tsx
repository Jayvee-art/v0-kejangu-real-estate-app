"use client"

import * as React from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { MessageSquare } from "lucide-react" // Import MessageSquare

interface MessageItem {
  _id: string
  conversation: string
  sender: {
    _id: string
    name: string
    email: string
  }
  content: string
  createdAt: string
  readBy: string[]
}

interface ConversationDetails {
  _id: string
  participants: {
    _id: string
    name: string
    email: string
    role: string
  }[]
  property?: {
    _id: string
    title: string
    imageUrl?: string
  }
  createdAt: string
  updatedAt: string
}

interface ChatWindowProps {
  conversationId: string | null
  onClose: () => void
}

export function ChatWindow({ conversationId, onClose }: ChatWindowProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = React.useState<MessageItem[]>([])
  const [newMessage, setNewMessage] = React.useState("")
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [conversationDetails, setConversationDetails] = React.useState<ConversationDetails | null>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversationAndMessages = React.useCallback(async () => {
    if (!conversationId || !user) return

    setIsLoadingMessages(true)
    try {
      const token = localStorage.getItem("token")

      // Fetch conversation details (using the GET /api/conversations route with ID filter)
      const convResponse = await fetch(`/api/conversations?id=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (convResponse.ok) {
        const convData = await convResponse.json()
        // The /api/conversations GET returns an array, so we need to pick the first one
        setConversationDetails(convData[0] || null)
      } else {
        throw new Error("Failed to fetch conversation details.")
      }

      // Fetch messages
      const msgResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (msgResponse.ok) {
        const msgData: MessageItem[] = await msgResponse.json()
        setMessages(msgData)
      } else {
        throw new Error("Failed to fetch messages.")
      }
    } catch (error: any) {
      console.error("Error fetching chat data:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load chat.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMessages(false)
    }
  }, [conversationId, user, toast])

  React.useEffect(() => {
    fetchConversationAndMessages()
    // Scroll to bottom when messages load or change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
    }
    // Optional: Set up polling for new messages
    const interval = setInterval(fetchConversationAndMessages, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [fetchConversationAndMessages, conversationId])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !conversationId) return

    setIsSending(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        const sentMessage: MessageItem = await response.json()
        setMessages((prevMessages) => [...prevMessages, sentMessage])
        setNewMessage("")
        // No need to explicitly call onMessageSent here, as polling will update ConversationList
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to send message.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Something went wrong while sending message.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const otherParticipant = conversationDetails?.participants.find((participant) => participant._id !== user?._id)

  if (!conversationId || !otherParticipant) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-500">
        <MessageSquare className="h-16 w-16 mb-4" />
        <p className="text-lg font-medium">Select a conversation</p>
        <p className="text-sm">Or start a new one from a property listing.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${otherParticipant._id}`}>
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant.name}`} />
              <AvatarFallback>{otherParticipant.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/profile/${otherParticipant._id}`}>
              <h3 className="font-semibold text-gray-900">{otherParticipant.name || "Unknown User"}</h3>
            </Link>
            {conversationDetails.property && (
              <p className="text-sm text-blue-600">Property: {conversationDetails.property.title}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" viewportRef={messagesEndRef}>
        <div className="space-y-4">
          {isLoadingMessages ? (
            <div className="flex flex-col gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <div className="bg-gray-200 rounded-lg p-3 max-w-[70%] animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-24 mb-1" />
                    <div className="h-3 bg-gray-300 rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages in this conversation yet.</p>
              <p className="text-sm">Say hello!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender._id === user?._id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-end gap-2 ${message.sender._id === user?._id ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.sender.name}`} />
                    <AvatarFallback>{message.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`p-3 rounded-lg max-w-[70%] ${
                      message.sender._id === user?._id
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span
                      className={`block text-xs mt-1 ${
                        message.sender._id === user?._id ? "text-blue-200" : "text-gray-500"
                      }`}
                    >
                      {format(new Date(message.createdAt), "p")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isSending) {
                handleSendMessage()
              }
            }}
            disabled={isSending}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={isSending}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
