"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2, UserIcon, Mail, MapPin, Building2, XCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

interface UserProfile {
  _id: string
  name: string
  email: string
  role: "landlord" | "tenant" | "admin"
  country?: string
  phone?: string
  subscribeToUpdates?: boolean
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

interface Listing {
  _id: string
  title: string
  description: string
  price: number
  location: string
  imageUrl?: string
  landlord: string // Only ID needed here
}

interface Booking {
  _id: string
  property: {
    _id: string
    title: string
    location: string
    imageUrl?: string
  }
  tenant: {
    _id: string
    name: string
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

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser, loading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [country, setCountry] = useState("")
  const [phone, setPhone] = useState("")
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(false)

  const [userListings, setUserListings] = useState<Listing[]>([])
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)

  const isMyProfile = currentUser?._id === userId || userId === "me"

  useEffect(() => {
    if (authLoading) return

    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data: UserProfile = await response.json()
          setProfile(data)
          setName(data.name)
          setEmail(data.email)
          setCountry(data.country || "")
          setPhone(data.phone || "")
          setSubscribeToUpdates(data.subscribeToUpdates || false)
        } else {
          const errorData = await response.json()
          toast({
            title: "Error",
            description: errorData.message || "Failed to fetch user profile.",
            variant: "destructive",
          })
          router.push("/") // Redirect if profile not found or unauthorized
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Network Error",
          description: "Unable to connect to server to fetch profile.",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [userId, authLoading, router, toast, currentUser?._id])

  useEffect(() => {
    if (!profile) return

    const fetchUserListings = async () => {
      if (profile.role !== "landlord") {
        setIsLoadingListings(false)
        return
      }
      setIsLoadingListings(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/listings/my-listings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data: Listing[] = await response.json()
          setUserListings(data)
        } else {
          const errorData = await response.json()
          toast({
            title: "Error",
            description: errorData.message || "Failed to fetch listings.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching user listings:", error)
        toast({
          title: "Network Error",
          description: "Unable to connect to server to fetch listings.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingListings(false)
      }
    }

    const fetchUserBookings = async () => {
      if (profile.role !== "tenant") {
        setIsLoadingBookings(false)
        return
      }
      setIsLoadingBookings(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/bookings/my-bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data: Booking[] = await response.json()
          setUserBookings(data)
        } else {
          const errorData = await response.json()
          toast({
            title: "Error",
            description: errorData.message || "Failed to fetch bookings.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching user bookings:", error)
        toast({
          title: "Network Error",
          description: "Unable to connect to server to fetch bookings.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingBookings(false)
      }
    }

    fetchUserListings()
    fetchUserBookings()
  }, [profile, toast])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${profile?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, country, phone, subscribeToUpdates }),
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data) // Update local profile state
        refreshUser() // Refresh user in AuthContext
        toast({
          title: "Profile Updated! 🎉",
          description: "Your profile information has been saved.",
        })
        setIsEditing(false)
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Something went wrong during profile update.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        <XCircle className="h-8 w-8 mr-2" />
        <span>Profile not found or access denied.</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} />
          <AvatarFallback>
            <UserIcon className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold">{profile.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 capitalize">{profile.role}</p>
        {profile.email && (
          <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <Mail className="h-4 w-4" /> {profile.email}
          </p>
        )}
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          {profile.role === "landlord" && <TabsTrigger value="listings">My Listings</TabsTrigger>}
          {profile.role === "tenant" && <TabsTrigger value="bookings">My Bookings</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
              {isMyProfile && (
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)} disabled={isSaving}>
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing || isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing || isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., Kenya"
                    disabled={!isEditing || isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +2547XXXXXXXX"
                    disabled={!isEditing || isSaving}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subscribe"
                  checked={subscribeToUpdates}
                  onCheckedChange={(checked) => setSubscribeToUpdates(Boolean(checked))}
                  disabled={!isEditing || isSaving}
                />
                <Label htmlFor="subscribe">Subscribe to updates</Label>
              </div>
              {isEditing && (
                <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {profile.role === "landlord" && (
          <TabsContent value="listings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">My Property Listings</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {isLoadingListings ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading listings...</span>
                  </div>
                ) : userListings.length === 0 ? (
                  <p className="text-center text-gray-500">You have no active listings yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userListings.map((listing) => (
                      <Card key={listing._id} className="overflow-hidden">
                        <div className="relative h-48 w-full bg-gray-200">
                          {listing.imageUrl ? (
                            <Image
                              src={listing.imageUrl || "/placeholder.svg"}
                              alt={listing.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full text-gray-400">
                              <Building2 className="h-12 w-12" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg">{listing.title}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> {listing.location}
                          </p>
                          <p className="text-md font-semibold mt-2">KSh {listing.price.toLocaleString()}/month</p>
                          <Link
                            href={`/listings/${listing._id}`}
                            className="text-blue-500 hover:underline text-sm mt-2 block"
                          >
                            View Details
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {profile.role === "tenant" && (
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">My Bookings</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {isLoadingBookings ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading bookings...</span>
                  </div>
                ) : userBookings.length === 0 ? (
                  <p className="text-center text-gray-500">You have no active bookings yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {userBookings.map((booking) => (
                      <Card
                        key={booking._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4"
                      >
                        <div className="relative h-24 w-full sm:w-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-200">
                          {booking.property.imageUrl ? (
                            <Image
                              src={booking.property.imageUrl || "/placeholder.svg"}
                              alt={booking.property.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full text-gray-400">
                              <Building2 className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 grid gap-1">
                          <h3 className="font-bold text-lg">{booking.property.title}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> {booking.property.location}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Dates:</span>{" "}
                            {format(new Date(booking.startDate), "MMM dd, yyyy")} -{" "}
                            {format(new Date(booking.endDate), "MMM dd, yyyy")}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Total Price:</span> KSh{" "}
                            {booking.totalPrice.toLocaleString()}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Status:</span>{" "}
                            <span
                              className={`capitalize font-medium ${
                                booking.status === "confirmed"
                                  ? "text-green-600"
                                  : booking.status === "pending"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </p>
                          <Link
                            href={`/listings/${booking.property._id}`}
                            className="text-blue-500 hover:underline text-sm mt-1 block"
                          >
                            View Property
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
