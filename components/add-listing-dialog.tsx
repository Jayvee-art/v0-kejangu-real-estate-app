"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Upload } from "lucide-react"

interface AddListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddListingDialog({ open, onOpenChange, onSuccess }: AddListingDialogProps) {
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    let uploadedImageUrl = ""
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
        uploadedImageUrl = uploadData.imageUrl
        toast({
          title: "Image Uploaded",
          description: "Property image uploaded successfully.",
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
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          imageUrl: uploadedImageUrl, // Use the uploaded URL
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Property listing added successfully",
        })
        setFormData({
          title: "",
          description: "",
          price: "",
          location: "",
        })
        setSelectedImageFile(null) // Clear selected file
        onSuccess()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to add listing",
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
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>Create a new rental listing for your property.</DialogDescription>
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
            {selectedImageFile && (
              <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border border-gray-200">
                <Image
                  src={URL.createObjectURL(selectedImageFile) || "/placeholder.svg"}
                  alt="Selected preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {!selectedImageFile && (
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
              {isLoading ? "Adding..." : "Add Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
