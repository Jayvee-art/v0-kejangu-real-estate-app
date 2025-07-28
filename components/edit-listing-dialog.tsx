"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, UploadCloud } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface Listing {
  _id: string
  title: string
  description: string
  price: number
  location: string
  imageUrl?: string
  landlord: {
    _id: string
    name: string
  }
}

interface EditListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: Listing | null
  onSuccess: () => void
}

export function EditListingDialog({ open, onOpenChange, listing, onSuccess }: EditListingDialogProps) {
  const [title, setTitle] = useState(listing?.title || "")
  const [description, setDescription] = useState(listing?.description || "")
  const [price, setPrice] = useState(listing?.price.toString() || "")
  const [location, setLocation] = useState(listing?.location || "")
  const [imageUrl, setImageUrl] = useState<string | null>(listing?.imageUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (listing) {
      setTitle(listing.title)
      setDescription(listing.description)
      setPrice(listing.price.toString())
      setLocation(listing.location)
      setImageUrl(listing.imageUrl || null)
    } else {
      // Reset form if no listing is provided (e.g., dialog closed or new listing selected)
      setTitle("")
      setDescription("")
      setPrice("")
      setLocation("")
      setImageUrl(null)
    }
  }, [listing])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setImageUrl(data.imageUrl)
        toast({
          title: "Image Uploaded",
          description: "New property image uploaded successfully.",
        })
      } else {
        toast({
          title: "Upload Failed",
          description: data.message || "Failed to upload image.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Image upload error:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server for image upload.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!listing) {
      toast({
        title: "Error",
        description: "No listing selected for editing.",
        variant: "destructive",
      })
      return
    }

    if (!user || user.role !== "landlord" || user.id !== listing.landlord._id) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to edit this listing.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/listings/${listing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          price: Number.parseFloat(price),
          location,
          imageUrl,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Listing Updated! 🎉",
          description: "Your property listing has been updated successfully.",
        })
        onSuccess()
        onOpenChange(false)
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Something went wrong.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Edit listing error:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Property Listing</DialogTitle>
          <DialogDescription>Update the details for your rental property.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Property Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Spacious 3-Bedroom Apartment"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your property in detail..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Monthly Price (KSh)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 50000"
                required
                min="0"
                step="any"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Kilimani, Nairobi"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Property Image</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1"
                disabled={isSubmitting || isUploading}
              />
              {isUploading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            </div>
            {imageUrl && (
              <div className="relative w-full h-48 mt-2 rounded-md overflow-hidden border">
                <Image src={imageUrl || "/placeholder.svg"} alt="Property Preview" fill className="object-cover" />
              </div>
            )}
            {!imageUrl && !isUploading && (
              <div className="flex items-center justify-center h-24 w-full border-2 border-dashed rounded-md text-gray-400">
                <UploadCloud className="h-8 w-8" />
                <span className="ml-2 text-sm">Upload Image</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
