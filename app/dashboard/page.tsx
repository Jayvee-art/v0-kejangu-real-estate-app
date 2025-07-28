"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

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
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isBookingsLoading, setIsBookingsLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login")
      } else if (user.role === "landlord") {
        router.push("/landlord-dashboard")
      } else if (user.role === "tenant") {
        router.push("/tenant-dashboard")
      } else if (user.role === "admin") {
        router.push("/admin")
      } else {
        // Fallback for unknown roles or if user object is incomplete
        router.push("/")
      }
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user || user.role !== "landlord") {
      return
    }

    fetchMyListings()
    fetchMyBookingsAsLandlord()
  }, [user])

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  // This component should ideally never be rendered for long, as it redirects.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">Redirecting...</span>
    </div>
  )
}
