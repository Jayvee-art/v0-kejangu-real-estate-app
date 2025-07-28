"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Message {
  _id: string
  conversation: string
  sender: {
    _id: string
    name: string
  }
  content: string
  createdAt: string
}

interface Conversation {
  _id: string
  participants: {
    _id: string
    name: string
    email: string
  }[]
  property?: {
    _id: string
    title: string
  }
}

interface ChatWindowProps {
  conversationId: string
  onClose: () => void
}

export function ChatWindow({ conversationId, onClose }: ChatWindowProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const fetchConversationAndMessages = async () => {
      if (!user || !conversationId) return

      setIsLoadingMessages(true)
      try {
        const token = localStorage.getItem("token")

        // Fetch conversation details
        const convResponse = await fetch(`/api/conversations?id=${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (convResponse.ok) {
          const convData = await convResponse.json()
          setConversation(convData)
        } else {
          throw new Error("Failed to fetch conversation details.")
        }

        // Fetch messages
        const msgResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (msgResponse.ok) {
          const msgData = await msgResponse.json()
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
    }

    fetchConversationAndMessages()
  }, [conversationId, user, toast])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        const sentMessage: Message = await response.json()
        setMessages((prevMessages) => [...prevMessages, sentMessage])
        setNewMessage("")
        // Optionally, update lastMessage in conversation list
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

  const otherParticipant = conversation?.participants.find((p) => p._id !== user?.id)

  if (isLoadingMessages) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading chat...</p>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
        <p className="text-lg font-semibold">Conversation not found.</p>
        <Button onClick={onClose} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${otherParticipant?._id}`}>
            <Avatar>
              <AvatarImage src={`/placeholder.svg?text=${otherParticipant?.name.charAt(0)}`} />
              <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/profile/${otherParticipant?._id}`}>
              <h3 className="font-semibold text-gray-900">{otherParticipant?.name || "Unknown User"}</h3>
            </Link>
            {conversation.property && <p className="text-sm text-blue-600">Property: {conversation.property.title}</p>}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-end gap-2 ${message.sender._id === user?.id ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`/placeholder.svg?text=${message.sender.name.charAt(0)}`} />
                  <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div
                  className={`p-3 rounded-lg max-w-[70%] ${
                    message.sender._id === user?.id
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span
                    className={`block text-xs mt-1 ${
                      message.sender._id === user?.id ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {format(new Date(message.createdAt), "p")}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
