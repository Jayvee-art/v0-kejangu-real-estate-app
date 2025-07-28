"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, MessageSquare } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { BookPropertyDialog } from "@/components/book-property-dialog"
import { NewConversationDialog } from "@/components/chat/new-conversation-dialog"

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

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBookDialog, setShowBookDialog] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false)

  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    fetchListings()
  }, [user, authLoading, router])

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/listings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setListings(data)
      }
    } catch (error) {
      console.error("Error fetching listings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookClick = (listing: Listing) => {
    setSelectedListing(listing)
    setShowBookDialog(true)
  }

  const handleMessageLandlordClick = (listing: Listing) => {
    setSelectedListing(listing)
    setShowNewConversationDialog(true)
  }

  if (authLoading || !user) {
    return null // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Kejangu</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              {user.role === "landlord" ? (
                <Button onClick={() => router.push("/dashboard")}>My Dashboard</Button>
              ) : (
                <Button onClick={() => router.push("/tenant-dashboard")}>My Bookings</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Listings Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Properties</h1>
          <p className="text-gray-600">Find your next home or rental property</p>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties available</h3>
            <p className="text-gray-600 mb-4">Check back later or adjust your search criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing._id} className="overflow-hidden">
                <div className="h-48 bg-gray-200 relative">
                  {listing.imageUrl ? (
                    <Image
                      src={listing.imageUrl || "/placeholder.svg"}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building2 className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{listing.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-lg font-semibold">
                      ${listing.price}/month
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {user.role === "tenant" && (
                      <Button size="sm" className="flex-1" onClick={() => handleBookClick(listing)}>
                        Book Now
                      </Button>
                    )}
                    {user._id !== listing.landlord._id && ( // Don't show message button to self
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleMessageLandlordClick(listing)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message Landlord
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedListing && (
        <BookPropertyDialog
          open={showBookDialog}
          onOpenChange={setShowBookDialog}
          listing={selectedListing}
          onSuccess={() => {
            setShowBookDialog(false)
            toast({
              title: "Booking Request Sent",
              description: "Your booking request has been sent to the landlord.",
            })
          }}
        />
      )}

      {selectedListing && (
        <NewConversationDialog
          open={showNewConversationDialog}
          onOpenChange={setShowNewConversationDialog}
          recipientId={selectedListing.landlord._id}
          recipientName={selectedListing.landlord.name}
          propertyId={selectedListing._id}
          propertyName={selectedListing.title}
        />
      )}
    </div>
  )
}
