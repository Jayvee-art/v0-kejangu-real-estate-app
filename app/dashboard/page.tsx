"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, Edit, Trash2, MapPin, LogOut, MessageSquare, UserIcon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { AddListingDialog } from "@/components/add-listing-dialog"
import { EditListingDialog } from "@/components/edit-listing-dialog"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarCheck } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Listing {
  _id: string
  title: string
  description: string
  price: number
  location: string
  imageUrl?: string
}

interface Booking {
  _id: string
  property: {
    _id: string
    title: string
    location: string
    price: number
    imageUrl?: string
  }
  tenant: {
    _id: string
    name: string
    email: string
  }
  startDate: string
  endDate: string
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: string
}

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isBookingsLoading, setIsBookingsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.role !== "landlord") {
      router.push("/listings")
      return
    }

    fetchMyListings()
    fetchMyBookingsAsLandlord()
  }, [user, router])

  const fetchMyListings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/listings/my-listings", {
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

  const fetchMyBookingsAsLandlord = async () => {
    setIsBookingsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/bookings/landlord-bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch bookings for your properties",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching landlord bookings:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching bookings.",
        variant: "destructive",
      })
    } finally {
      setIsBookingsLoading(false)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setListings(listings.filter((listing) => listing._id !== listingId))
        toast({
          title: "Success",
          description: "Listing deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete listing",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, status: "confirmed" | "cancelled") => {
    if (!confirm(`Are you sure you want to ${status} this booking?`)) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Booking ${status} successfully!`,
        })
        fetchMyBookingsAsLandlord() // Re-fetch bookings to update the UI
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || `Failed to ${status} booking.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error updating booking status to ${status}:`, error)
      toast({
        title: "Error",
        description: "Something went wrong while updating booking status.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getStatusBadgeVariant = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      case "completed":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (!user || user.role !== "landlord") {
    return null
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
              <Link href={`/profile/${user.id}`}>
                <Button variant="outline" size="sm">
                  <UserIcon className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  My Messages
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">My Properties</TabsTrigger>
            <TabsTrigger value="bookings">Property Bookings</TabsTrigger>
          </TabsList>

          {/* My Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
                <p className="text-gray-600">Manage your rental listings</p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{listings.length}</CardTitle>
                  <CardDescription>Total Properties</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    ${listings.reduce((sum, listing) => sum + listing.price, 0).toLocaleString()}
                  </CardTitle>
                  <CardDescription>Total Monthly Rent</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    $
                    {listings.length > 0
                      ? Math.round(listings.reduce((sum, listing) => sum + listing.price, 0) / listings.length)
                      : 0}
                  </CardTitle>
                  <CardDescription>Average Rent</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Listings */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first rental property</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Button>
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => setEditingListing(listing)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteListing(listing._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Property Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Property Bookings</h1>
                <p className="text-gray-600">View bookings for your properties</p>
              </div>
            </div>

            {isBookingsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
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
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <CalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings for your properties yet</h3>
                <p className="text-gray-600 mb-4">Tenants will send booking requests here.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <Card key={booking._id} className="overflow-hidden">
                    <div className="h-48 bg-gray-200 relative">
                      {booking.property.imageUrl ? (
                        <Image
                          src={booking.property.imageUrl || "/placeholder.svg"}
                          alt={booking.property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Building2 className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{booking.property.title}</CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {booking.property.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Dates:</span>{" "}
                          {format(new Date(booking.startDate), "MMM dd, yyyy")} -{" "}
                          {format(new Date(booking.endDate), "MMM dd, yyyy")}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Total Price:</span> KSh {booking.totalPrice.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Tenant:</span>{" "}
                          <Link href={`/profile/${booking.tenant._id}`} className="text-blue-600 hover:underline">
                            {booking.tenant.name} ({booking.tenant.email})
                          </Link>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/listings/${booking.property._id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full bg-transparent">
                            View Property
                          </Button>
                        </Link>
                        {booking.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleUpdateBookingStatus(booking._id, "confirmed")}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateBookingStatus(booking._id, "cancelled")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddListingDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          setShowAddDialog(false)
          fetchMyListings()
        }}
      />

      {editingListing && (
        <EditListingDialog
          listing={editingListing}
          open={!!editingListing}
          onOpenChange={(open) => !open && setEditingListing(null)}
          onSuccess={() => {
            setEditingListing(null)
            fetchMyListings()
          }}
        />
      )}
    </div>
  )
}
