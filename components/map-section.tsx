"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Navigation, Phone, MessageCircle, Loader2 } from "lucide-react"

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
    phone?: string
  }
  coordinates?: { lat: number; lng: number } // Add coordinates to listing
}

export function MapSection() {
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedProperty, setSelectedProperty] = useState<Listing | null>(null)
  const [allListings, setAllListings] = useState<Listing[]>([]) // Store all fetched listings
  const [filteredProperties, setFilteredProperties] = useState<Listing[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchListings()
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Location access denied or unavailable")
          // Default to Nairobi center if location access is denied
          setUserLocation({ lat: -1.2921, lng: 36.8219 })
        },
      )
    } else {
      // Default to Nairobi center if geolocation is not supported
      setUserLocation({ lat: -1.2921, lng: 36.8219 })
    }
  }, [])

  useEffect(() => {
    // Apply initial filter when allListings changes
    handleSearch()
  }, [allListings])

  const fetchListings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/listings")
      if (response.ok) {
        const data: Listing[] = await response.json()
        // For demonstration, assign mock coordinates if not present
        const listingsWithCoords = data.map((listing) => ({
          ...listing,
          coordinates: listing.coordinates || getRandomNairobiCoordinate(), // Assign random if not present
        }))
        setAllListings(listingsWithCoords)
        setFilteredProperties(listingsWithCoords) // Initially show all
      }
    } catch (error) {
      console.error("Error fetching listings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to generate random coordinates within Nairobi for demonstration
  const getRandomNairobiCoordinate = () => {
    const lat = -1.2921 + (Math.random() - 0.5) * 0.1 // Approx. +/- 0.05 deg from Nairobi center
    const lng = 36.8219 + (Math.random() - 0.5) * 0.1
    return { lat, lng }
  }

  const handleSearch = () => {
    if (!searchLocation.trim()) {
      setFilteredProperties(allListings)
      return
    }

    const filtered = allListings.filter(
      (property) =>
        property.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
        property.title.toLowerCase().includes(searchLocation.toLowerCase()),
    )
    setFilteredProperties(filtered)
  }

  const handleFindNearMe = () => {
    if (!userLocation) return

    // Sort properties by distance from user location (simplified calculation)
    const sorted = [...allListings].sort((a, b) => {
      // Ensure coordinates exist for sorting
      const coordsA = a.coordinates || getRandomNairobiCoordinate()
      const coordsB = b.coordinates || getRandomNairobiCoordinate()

      const distanceA = Math.sqrt(
        Math.pow(coordsA.lat - userLocation.lat, 2) + Math.pow(coordsA.lng - userLocation.lng, 2),
      )
      const distanceB = Math.sqrt(
        Math.pow(coordsB.lat - userLocation.lat, 2) + Math.pow(coordsB.lng - userLocation.lng, 2),
      )
      return distanceA - distanceB
    })

    setFilteredProperties(sorted.slice(0, 3)) // Show 3 nearest properties
    setSearchLocation("Near your location")
  }

  const handleWhatsAppContact = (property: Listing) => {
    const message = `Hi! I'm interested in your property: ${property.title} located at ${property.location}. Can you provide more details?`
    // Assuming landlord.phone is available or using a generic number
    const phoneNumber = property.landlord?.phone || "+254700000000" // Fallback to a generic number
    const whatsappUrl = `https://wa.me/${phoneNumber.replace("+", "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Map Placeholder */}
      <div className="relative">
        <Card className="h-96 lg:h-[500px] overflow-hidden">
          <div className="relative h-full bg-gradient-to-br from-blue-100 to-green-100">
            {/* Map placeholder with property markers */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Interactive Map</h3>
                <p className="text-gray-600">Properties shown with location markers</p>
              </div>
            </div>

            {/* Property markers */}
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              filteredProperties.map((property, index) => (
                <div
                  key={property._id} // Use _id from MongoDB
                  className={`absolute w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform ${
                    selectedProperty?._id === property._id ? "bg-blue-600 scale-110" : ""
                  }`}
                  style={{
                    // Distribute markers randomly for visual variety if no real coordinates
                    left: `${20 + (((property.coordinates?.lng || getRandomNairobiCoordinate().lng) * 0.5) % 60)}%`,
                    top: `${30 + (((property.coordinates?.lat || getRandomNairobiCoordinate().lat) * 0.5) % 60)}%`,
                  }}
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{Math.floor(property.price / 1000)}K</span>
                  </div>
                </div>
              ))
            )}

            {/* User location marker */}
            {userLocation && (
              <div
                className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"
                style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
              >
                <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Search and Results */}
      <div className="space-y-6">
        {/* Search Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search location (e.g., Westlands, Karen)"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" onClick={handleFindNearMe} className="w-full bg-transparent">
                <Navigation className="h-4 w-4 mr-2" />
                Find Properties Near Me
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Property Results */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredProperties.length === 0 && !isLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No properties found in this location</p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            filteredProperties.map((property) => (
              <Card
                key={property._id} // Use _id
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProperty?._id === property._id ? "ring-2 ring-blue-500 shadow-md" : ""
                }`}
                onClick={() => setSelectedProperty(property)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{property.title}</h3>
                    <Badge variant="secondary" className="font-semibold">
                      KSh {property.price.toLocaleString()}/month
                    </Badge>
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {/* Assuming property type/bedrooms are not in current schema, add if needed */}
                      <Badge variant="outline">Property</Badge>
                      <Badge variant="outline">2 BR</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWhatsAppContact(property)
                        }}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`tel:${property.landlord?.phone || property.landlord?.email}`, "_self") // Use phone or email
                        }}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Selected Property Details */}
        {selectedProperty && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Selected Property</h4>
              <p className="text-sm text-blue-800">
                <strong>{selectedProperty.title}</strong> - {selectedProperty.location}
              </p>
              <p className="text-sm text-blue-700">
                Contact: {selectedProperty.landlord?.name || "N/A"} at{" "}
                {selectedProperty.landlord?.phone || selectedProperty.landlord?.email || "N/A"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
