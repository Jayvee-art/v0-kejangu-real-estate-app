"use client"

import * as React from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNowStrict } from "date-fns"
import { Building2, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface ConversationItem {
  _id: string
  otherParticipant: {
    _id: string
    name: string
    email: string
    role: string
  } | null
  lastMessage: {
    content: string
    createdAt: string
    senderName: string
  } | null
  property: {
    _id: string
    title: string
    imageUrl?: string
  } | null
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
  const [conversations, setConversations] = React.useState<ConversationItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  const fetchConversations = React.useCallback(async () => {
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
        const data: ConversationItem[] = await response.json()
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
  }, [user, toast])

  React.useEffect(() => {
    fetchConversations()
    // Optional: Set up polling for real-time updates (e.g., every 5 seconds)
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchTerm.toLowerCase()
    const participantName = conv.otherParticipant?.name.toLowerCase() || ""
    const propertyTitle = conv.property?.title.toLowerCase() || ""
    const lastMessageContent = conv.lastMessage?.content.toLowerCase() || ""

    return (
      participantName.includes(searchLower) ||
      propertyTitle.includes(searchLower) ||
      lastMessageContent.includes(searchLower)
    )
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <Avatar className="h-10 w-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-2">Messages</h2>
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="h-10 w-10 mx-auto mb-3" />
              <p>No conversations found.</p>
              <p className="text-sm">Start a chat from a property listing.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv._id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedConversationId === conv._id ? "bg-gray-100" : ""
                }`}
                onClick={() => onSelectConversation(conv._id)}
              >
                <Link href={`/profile/${conv.otherParticipant?._id}`} className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${conv.otherParticipant?.name}`}
                    />
                    <AvatarFallback>
                      {conv.otherParticipant?.name
                        ? conv.otherParticipant.name.charAt(0).toUpperCase()
                        : conv.property?.title.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <Link href={`/profile/${conv.otherParticipant?._id}`}>
                      <p className="font-medium truncate">{conv.otherParticipant?.name || "Unknown User"}</p>
                    </Link>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatDistanceToNowStrict(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {conv.property && (
                    <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {conv.property.title}
                    </p>
                  )}
                  {conv.lastMessage ? (
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No messages yet.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
