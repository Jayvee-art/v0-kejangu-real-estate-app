import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Shield, TrendingUp, Zap, Globe } from "lucide-react"
import Link from "next/link"
import { MapSection } from "@/components/map-section"
import { AnimatedHero } from "@/components/animated-hero"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Kejangu
              </span>
            </div>
            <nav className="flex space-x-4">
              <Link href="/listings">
                <Button variant="ghost" className="hover:bg-blue-50 transition-all hover:scale-105">
                  Browse Listings
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="bg-white/80 backdrop-blur-md hover:scale-105 transition-all">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all shadow-lg">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 3D Animated Hero Section */}
      <AnimatedHero />

      {/* Modern Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">2.5K+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">500+</div>
              <div className="text-sm text-gray-600">Properties Listed</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">1K+</div>
              <div className="text-sm text-gray-600">Successful Matches</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">4.9</div>
              <div className="text-sm text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-20 bg-gradient-to-br from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
              🗺️ Interactive Map
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Find Properties Near You</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore available rentals in your preferred location with our interactive map and advanced search filters
            </p>
          </div>

          <MapSection />
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
              ✨ Why Choose Kejangu
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Modern Property Management</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of real estate with our cutting-edge platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-md">
              <CardHeader className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Smart Listing Management</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Advanced dashboard with AI-powered insights for landlords to manage properties efficiently and
                  maximize rental income.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-md">
              <CardHeader className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Global Connectivity</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Connect with verified landlords and tenants worldwide through our secure messaging system and video
                  tours.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-md">
              <CardHeader className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Enterprise Security</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Bank-level encryption and verification processes ensure safe transactions and protect user data
                  privacy.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        {/* 3D Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-3xl transform rotate-12 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-white/10 rounded-2xl transform -rotate-12 animate-bounce"></div>
          <div className="absolute bottom-20 left-32 w-20 h-20 bg-white/10 rounded-xl transform rotate-45 animate-pulse"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of landlords and tenants who trust Kejangu for their rental needs. Experience the future of
            real estate today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 bg-white text-blue-600 hover:bg-gray-50 hover:scale-105 transition-all shadow-xl text-lg font-semibold rounded-xl"
              >
                Start Your Journey
              </Button>
            </Link>
            <Link href="/listings">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 border-2 border-white text-white hover:bg-white hover:text-blue-600 hover:scale-105 transition-all shadow-xl text-lg font-semibold rounded-xl bg-transparent"
              >
                Explore Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold">Kejangu</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                Connecting landlords and tenants across Kenya with modern technology and exceptional service. Find your
                perfect rental home today.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/listings" className="text-gray-400 hover:text-white transition-colors">
                    Browse Properties
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">
                    List Property
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact</h3>
              <ul className="space-y-3 text-gray-400">
                <li>Email: info@kejangu.com</li>
                <li>Phone: +254 700 000 000</li>
                <li>Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">© 2025 Kejangu. All rights reserved. Modern real estate solutions.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
