"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Building2 } from "lucide-react"
import Image from "next/image"
import { AddListingDialog } from "@/components/add-listing-dialog"
import { EditListingDialog } from "@/components/edit-listing-dialog"
import { BookPropertyDialog } from "@/components/book-property-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

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
    email: string
  }
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  const fetchListings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // No token needed for public listings view
      const response = await fetch("/api/listings")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch listings.")
      }
      const data: Listing[] = await response.json()
      setListings(data)
    } catch (err: any) {
      console.error("Error fetching listings:", err)
      setError(err.message || "Failed to load properties.")
      toast({
        title: "Error",
        description: err.message || "Failed to load properties.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const handleAddSuccess = () => {
    fetchListings() // Refresh listings after adding
  }

  const handleEditClick = (listing: Listing) => {
    setSelectedListing(listing)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    fetchListings() // Refresh listings after editing
  }

  const handleDeleteListing = async (id: string) => {
    if (!user || user.role !== "landlord") {
      toast({
        title: "Permission Denied",
        description: "Only landlords can delete listings.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Listing Deleted",
          description: "Property listing removed successfully.",
        })
        fetchListings() // Refresh listings after deleting
      } else {
        const data = await response.json()
        toast({
          title: "Deletion Failed",
          description: data.message || "Something went wrong during deletion.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Delete listing error:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBookClick = (listing: Listing) => {
    setSelectedListing(listing)
    setIsBookingDialogOpen(true)
  }

  const handleBookingSuccess = () => {
    // Optionally refresh listings or user bookings if needed
    // For now, just close the dialog
    setIsBookingDialogOpen(false)
  }

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">Available Properties</h1>
          <p className="text-gray-600">Find your next home or investment opportunity.</p>
        </div>
        <div className="flex w-full md:w-auto space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-md border w-full"
            />
          </div>
          {!authLoading && user?.role === "landlord" && (
            <Button onClick={() => setIsAddDialogOpen(true)}>Add New Listing</Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border rounded-lg overflow-hidden shadow-sm animate-pulse">
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-10 bg-gray-200 rounded w-full mt-4" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">
          <p className="text-lg">{error}</p>
          <Button onClick={fetchListings} className="mt-4">
            Retry Loading Properties
          </Button>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg">No properties found matching your search.</p>
          {searchQuery && (
            <Button onClick={() => setSearchQuery("")} variant="link" className="mt-2">
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <Card
              key={listing._id}
              className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative w-full h-48 bg-gray-200">
                {listing.imageUrl ? (
                  <Image
                    src={listing.imageUrl || "/placeholder.svg"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-400">
                    <Building2 className="h-16 w-16" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold truncate">{listing.title}</CardTitle>
                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {listing.location}
                </p>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">
                <p className="font-semibold text-lg text-blue-600 mb-2">KSh {listing.price.toLocaleString()}/month</p>
                <p className="line-clamp-3">{listing.description}</p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-4">
                <Link href={`/listings/${listing._id}`} className="w-full">
                  <Button variant="outline" className="w-full bg-transparent">
                    View Details
                  </Button>
                </Link>
                {!authLoading && user?.role === "tenant" && (
                  <Button className="w-full" onClick={() => handleBookClick(listing)}>
                    Book Now
                  </Button>
                )}
                {!authLoading && user?.role === "landlord" && user._id === listing.landlord._id && (
                  <div className="flex w-full gap-2">
                    <Button variant="secondary" className="flex-1" onClick={() => handleEditClick(listing)}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your listing and remove its data
                            from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteListing(listing._id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AddListingDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={handleAddSuccess} />
      {selectedListing && (
        <EditListingDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          listing={selectedListing}
          onSuccess={handleEditSuccess}
        />
      )}
      {selectedListing && (
        <BookPropertyDialog
          open={isBookingDialogOpen}
          onOpenChange={setIsBookingDialogOpen}
          listing={selectedListing}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}
