"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Mail, Phone, MapPin, CalendarCheck, MessageSquare, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { NewConversationDialog } from "@/components/chat/new-conversation-dialog"
import { UserIcon } from "lucide-react" // Import UserIcon

interface UserProfile {
  _id: string
  name: string
  email: string
  role: "landlord" | "tenant" | "admin"
  country?: string
  phone?: string
  createdAt: string
}

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

interface Booking {
  _id: string
  property: {
    _id: string
    title: string
    location: string
    price: number
    imageUrl?: string
  }
  landlord: {
    _id: string
    name: string
  }
  startDate: string
  endDate: string
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: string
}

export default function UserProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view user profiles.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    fetchProfile()
  }, [id, currentUser, authLoading, router, toast])

  const fetchProfile = async () => {
    setIsLoadingProfile(true)
    setIsLoadingContent(true)
    try {
      const token = localStorage.getItem("token")
      const profileResponse = await fetch(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (profileResponse.ok) {
        const profileData: UserProfile = await profileResponse.json()
        setProfile(profileData)

        if (profileData.role === "landlord") {
          await fetchLandlordListings(profileData._id)
        } else if (profileData.role === "tenant") {
          await fetchTenantBookings(profileData._id)
        }
      } else {
        const errorData = await profileResponse.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch user profile.",
          variant: "destructive",
        })
        setProfile(null)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching the profile.",
        variant: "destructive",
      })
      setProfile(null)
    } finally {
      setIsLoadingProfile(false)
      setIsLoadingContent(false)
    }
  }

  const fetchLandlordListings = async (landlordId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/listings/my-listings?userId=${landlordId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setListings(data)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch listings.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching landlord listings:", error)
    }
  }

  const fetchTenantBookings = async (tenantId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/bookings/my-bookings?userId=${tenantId}`, {
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
          description: errorData.message || "Failed to fetch bookings.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching tenant bookings:", error)
    }
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

  if (isLoadingProfile || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-700">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <UserIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
        <p className="text-gray-600 mb-4">The user profile you are looking for does not exist or is inaccessible.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
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
              {currentUser ? (
                <>
                  {currentUser.role === "landlord" && (
                    <Button variant="outline" onClick={() => router.push("/dashboard")}>
                      My Dashboard
                    </Button>
                  )}
                  {currentUser.role === "tenant" && (
                    <Button variant="outline" onClick={() => router.push("/tenant-dashboard")}>
                      My Bookings
                    </Button>
                  )}
                  <Button onClick={() => router.push("/listings")}>Browse Properties</Button>
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
        <Card className="mb-8">
          <CardContent className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={`/placeholder.svg?text=${profile.name.charAt(0)}`} />
              <AvatarFallback className="text-5xl">{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.name}</h1>
              <Badge variant="secondary" className="capitalize mb-3">
                {profile.role}
              </Badge>
              <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 mb-2">
                <Mail className="h-4 w-4" />
                {profile.email}
              </p>
              {profile.phone && (
                <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </p>
              )}
              {profile.country && (
                <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  {profile.country}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Joined: {format(new Date(profile.createdAt), "MMM dd, yyyy")}
              </p>
              {currentUser && currentUser._id !== profile._id && (
                <Button className="mt-4" onClick={() => setShowNewConversationDialog(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message {profile.name}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {profile.role === "landlord" && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Properties by {profile.name}</h2>
            {isLoadingContent ? (
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
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-10 w-10 mx-auto mb-3" />
                <p>No properties listed by this landlord yet.</p>
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
                      <Badge variant="secondary" className="text-lg font-semibold">
                        ${listing.price}/month
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {profile.role === "tenant" && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bookings by {profile.name}</h2>
            {isLoadingContent ? (
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
              <div className="text-center py-8 text-gray-500">
                <CalendarCheck className="h-10 w-10 mx-auto mb-3" />
                <p>No bookings made by this tenant yet.</p>
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
                      <p className="text-sm text-gray-600">
                        Dates: {format(new Date(booking.startDate), "MMM dd, yyyy")} -{" "}
                        {format(new Date(booking.endDate), "MMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-gray-600">Total: KSh {booking.totalPrice.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Landlord: {booking.landlord.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {currentUser && currentUser._id !== profile._id && (
        <NewConversationDialog
          open={showNewConversationDialog}
          onOpenChange={setShowNewConversationDialog}
          recipientId={profile._id}
          recipientName={profile.name}
        />
      )}
    </div>
  )
}
