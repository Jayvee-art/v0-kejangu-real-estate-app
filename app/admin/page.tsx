"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, UserIcon, Building2, MessageSquare, LogOut, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface User {
  _id: string
  name: string
  email: string
  role: "landlord" | "tenant" | "admin"
  isActive: boolean
  createdAt: string
}

interface Listing {
  _id: string
  title: string
  location: string
  price: number
  landlord: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
}

interface Booking {
  _id: string
  property: {
    _id: string
    title: string
    location: string
  }
  tenant: {
    _id: string
    name: string
    email: string
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

export default function AdminDashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You do not have permission to view this page.",
          variant: "destructive",
        })
        router.push("/")
      } else {
        fetchAllUsers()
        fetchAllListings()
        fetchAllBookings()
      }
    }
  }, [user, loading, router, toast])

  const fetchAllUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch users.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server to fetch users.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const fetchAllListings = async () => {
    setIsLoadingListings(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/listings", {
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
      console.error("Error fetching listings:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server to fetch listings.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingListings(false)
    }
  }

  const fetchAllBookings = async () => {
    setIsLoadingBookings(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/bookings", {
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
      console.error("Error fetching bookings:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server to fetch bookings.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const handleDeleteUser = async (userIdToDelete: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${userIdToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        toast({
          title: "User Deleted",
          description: "User account has been successfully removed.",
        })
        fetchAllUsers() // Refresh user list
      } else {
        const errorData = await response.json()
        toast({
          title: "Deletion Failed",
          description: errorData.message || "Failed to delete user.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server to delete user.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        toast({
          title: "Listing Deleted",
          description: "Property listing has been successfully removed.",
        })
        fetchAllListings() // Refresh listing list
      } else {
        const errorData = await response.json()
        toast({
          title: "Deletion Failed",
          description: errorData.message || "Failed to delete listing.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting listing:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server to delete listing.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading admin dashboard...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Kejangu Admin</span>
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
                  Messages
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">All Users</h2>
              <Button onClick={() => router.push("/auth/register")}>
                <Plus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </div>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-gray-500">No users found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {users.map((u) => (
                  <Card key={u._id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          <Link href={`/profile/${u._id}`} className="hover:underline">
                            {u.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600">{u.email}</p>
                        <p className="text-sm text-gray-500 capitalize">Role: {u.role}</p>
                        <p className="text-sm text-gray-500">Status: {u.isActive ? "Active" : "Inactive"}</p>
                        <p className="text-xs text-gray-400">Joined: {format(new Date(u.createdAt), "PPP")}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">All Listings</h2>
              <Button onClick={() => router.push("/listings")}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Listing
              </Button>
            </div>
            {isLoadingListings ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading listings...</span>
              </div>
            ) : listings.length === 0 ? (
              <p className="text-center text-gray-500">No listings found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {listings.map((l) => (
                  <Card key={l._id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          <Link href={`/listings/${l._id}`} className="hover:underline">
                            {l.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600">Location: {l.location}</p>
                        <p className="text-sm text-gray-500">Price: KSh {l.price.toLocaleString()}/month</p>
                        <p className="text-sm text-gray-500">
                          Landlord:{" "}
                          <Link href={`/profile/${l.landlord._id}`} className="text-blue-600 hover:underline">
                            {l.landlord.name}
                          </Link>
                        </p>
                        <p className="text-xs text-gray-400">Created: {format(new Date(l.createdAt), "PPP")}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteListing(l._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">All Bookings</h2>
            {isLoadingBookings ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading bookings...</span>
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-center text-gray-500">No bookings found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((b) => (
                  <Card key={b._id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">
                        Property:{" "}
                        <Link href={`/listings/${b.property._id}`} className="hover:underline">
                          {b.property.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600">
                        Tenant:{" "}
                        <Link href={`/profile/${b.tenant._id}`} className="text-blue-600 hover:underline">
                          {b.tenant.name} ({b.tenant.email})
                        </Link>
                      </p>
                      <p className="text-sm text-gray-600">
                        Landlord:{" "}
                        <Link href={`/profile/${b.landlord._id}`} className="text-blue-600 hover:underline">
                          {b.landlord.name} ({b.landlord.email})
                        </Link>
                      </p>
                      <p className="text-sm text-gray-500">
                        Dates: {format(new Date(b.startDate), "PPP")} - {format(new Date(b.endDate), "PPP")}
                      </p>
                      <p className="text-sm text-gray-500">Total Price: KSh {b.totalPrice.toLocaleString()}</p>
                      <p className="text-sm text-gray-500 capitalize">Status: {b.status}</p>
                      <p className="text-xs text-gray-400">Booked: {format(new Date(b.createdAt), "PPP")}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
