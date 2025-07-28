"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"

interface Conversation {
  _id: string
  participants: {
    _id: string
    name: string
    email: string
  }[]
  lastMessage?: {
    _id: string
    content: string
    sender: string
    createdAt: string
  }
  property?: {
    _id: string
    title: string
  }
  createdAt: string
  updatedAt: string
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void
  selectedConversationId: string | null
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/conversations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
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
          title: "Error",
          description: "Something went wrong while fetching conversations.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [user, toast])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading conversations...</p>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
        <MessageSquare className="h-12 w-12 mb-4" />
        <p className="text-lg font-semibold">No conversations yet</p>
        <p className="text-sm">Start a new chat from a property listing or wait for a message.</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {conversations.map((conversation) => {
          const otherParticipant = conversation.participants.find((p) => p._id !== user?.id)
          if (!otherParticipant) return null // Should not happen if conversation is valid

          return (
            <div
              key={conversation._id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                selectedConversationId === conversation._id ? "bg-blue-50" : "hover:bg-gray-100"
              }`}
              onClick={() => onSelectConversation(conversation._id)}
            >
              <Link href={`/profile/${otherParticipant._id}`} className="flex-shrink-0">
                <Avatar>
                  <AvatarImage src={`/placeholder.svg?text=${otherParticipant.name.charAt(0)}`} />
                  <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <Link href={`/profile/${otherParticipant._id}`}>
                    <h3 className="font-semibold text-gray-900 truncate">{otherParticipant.name}</h3>
                  </Link>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                {conversation.property && (
                  <p className="text-xs text-blue-600 truncate">Property: {conversation.property.title}</p>
                )}
                {conversation.lastMessage ? (
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage.content}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No messages yet</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
