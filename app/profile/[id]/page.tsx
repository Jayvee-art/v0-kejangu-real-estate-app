"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Mail, Phone, MapPin, CalendarCheck, MessageSquare, UserIcon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { format } from "date-fns"
import Link from "next/link"

interface UserProfile {
  _id: string
  name: string
  email: string
  role: "landlord" | "tenant"
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
    name: string
    email: string
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

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null)
  const [userListings, setUserListings] = useState<Listing[]>([])
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || authLoading) return

    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    const fetchUserProfile = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Authentication token not found.")
          setIsLoading(false)
          return
        }

        // Fetch user profile
        const userResponse = await fetch(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!userResponse.ok) {
          const errorData = await userResponse.json()
          throw new Error(errorData.message || "Failed to fetch user profile.")
        }
        const userData: UserProfile = await userResponse.json()
        setProfileUser(userData)

        // Fetch associated data based on role
        if (userData.role === "landlord") {
          const listingsResponse = await fetch(`/api/listings/my-listings?userId=${userData._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (listingsResponse.ok) {
            const listingsData = await listingsResponse.json()
            setUserListings(listingsData)
          } else {
            console.error("Failed to fetch landlord listings:", await listingsResponse.json())
          }
        } else if (userData.role === "tenant") {
          const bookingsResponse = await fetch(`/api/bookings/my-bookings?userId=${userData._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json()
            setUserBookings(bookingsData)
          } else {
            console.error("Failed to fetch tenant bookings:", await bookingsResponse.json())
          }
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.")
        toast({
          title: "Error",
          description: err.message || "Failed to load profile.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [id, currentUser, authLoading, router, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="text-xl font-bold text-red-600">Error</CardTitle>
          <CardDescription className="mt-2 text-gray-600">{error}</CardDescription>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="text-xl font-bold text-gray-800">Profile Not Found</CardTitle>
          <CardDescription className="mt-2 text-gray-600">
            The user profile you are looking for does not exist.
          </CardDescription>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go Home
          </Button>
        </Card>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="mb-8">
          <CardHeader className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <UserIcon className="w-12 h-12 text-gray-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">{profileUser.name}</CardTitle>
            <CardDescription className="text-gray-600">
              <Badge variant="outline" className="capitalize text-lg px-3 py-1">
                {profileUser.role}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-5 h-5" />
              <span>{profileUser.email}</span>
            </div>
            {profileUser.phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-5 h-5" />
                <span>{profileUser.phone}</span>
              </div>
            )}
            {profileUser.country && (
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-5 h-5" />
                <span>{profileUser.country}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-700">
              <CalendarCheck className="w-5 h-5" />
              <span>Joined: {format(new Date(profileUser.createdAt), "MMM dd, yyyy")}</span>
            </div>
            {currentUser?._id !== profileUser._id && (
              <div className="md:col-span-2 flex justify-center mt-4">
                <Link href={`/messages?recipientId=${profileUser._id}`}>
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message {profileUser.name}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {profileUser.role === "landlord" && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {profileUser.name}'s Properties ({userListings.length})
            </h2>
            {userListings.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No properties listed by this landlord yet.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map((listing) => (
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
                      <Link href={`/listings/${listing._id}`}>
                        <Button size="sm" className="w-full">
                          View Property
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {profileUser.role === "tenant" && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {profileUser.name}'s Bookings ({userBookings.length})
            </h2>
            {userBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No bookings made by this tenant yet.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBookings.map((booking) => (
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
                          <span className="font-medium">Landlord:</span> {booking.landlord.name}
                        </p>
                      </div>
                      <Link href={`/listings/${booking.property._id}`}>
                        <Button size="sm" className="w-full">
                          View Property
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
