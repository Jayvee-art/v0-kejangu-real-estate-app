"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, MapPin, MessageSquare, Search, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { BookPropertyDialog } from "@/components/book-property-dialog"
import { NewConversationDialog } from "@/components/chat/new-conversation-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface Listing {
  _id: string
  title: string
  description: string
  price: number
  location: string
  imageUrl?: string
  landlord: {
    _id: string // Add landlord ID
    name: string
    email: string
  }
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [priceFilter, setPriceFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showBookDialog, setShowBookDialog] = useState(false)
  const [selectedListingForBooking, setSelectedListingForBooking] = useState<Listing | null>(null)
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false)
  const [selectedLandlordForChat, setSelectedLandlordForChat] = useState<{
    id: string
    name: string
    propertyId: string
    propertyTitle: string
  } | null>(null)

  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem("token") // Ensure token is available for authenticated requests
      const response = await fetch("/api/listings", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "", // Send token if available
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

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPrice =
      !priceFilter ||
      (priceFilter === "low" && listing.price < 30000) ||
      (priceFilter === "medium" && listing.price >= 30000 && listing.price < 70000) ||
      (priceFilter === "high" && listing.price >= 70000)

    const matchesLocation = !locationFilter || listing.location.toLowerCase().includes(locationFilter.toLowerCase())

    return matchesSearch && matchesPrice && matchesLocation
  })

  const handleWhatsAppContact = (listing: Listing) => {
    const message = `Hi! I'm interested in your property: ${listing.title} located at ${listing.location}. Can you provide more details?`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleBookProperty = (listing: Listing) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a property.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }
    setSelectedListingForBooking(listing)
    setShowBookDialog(true)
  }

  const handleMessageLandlord = (listing: Listing) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to message a landlord.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }
    if (user._id === listing.landlord._id) {
      toast({
        title: "Cannot Message Yourself",
        description: "You are the landlord for this property.",
        variant: "default",
      })
      return
    }
    setSelectedLandlordForChat({
      id: listing.landlord._id,
      name: listing.landlord.name,
      propertyId: listing._id,
      propertyTitle: listing.title,
    })
    setShowNewConversationDialog(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Kejangu</span>
            </Link>
            <nav className="flex space-x-4">
              {user ? (
                <>
                  {user.role === "landlord" ? (
                    <Button onClick={() => router.push("/dashboard")}>My Dashboard</Button>
                  ) : (
                    <Button onClick={() => router.push("/tenant-dashboard")}>My Bookings</Button>
                  )}
                  <Button variant="outline" onClick={() => router.push("/auth/login")}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Properties</h1>
          <p className="text-gray-600">Find your perfect rental home from our curated listings</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="westlands">Westlands</SelectItem>
                  <SelectItem value="karen">Karen</SelectItem>
                  <SelectItem value="kilimani">Kilimani</SelectItem>
                  <SelectItem value="runda">Runda</SelectItem>
                  <SelectItem value="southb">South B</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Under KSh 30,000</SelectItem>
                  <SelectItem value="medium">KSh 30,000 - 70,000</SelectItem>
                  <SelectItem value="high">Above KSh 70,000</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setPriceFilter("")
                  setLocationFilter("")
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredListings.length} of {listings.length} properties
          </p>
        </div>

        {/* Listings */}
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
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setPriceFilter("")
                setLocationFilter("")
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  {listing.imageUrl ? (
                    <Image
                      src={listing.imageUrl || "/placeholder.svg?height=200&width=400&query=modern rental property"}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-blue-200">
                      <Building2 className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white/90 text-gray-900 font-semibold">
                      KSh {listing.price.toLocaleString()}
                    </Badge>
                  </div>
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
                    <span className="text-sm text-gray-500">
                      by{" "}
                      <Link href={`/profile/${listing.landlord._id}`} className="text-blue-600 hover:underline">
                        {listing.landlord.name}
                      </Link>
                    </span>
                    <Badge variant="outline">Available</Badge>
                  </div>
                  <div className="flex gap-2">
                    {user?.role === "tenant" && (
                      <Button size="sm" className="flex-1" onClick={() => handleBookProperty(listing)}>
                        Book Now
                      </Button>
                    )}
                    {user && user._id !== listing.landlord._id && (
                      <Button size="sm" variant="outline" onClick={() => handleMessageLandlord(listing)}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    )}
                    {!user && (
                      <Button size="sm" variant="outline" onClick={() => handleWhatsAppContact(listing)}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedListingForBooking && (
        <BookPropertyDialog
          open={showBookDialog}
          onOpenChange={setShowBookDialog}
          listing={selectedListingForBooking}
          onSuccess={() => {
            setShowBookDialog(false)
            setSelectedListingForBooking(null)
            // Optionally refresh listings or show a success message
          }}
        />
      )}

      {selectedLandlordForChat && (
        <NewConversationDialog
          open={showNewConversationDialog}
          onOpenChange={setShowNewConversationDialog}
          recipientId={selectedLandlordForChat.id}
          recipientName={selectedLandlordForChat.name}
          propertyId={selectedLandlordForChat.propertyId}
          propertyName={selectedLandlordForChat.propertyTitle}
        />
      )}
    </div>
  )
}
