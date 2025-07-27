"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Home, Building, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const featuredProperties = [
  {
    id: 1,
    title: "Modern 2BR Apartment",
    price: "45,000",
    location: "Westlands",
    rating: 4.9,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Luxury Villa",
    price: "150,000",
    location: "Karen",
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Studio Apartment",
    price: "25,000",
    location: "Kilimani",
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=300",
  },
]

export function AnimatedHero() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProperties.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Clean Header */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find your next
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              dream home
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover amazing places to stay with verified hosts and seamless booking experience
          </p>

          {/* Airbnb-style Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2">
              <div className="flex items-center">
                <div className="flex-1 px-6 py-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <Input
                      placeholder="Where are you going?"
                      className="border-0 bg-transparent focus:ring-0 text-lg placeholder-gray-500 p-0"
                    />
                  </div>
                </div>
                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  <Search className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/listings">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg text-lg font-semibold"
              >
                <Home className="h-5 w-5 mr-2" />
                Explore Properties
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 bg-white border-2 border-gray-300 hover:border-blue-300 rounded-xl shadow-lg text-lg font-semibold"
              >
                <Building className="h-5 w-5 mr-2" />
                List Your Property
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured Properties - Airbnb Style */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured stays</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredProperties.map((property, index) => (
              <div
                key={property.id}
                className={`group cursor-pointer transition-all duration-300 ${
                  index === currentIndex ? "transform scale-105" : ""
                }`}
              >
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <Image
                    src={property.image || "/placeholder.svg"}
                    alt={property.title}
                    width={300}
                    height={200}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{property.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{property.title}</h3>
                  </div>
                  <p className="text-gray-600">{property.location}</p>
                  <p className="font-semibold">
                    <span className="text-gray-900">KSh {property.price}</span>
                    <span className="text-gray-600 font-normal"> /month</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">2.5K+</div>
            <div className="text-gray-600">Happy Guests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">500+</div>
            <div className="text-gray-600">Properties</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">1K+</div>
            <div className="text-gray-600">Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">4.9</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}
