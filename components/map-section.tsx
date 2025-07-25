"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Navigation, Phone, MessageCircle } from "lucide-react"

// Mock property data with coordinates
const mockProperties = [
  {
    id: 1,
    title: "Modern 2BR Apartment",
    location: "Westlands, Nairobi",
    price: 45000,
    coordinates: { lat: -1.2676, lng: 36.8108 },
    type: "Apartment",
    bedrooms: 2,
    landlord: { name: "John Doe", phone: "+254700000001" },
  },
  {
    id: 2,
    title: "Spacious 3BR House",
    location: "Karen, Nairobi",
    price: 85000,
    coordinates: { lat: -1.3197, lng: 36.6859 },
    type: "House",
    bedrooms: 3,
    landlord: { name: "Jane Smith", phone: "+254700000002" },
  },
  {
    id: 3,
    title: "Studio Apartment",
    location: "Kilimani, Nairobi",
    price: 25000,
    coordinates: { lat: -1.2921, lng: 36.7809 },
    type: "Studio",
    bedrooms: 1,
    landlord: { name: "Mike Johnson", phone: "+254700000003" },
  },
  {
    id: 4,
    title: "Luxury 4BR Villa",
    location: "Runda, Nairobi",
    price: 150000,
    coordinates: { lat: -1.2084, lng: 36.7626 },
    type: "Villa",
    bedrooms: 4,
    landlord: { name: "Sarah Wilson", phone: "+254700000004" },
  },
  {
    id: 5,
    title: "Cozy 1BR Flat",
    location: "South B, Nairobi",
    price: 30000,
    coordinates: { lat: -1.3031, lng: 36.8344 },
    type: "Apartment",
    bedrooms: 1,
    landlord: { name: "David Brown", phone: "+254700000005" },
  },
]

export function MapSection() {
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedProperty, setSelectedProperty] = useState<(typeof mockProperties)[0] | null>(null)
  const [filteredProperties, setFilteredProperties] = useState(mockProperties)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Get user's current location
  useEffect(() => {
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
          // Default to Nairobi center
          setUserLocation({ lat: -1.2921, lng: 36.8219 })
        },
      )
    } else {
      // Default to Nairobi center
      setUserLocation({ lat: -1.2921, lng: 36.8219 })
    }
  }, [])

  const handleSearch = () => {
    if (!searchLocation.trim()) {
      setFilteredProperties(mockProperties)
      return
    }

    const filtered = mockProperties.filter(
      (property) =>
        property.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
        property.title.toLowerCase().includes(searchLocation.toLowerCase()),
    )
    setFilteredProperties(filtered)
  }

  const handleFindNearMe = () => {
    if (!userLocation) return

    // Sort properties by distance from user location (simplified calculation)
    const sorted = [...mockProperties].sort((a, b) => {
      const distanceA = Math.sqrt(
        Math.pow(a.coordinates.lat - userLocation.lat, 2) + Math.pow(a.coordinates.lng - userLocation.lng, 2),
      )
      const distanceB = Math.sqrt(
        Math.pow(b.coordinates.lat - userLocation.lat, 2) + Math.pow(b.coordinates.lng - userLocation.lng, 2),
      )
      return distanceA - distanceB
    })

    setFilteredProperties(sorted.slice(0, 3)) // Show 3 nearest properties
    setSearchLocation("Near your location")
  }

  const handleWhatsAppContact = (property: (typeof mockProperties)[0]) => {
    const message = `Hi! I'm interested in your property: ${property.title} located at ${property.location}. Can you provide more details?`
    const whatsappUrl = `https://wa.me/${property.landlord.phone.replace("+", "")}?text=${encodeURIComponent(message)}`
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
            {filteredProperties.map((property, index) => (
              <div
                key={property.id}
                className={`absolute w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform ${
                  selectedProperty?.id === property.id ? "bg-blue-600 scale-110" : ""
                }`}
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + index * 10}%`,
                }}
                onClick={() => setSelectedProperty(property)}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{Math.floor(property.price / 1000)}K</span>
                </div>
              </div>
            ))}

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
          {filteredProperties.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No properties found in this location</p>
              </CardContent>
            </Card>
          ) : (
            filteredProperties.map((property) => (
              <Card
                key={property.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProperty?.id === property.id ? "ring-2 ring-blue-500 shadow-md" : ""
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
                      <Badge variant="outline">{property.type}</Badge>
                      <Badge variant="outline">{property.bedrooms} BR</Badge>
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
                          window.open(`tel:${property.landlord.phone}`, "_self")
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
                Contact: {selectedProperty.landlord.name} at {selectedProperty.landlord.phone}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
