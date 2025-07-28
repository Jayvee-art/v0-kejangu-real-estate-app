import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, CalendarCheck } from "lucide-react"
import { AnimatedHero } from "@/components/animated-hero"
import { MapSection } from "@/components/map-section"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Kejangu</span>
            </Link>
            <nav className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <AnimatedHero />

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Kejangu?</h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
            We connect tenants with their dream homes and empower landlords with easy property management tools.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <Building2 className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vast Property Listings</h3>
              <p className="text-gray-600">
                Browse through a wide array of rental properties, from apartments to family homes.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <MapPin className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Intuitive Search & Filters</h3>
              <p className="text-gray-600">
                Easily find properties that match your criteria with our advanced search options.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <CalendarCheck className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Seamless Booking Process</h3>
              <p className="text-gray-600">
                Book your desired property directly through the platform with secure communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <MapSection />

      {/* Call to Action Section */}
      <section className="py-12 bg-blue-600 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Home?</h2>
          <p className="text-lg mb-8">Join Kejangu today and start your property journey.</p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <Building2 className="h-6 w-6 text-blue-400" />
              <span className="ml-2 text-xl font-bold">Kejangu</span>
            </Link>
            <p className="text-sm mt-2">&copy; {new Date().getFullYear()} Kejangu. All rights reserved.</p>
          </div>
          <nav className="flex space-x-6">
            <Link href="/listings" className="hover:text-white">
              Properties
            </Link>
            <Link href="/about" className="hover:text-white">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
