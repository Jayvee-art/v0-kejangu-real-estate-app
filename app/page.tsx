import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Shield, TrendingUp, Heart, Star } from "lucide-react"
import Link from "next/link"
import { MapSection } from "@/components/map-section"
import { AnimatedHero } from "@/components/animated-hero"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="relative">
                <Building2 className="h-8 w-8 text-blue-600 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Kejangu
              </span>
            </div>
            <nav className="flex space-x-4">
              <Link href="/listings">
                <Button variant="ghost" className="hover:scale-105 transition-transform">
                  Browse Listings
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="hover:scale-105 transition-transform bg-transparent">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Animated Hero Section */}
      <AnimatedHero />

      {/* Social Media Style Stats */}
      <section className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group hover:scale-110 transition-transform cursor-pointer">
              <div className="relative inline-block">
                <div className="text-3xl font-bold text-blue-600 animate-pulse">2.5K+</div>
                <Heart className="absolute -top-2 -right-2 h-4 w-4 text-red-500 fill-current animate-bounce" />
              </div>
              <div className="text-sm text-gray-600 mt-1">Active Users</div>
            </div>
            <div className="text-center group hover:scale-110 transition-transform cursor-pointer">
              <div className="relative inline-block">
                <div className="text-3xl font-bold text-green-600">500+</div>
                <TrendingUp className="absolute -top-2 -right-2 h-4 w-4 text-green-500 animate-bounce" />
              </div>
              <div className="text-sm text-gray-600 mt-1">Properties Listed</div>
            </div>
            <div className="text-center group hover:scale-110 transition-transform cursor-pointer">
              <div className="relative inline-block">
                <div className="text-3xl font-bold text-purple-600">1K+</div>
                <Users className="absolute -top-2 -right-2 h-4 w-4 text-purple-500 animate-bounce" />
              </div>
              <div className="text-sm text-gray-600 mt-1">Happy Matches</div>
            </div>
            <div className="text-center group hover:scale-110 transition-transform cursor-pointer">
              <div className="relative inline-block">
                <div className="text-3xl font-bold text-yellow-600">4.9</div>
                <Star className="absolute -top-2 -right-2 h-4 w-4 text-yellow-500 fill-current animate-pulse" />
              </div>
              <div className="text-sm text-gray-600 mt-1">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Properties Near You</h2>
            <p className="text-lg text-gray-600">Explore available rentals in your preferred location</p>
          </div>

          <MapSection />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Kejangu?</h2>
            <p className="text-lg text-gray-600">Simple, secure, and efficient property management</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Easy Listing Management</CardTitle>
                <CardDescription>
                  Landlords can easily add, edit, and manage their property listings with our intuitive dashboard.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Connect Directly</CardTitle>
                <CardDescription>
                  Direct communication between landlords and tenants through WhatsApp and phone integration.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Secure Platform</CardTitle>
                <CardDescription>
                  Advanced authentication and security measures to protect both landlords and tenants.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of landlords and tenants who trust Kejangu for their rental needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto hover:scale-105 transition-transform">
                Sign Up Today
              </Button>
            </Link>
            <Link href="/listings">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600 bg-transparent hover:scale-105 transition-all"
              >
                Explore Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Building2 className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-2xl font-bold">Kejangu</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting landlords and tenants across Kenya. Find your perfect rental home or list your property with
                ease.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
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
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@kejangu.com</li>
                <li>Phone: +254 700 000 000</li>
                <li>Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 Kejangu. All rights reserved. Connecting landlords and tenants.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
