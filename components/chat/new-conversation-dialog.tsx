"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipientId: string
  propertyName?: string
  propertyId?: string
  onSuccess: (newConversationId: string) => void
}

interface RecipientProfile {
  _id: string
  name: string
  email: string
  role: string
}

export function NewConversationDialog({
  open,
  onOpenChange,
  recipientId,
  propertyName,
  propertyId,
  onSuccess,
}: NewConversationDialogProps) {
  const [initialMessage, setInitialMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recipientProfile, setRecipientProfile] = useState<RecipientProfile | null>(null)
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(true)
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!open || authLoading || !user) {
      setRecipientProfile(null)
      setInitialMessage("")
      return
    }

    const fetchRecipientProfile = async () => {
      setIsLoadingRecipient(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/users/${recipientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data: RecipientProfile = await response.json()
          setRecipientProfile(data)
        } else {
          const errorData = await response.json()
          toast({
            title: "Error",
            description: errorData.message || "Failed to fetch recipient profile.",
            variant: "destructive",
          })
          onOpenChange(false) // Close dialog on error
        }
      } catch (error) {
        console.error("Error fetching recipient profile:", error)
        toast({
          title: "Network Error",
          description: "Unable to connect to server to fetch recipient profile.",
          variant: "destructive",
        })
        onOpenChange(false) // Close dialog on error
      } finally {
        setIsLoadingRecipient(false)
      }
    }

    fetchRecipientProfile()
  }, [open, recipientId, user, authLoading, onOpenChange, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!initialMessage.trim() || !user || !recipientProfile) {
      toast({
        title: "Missing Information",
        description: "Please enter a message and ensure recipient details are loaded.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
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
          propertyId: propertyId || null,
          initialMessage,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Conversation Started!",
          description: `Your message has been sent to ${recipientProfile.name}.`,
        })
        onSuccess(data.conversation._id) // Pass new conversation ID to parent
        onOpenChange(false)
      } else {
        toast({
          title: "Failed to Start Conversation",
          description: data.message || "An error occurred.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Start conversation error:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const dialogTitle = propertyName ? `Message about ${propertyName}` : `Message ${recipientProfile?.name || "User"}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {propertyName
              ? `Send a message to ${recipientProfile?.name || "the landlord"} regarding ${propertyName}.`
              : `Start a new conversation with ${recipientProfile?.name || "this user"}.`}
          </DialogDescription>
        </DialogHeader>
        {isLoadingRecipient ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading recipient details...</span>
          </div>
        ) : !recipientProfile ? (
          <div className="text-center py-8 text-red-500">
            <p>Could not load recipient details. Please try again.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient-name">Recipient</Label>
              <p id="recipient-name" className="text-sm font-medium">
                {recipientProfile.name} ({recipientProfile.email})
              </p>
            </div>
            {propertyName && (
              <div className="grid gap-2">
                <Label htmlFor="property-name">Property</Label>
                <p id="property-name" className="text-sm font-medium">
                  {propertyName}
                </p>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="Type your initial message here..."
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                rows={5}
                required
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !initialMessage.trim()}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Message
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
