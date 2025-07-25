"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Home, Users, TrendingUp, Heart, Building } from "lucide-react"
import Link from "next/link"

const floatingProperties = [
  { id: 1, title: "Modern 2BR", price: "45K", location: "Westlands", x: 10, y: 20 },
  { id: 2, title: "Luxury Villa", price: "150K", location: "Karen", x: 80, y: 30 },
  { id: 3, title: "Studio Apt", price: "25K", location: "Kilimani", x: 20, y: 70 },
  { id: 4, title: "3BR House", price: "85K", location: "Runda", x: 70, y: 60 },
  { id: 5, title: "Cozy 1BR", price: "30K", location: "South B", x: 40, y: 40 },
]

export function AnimatedHero() {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0)
  const [likedProperties, setLikedProperties] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPropertyIndex((prev) => (prev + 1) % floatingProperties.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleLike = (propertyId: number) => {
    setLikedProperties((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId],
    )
  }

  return (
    <section className="py-20 relative overflow-hidden min-h-[600px]">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-pink-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-32 w-28 h-28 bg-indigo-200/30 rounded-full animate-bounce"></div>

        {/* Floating property cards */}
        {floatingProperties.map((property, index) => (
          <div
            key={property.id}
            className={`absolute transition-all duration-1000 ${
              index === currentPropertyIndex ? "scale-110 z-20" : "scale-100 z-10"
            }`}
            style={{
              left: `${property.x}%`,
              top: `${property.y}%`,
              transform: `translate(-50%, -50%) ${index === currentPropertyIndex ? "scale(1.1)" : "scale(1)"}`,
            }}
          >
            <div
              className={`bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border transition-all duration-500 hover:shadow-xl cursor-pointer ${
                index === currentPropertyIndex ? "ring-2 ring-blue-500 shadow-2xl" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-semibold">{property.title}</span>
                </div>
                <button onClick={() => handleLike(property.id)} className="transition-transform hover:scale-125">
                  <Heart
                    className={`h-3 w-3 ${
                      likedProperties.includes(property.id) ? "text-red-500 fill-current" : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
              <div className="text-xs text-gray-600 mb-1">{property.location}</div>
              <Badge variant="secondary" className="text-xs">
                KSh {property.price}/mo
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white animate-pulse">
                🔥 Trending Now
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Find Your Perfect
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                  {" "}
                  Rental Home
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of users discovering amazing properties daily. Swipe, like, and connect with your perfect
                match! 🏠✨
              </p>
            </div>

            {/* Social Media Style Engagement */}
            <div className="mb-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
                <span className="text-sm font-semibold">2.5K+ Likes Today</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                <Users className="h-4 w-4 text-blue-500 animate-bounce" />
                <span className="text-sm font-semibold">500+ Active Now</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold">Trending #1</span>
              </div>
            </div>

            {/* Quick Search Bar */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Enter location (e.g., Downtown, Nairobi)"
                    className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-2 focus:border-blue-500 transition-all"
                  />
                </div>
                <Button
                  size="lg"
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/listings">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform shadow-lg"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Browse Properties
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white/80 backdrop-blur-sm hover:scale-105 transition-transform shadow-lg"
                >
                  <Building className="h-4 w-4 mr-2" />
                  List Your Property
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Interactive Property Feed */}
          <div className="relative">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Live Property Feed</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>

              {/* Current Featured Property */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Building className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">{floatingProperties[currentPropertyIndex].title}</div>
                      <div className="text-sm text-gray-600">{floatingProperties[currentPropertyIndex].location}</div>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    KSh {floatingProperties[currentPropertyIndex].price}/mo
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(floatingProperties[currentPropertyIndex].id)}
                      className="flex items-center gap-1 hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          likedProperties.includes(floatingProperties[currentPropertyIndex].id)
                            ? "text-red-500 fill-current"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-sm">{Math.floor(Math.random() * 50) + 10}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{Math.floor(Math.random() * 20) + 5} viewing</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    View Details
                  </Button>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>John just liked a property in Karen</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>New listing added in Westlands</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Sarah contacted a landlord</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
