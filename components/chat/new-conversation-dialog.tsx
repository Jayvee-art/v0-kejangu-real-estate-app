"use client"

import { DialogDescription } from "@/components/ui/dialog"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

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
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [messageContent, setMessageContent] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleStartConversation = async () => {
    if (!user || !messageContent.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId,
          propertyId,
          initialMessage: messageContent,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: "Conversation started successfully!",
        })
        setMessageContent("")
        onOpenChange(false)
        // Redirect to the chat layout with the new conversation selected
        router.push(`/messages?conversationId=${data.conversationId}`)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to start conversation.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error starting conversation:", error)
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Conversation with {recipientName}</DialogTitle>
          {propertyName && <DialogDescription>Regarding property: {propertyName}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Type your initial message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={5}
              disabled={isSending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleStartConversation} disabled={isSending}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
