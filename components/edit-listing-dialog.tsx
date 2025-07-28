"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Upload } from "lucide-react"

interface Listing {
  _id: string
  title: string
  description: string
  price: number
  location: string
  imageUrl?: string
}

interface EditListingDialogProps {
  listing: Listing
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditListingDialog({ listing, open, onOpenChange, onSuccess }: EditListingDialogProps) {
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    currentImageUrl: "", // Keep track of current image URL
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title,
        description: listing.description,
        price: listing.price.toString(),
        location: listing.location,
        currentImageUrl: listing.imageUrl || "", // Set current image URL
      })
      setSelectedImageFile(null) // Clear selected file on new listing prop
    }
  }, [listing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    let finalImageUrl = formData.currentImageUrl // Default to current image

    if (selectedImageFile) {
      const uploadFormData = new FormData()
      uploadFormData.append("image", selectedImageFile)

      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.message || "Image upload failed")
        }
        const uploadData = await uploadResponse.json()
        finalImageUrl = uploadData.imageUrl
        toast({
          title: "Image Uploaded",
          description: "New property image uploaded successfully.",
        })
      } catch (uploadError: any) {
        toast({
          title: "Image Upload Error",
          description: uploadError.message,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/listings/${listing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          imageUrl: finalImageUrl, // Use the new or existing URL
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Property listing updated successfully",
        })
        setSelectedImageFile(null) // Clear selected file
        onSuccess()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to update listing",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
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
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>Update your rental listing details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Property Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Modern 2BR Apartment"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Downtown, City Center"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Monthly Rent ($)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., 1200"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your property..."
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Property Image (optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImageFile(e.target.files ? e.target.files[0] : null)}
              className="cursor-pointer"
            />
            {(selectedImageFile || formData.currentImageUrl) && (
              <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border border-gray-200">
                <Image
                  src={
                    selectedImageFile
                      ? URL.createObjectURL(selectedImageFile)
                      : formData.currentImageUrl || "/placeholder.svg"
                  }
                  alt="Property preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {!selectedImageFile && !formData.currentImageUrl && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Upload className="h-4 w-4" /> Max 5MB, JPG/PNG
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
