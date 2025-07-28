"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send, XCircle } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { MessageSquare } from "lucide-react" // Import MessageSquare

interface Message {
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

interface Participant {
  _id: string
  name: string
  email: string
  role: string
}

interface Property {
  _id: string
  title: string
  location: string
  imageUrl?: string
}

interface ConversationDetails {
  _id: string
  participants: Participant[]
  property?: Property
  lastMessage?: string
  createdAt: string
  updatedAt: string
}

interface ChatWindowProps {
  conversationId: string | null
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!conversationId || authLoading || !user) {
      setMessages([])
      setConversationDetails(null)
      setIsLoadingMessages(false)
      return
    }

    const fetchMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data: Message[] = await response.json()
          setMessages(data)
        } else {
          const errorData = await response.json()
          toast({
            title: "Error",
            description: errorData.message || "Failed to fetch messages.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Network Error",
          description: "Unable to connect to server to fetch messages.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingMessages(false)
      }
    }

    const fetchConversationDetails = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/conversations/${conversationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data: ConversationDetails = await response.json()
          setConversationDetails(data)
        } else {
          const errorData = await response.json()
          toast({
            title: "Error",
            description: errorData.message || "Failed to fetch conversation details.",
            variant: "destructive",
          })
          setConversationDetails(null)
        }
      } catch (error) {
        console.error("Error fetching conversation details:", error)
        toast({
          title: "Network Error",
          description: "Unable to connect to server to fetch conversation details.",
          variant: "destructive",
        })
        setConversationDetails(null)
      }
    }

    fetchMessages()
    fetchConversationDetails()

    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [conversationId, user, authLoading, toast])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId || !user) return

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
      } else {
        const errorData = await response.json()
        toast({
          title: "Failed to Send Message",
          description: errorData.message || "An error occurred.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Send message error:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server to send message.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (!conversationId) {
    return (
      <div className="flex h-full items-center justify-center text-center p-4">
        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Select a conversation to start chatting.</p>
      </div>
    )
  }

  if (isLoadingMessages) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading messages...</span>
      </div>
    )
  }

  if (!conversationDetails) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        <XCircle className="h-8 w-8 mr-2" />
        <span>Conversation not found or access denied.</span>
      </div>
    )
  }

  const otherParticipant = conversationDetails.participants.find((p) => p._id.toString() !== user?._id.toString())

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg">
          {otherParticipant?.name || "Unknown User"}
          {conversationDetails.property && (
            <span className="text-sm text-gray-500 font-normal block">
              About:{" "}
              <Link href={`/listings/${conversationDetails.property._id}`} className="hover:underline">
                {conversationDetails.property.title}
              </Link>
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex items-start gap-3 ${msg.sender._id === user?._id ? "justify-end" : "justify-start"}`}
              >
                {msg.sender._id !== user?._id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender.name}`} />
                    <AvatarFallback>{msg.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender._id === user?._id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span
                    className={`block text-right text-xs mt-1 ${
                      msg.sender._id === user?._id ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {format(new Date(msg.createdAt), "p")}
                  </span>
                </div>
                {msg.sender._id === user?._id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender.name}`} />
                    <AvatarFallback>{msg.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={isSending}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
