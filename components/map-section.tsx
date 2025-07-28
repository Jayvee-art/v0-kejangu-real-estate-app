"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Loader2 } from "lucide-react"
import Image from "next/image"

interface Listing {
  _id: string
  title: string
  description: string
  price: number
  location: string
  imageUrl?: string
  landlord: {
    name: string
    email: string
  }
}

export function MapSection() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("/api/listings")
        if (response.ok) {
          const data = await response.json()
          setListings(data)
        }
      } catch (error) {
        console.error("Error fetching listings for map:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [])

  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore Properties on the Map</h2>
          <p className="text-gray-600">Discover available listings in your desired locations.</p>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Property Locations</CardTitle>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="h-[400px] flex items-center justify-center bg-gray-200 animate-pulse">
                  <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
                </div>
              ) : listings.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center bg-gray-200 text-gray-500">
                  <MapPin className="h-12 w-12 mb-4" />
                  <p>No properties to display on the map yet.</p>
                </div>
              ) : (
                <div className="relative h-[400px] w-full">
                  {/* Placeholder for a map. In a real app, you'd integrate Google Maps, Mapbox, etc. */}
                  <Image
                    src="/placeholder.svg?height=400&width=800"
                    alt="Map of properties"
                    fill
                    className="object-cover"
                  />
                  {/* You would dynamically add markers based on listings data here */}
                  {listings.slice(0, 3).map((listing, index) => (
                    <div
                      key={listing._id}
                      className="absolute p-2 bg-white rounded-lg shadow-md flex items-center space-x-2"
                      style={{
                        top: `${20 + index * 15}%`,
                        left: `${30 + index * 10}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{listing.location}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </section>
  )
}
