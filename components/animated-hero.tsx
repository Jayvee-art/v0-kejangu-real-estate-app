"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Home, Building, ArrowRight } from "lucide-react"
import Link from "next/link"

const floatingProperties = [
  { id: 1, title: "Modern 2BR", price: "45K", location: "Westlands", x: 15, y: 25 },
  { id: 2, title: "Luxury Villa", price: "150K", location: "Karen", x: 75, y: 35 },
  { id: 3, title: "Studio Apt", price: "25K", location: "Kilimani", x: 25, y: 65 },
  { id: 4, title: "3BR House", price: "85K", location: "Runda", x: 65, y: 70 },
]

export function AnimatedHero() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % floatingProperties.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 relative overflow-hidden min-h-[700px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 3D Background Elements */}
      <div className="absolute inset-0">
        {/* Floating 3D Cards */}
        <div className="absolute inset-0">
          {floatingProperties.map((property, index) => (
            <div
              key={property.id}
              className={`absolute transition-all duration-1000 transform-gpu ${
                index === currentIndex ? "scale-110 rotate-3 shadow-2xl z-20" : "scale-100 rotate-1 shadow-lg z-10"
              }`}
              style={{
                left: `${property.x}%`,
                top: `${property.y}%`,
                transform: `translate(-50%, -50%) perspective(1000px) rotateX(${index * 5}deg) rotateY(${index * 3}deg)`,
                animation: `float-${index} 6s ease-in-out infinite`,
              }}
            >
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">{property.title}</h4>
                      <p className="text-xs text-gray-600">{property.location}</p>
                    </div>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                  KSh {property.price}/mo
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* 3D Geometric Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl transform rotate-12 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl transform -rotate-12 animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-xl transform rotate-45 animate-pulse"></div>
        <div className="absolute bottom-20 right-32 w-28 h-28 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full transform animate-bounce"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium">
                🏠 Premium Real Estate Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Find Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                  Dream Home
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Discover exceptional properties with our advanced search platform. Connect directly with verified
                landlords and find your perfect rental home.
              </p>
            </div>

            {/* Modern Search Bar */}
            <div className="mb-8">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-white/20 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Enter location..."
                      className="pl-10 h-12 border-0 bg-transparent focus:ring-0 text-gray-800 placeholder-gray-500"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/listings">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-base font-semibold"
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
                  className="w-full sm:w-auto h-14 px-8 bg-white/80 backdrop-blur-md border-2 border-gray-200 hover:border-blue-300 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-base font-semibold"
                >
                  <Building className="h-5 w-5 mr-2" />
                  List Property
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - 3D Property Showcase */}
          <div className="relative">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 transform perspective-1000 rotate-y-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Featured Properties</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">Live Updates</span>
                </div>
              </div>

              {/* Current Featured Property */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-800">{floatingProperties[currentIndex].title}</h4>
                      <p className="text-gray-600">{floatingProperties[currentIndex].location}</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 text-sm font-semibold">
                    KSh {floatingProperties[currentIndex].price}/mo
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Available Now</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Verified</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg"
                  >
                    View Details
                  </Button>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/60 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-xs text-gray-600">Properties</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">2.5K+</div>
                  <div className="text-xs text-gray-600">Users</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-xl">
                  <div className="text-2xl font-bold text-indigo-600">4.9</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for 3D animations */}
      <style jsx>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(-50%, -50%) perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
          50% { transform: translate(-50%, -50%) perspective(1000px) rotateX(5deg) rotateY(3deg) translateZ(20px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(-50%, -50%) perspective(1000px) rotateX(5deg) rotateY(3deg) translateZ(0px); }
          50% { transform: translate(-50%, -50%) perspective(1000px) rotateX(10deg) rotateY(6deg) translateZ(30px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(-50%, -50%) perspective(1000px) rotateX(10deg) rotateY(6deg) translateZ(0px); }
          50% { transform: translate(-50%, -50%) perspective(1000px) rotateX(15deg) rotateY(9deg) translateZ(25px); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(-50%, -50%) perspective(1000px) rotateX(15deg) rotateY(9deg) translateZ(0px); }
          50% { transform: translate(-50%, -50%) perspective(1000px) rotateX(20deg) rotateY(12deg) translateZ(35px); }
        }
      `}</style>
    </section>
  )
}
