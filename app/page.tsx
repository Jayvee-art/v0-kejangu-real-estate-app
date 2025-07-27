import { Button } from "@/components/ui/button"
import { Building2, Shield, Heart, Award } from "lucide-react"
import Link from "next/link"
import { MapSection } from "@/components/map-section"
import { AnimatedHero } from "@/components/animated-hero"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Clean Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Kejangu
              </span>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/listings" className="text-gray-700 hover:text-gray-900 font-medium">
                Browse Listings
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full px-6">
                  Sign up
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Clean Hero Section */}
      <AnimatedHero />

      {/* Features Section - Airbnb Style */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why choose Kejangu?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make finding and listing properties simple, secure, and seamless
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Verified Properties</h3>
              <p className="text-gray-600 leading-relaxed">
                Every property is verified by our team to ensure quality and authenticity for your peace of mind.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Trusted Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Join thousands of verified landlords and tenants in our trusted community platform.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                Seamless booking process with 24/7 support to help you every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore by location</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find properties in your preferred neighborhoods across Kenya
            </p>
          </div>

          <MapSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to find your perfect home?</h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands who have found their ideal rental through Kejangu
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 bg-white text-blue-600 hover:bg-gray-50 shadow-xl text-lg font-semibold rounded-xl"
              >
                Get Started Today
              </Button>
            </Link>
            <Link href="/listings">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-xl text-lg font-semibold rounded-xl bg-transparent"
              >
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">Kejangu</span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed max-w-md">
                Making property rental simple and secure across Kenya. Find your perfect home with verified listings and
                trusted hosts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/listings" className="text-gray-600 hover:text-gray-900">
                    Browse Properties
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="text-gray-600 hover:text-gray-900">
                    List Property
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
              <ul className="space-y-3 text-gray-600">
                <li>info@kejangu.com</li>
                <li>+254 700 000 000</li>
                <li>Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center">
            <p className="text-gray-600">© 2025 Kejangu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
