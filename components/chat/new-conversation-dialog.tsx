"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipientId: string
  recipientName: string
  propertyId?: string
  propertyName?: string
}

export function NewConversationDialog({
  open,
  onOpenChange,
  recipientId,
  recipientName,
  propertyId,
  propertyName,
}: NewConversationDialogProps) {
  const [messageContent, setMessageContent] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!open) {
      setMessageContent("") // Reset message when dialog closes
    }
  }, [open])

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start a conversation.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!messageContent.trim()) {
      toast({
        title: "Message Required",
        description: "Please type a message to start the conversation.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId, propertyId }),
      })

      const convData = await conversationResponse.json()

      if (!conversationResponse.ok && conversationResponse.status !== 200) {
        // 200 means conversation already exists, which is fine
        throw new Error(convData.message || "Failed to create/find conversation.")
      }

      const conversationId = convData.conversationId

      // Send the initial message
      const messageResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: messageContent }),
      })

      if (messageResponse.ok) {
        toast({
          title: "Message Sent!",
          description: `Your message has been sent to ${recipientName}.`,
        })
        onOpenChange(false)
        // Optionally, open the chat layout directly
        // router.push(`/messages?conversationId=${conversationId}`);
      } else {
        const msgData = await messageResponse.json()
        throw new Error(msgData.message || "Failed to send message.")
      }
    } catch (error: any) {
      console.error("Error starting conversation:", error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Message {recipientName}</DialogTitle>
          <DialogDescription>
            {propertyName ? `About property: ${propertyName}` : "Start a direct conversation."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleStartConversation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message here..."
              rows={5}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !messageContent.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
