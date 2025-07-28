"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, CalendarCheck, LogOut, MapPin, MessageSquare, UserIcon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { format } from "date-fns"
import Link from "next/link"

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
    email: string
  }
  startDate: string
  endDate: string
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: string
}

export default function TenantDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.role !== "tenant") {
      router.push("/listings") // Redirect non-tenants
      return
    }

    fetchMyBookings()
  }, [user, router])

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/bookings/my-bookings", {
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
          description: errorData.message || "Failed to fetch bookings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching your bookings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user || user.role !== "tenant") {
    return null
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
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
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600">View and manage your property reservations</p>
          </div>
          <Link href="/listings">
            <Button>
              <Building2 className="h-4 w-4 mr-2" />
              Browse Properties
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{bookings.length}</CardTitle>
              <CardDescription>Total Bookings</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{bookings.filter((b) => b.status === "pending").length}</CardTitle>
              <CardDescription>Pending Bookings</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{bookings.filter((b) => b.status === "confirmed").length}</CardTitle>
              <CardDescription>Confirmed Bookings</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Bookings List */}
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
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <CalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-4">Start exploring properties and make your first reservation!</p>
            <Link href="/listings">
              <Button>
                <Building2 className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
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
                      <span className="font-medium">Dates:</span> {format(new Date(booking.startDate), "MMM dd, yyyy")}{" "}
                      - {format(new Date(booking.endDate), "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Total Price:</span> KSh {booking.totalPrice.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Landlord:</span>{" "}
                      <Link href={`/profile/${booking.landlord._id}`} className="text-blue-600 hover:underline">
                        {booking.landlord.name}
                      </Link>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/listings/${booking.property._id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        View Property
                      </Button>
                    </Link>
                    {/* Add more actions like "Cancel Booking" if needed */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
