"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, MessageSquare } from "lucide-react"
import { formatDistanceToNowStrict } from "date-fns"
import Link from "next/link"
import Image from "next/image"

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

interface LastMessage {
  content: string
  sender: string
  createdAt: string
}

interface Conversation {
  _id: string
  otherParticipant: Participant
  property?: Property
  lastMessage?: LastMessage
  createdAt: string
  updatedAt: string
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void
  selectedConversationId: string | null
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user) return

    const fetchConversations = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/conversations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data: Conversation[] = await response.json()
          setConversations(data)
        } else {
          const errorData = await response.json()
          toast({
            title: "Error",
            description: errorData.message || "Failed to fetch conversations.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
        toast({
          title: "Network Error",
          description: "Unable to connect to server to fetch conversations.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()

    // Optional: Set up polling for new conversations/messages
    const interval = setInterval(fetchConversations, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [user, authLoading, toast])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading conversations...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center text-center p-4">
        <p className="text-gray-500">Please log in to view your messages.</p>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-4">
        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-600 mb-4">
          Start a new conversation by messaging a landlord or tenant from a property listing or profile page.
        </p>
        <Link href="/listings">
          <Button>Browse Properties</Button>
        </Link>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {conversations.map((conv) => (
          <div
            key={conv._id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
              selectedConversationId === conv._id
                ? "bg-blue-100 dark:bg-blue-900"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => onSelectConversation(conv._id)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${conv.otherParticipant?.name || "User"}`}
              />
              <AvatarFallback>{conv.otherParticipant?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold truncate">{conv.otherParticipant?.name || "Unknown User"}</h4>
                {conv.lastMessage && (
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatDistanceToNowStrict(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              {conv.property && (
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  {conv.property.imageUrl && (
                    <Image
                      src={conv.property.imageUrl || "/placeholder.svg"}
                      alt={conv.property.title}
                      width={20}
                      height={20}
                      className="rounded mr-1 object-cover"
                    />
                  )}
                  <span className="truncate">{conv.property.title}</span>
                </div>
              )}
              {conv.lastMessage && (
                <p className="text-sm text-gray-700 truncate mt-1">
                  {conv.lastMessage.sender === user._id ? "You: " : ""}
                  {conv.lastMessage.content}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
