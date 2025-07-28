import Link from "next/link"
import { Building2, Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-100 py-8 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="#" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">Kejangu</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your trusted partner in finding the perfect home in Kenya.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/listings" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">For Landlords</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
                  Manage Listings
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
                  View Bookings
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">123 Real Estate Ave, Nairobi, Kenya</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">info@kejangu.com</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">+254 7XX XXX XXX</p>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          © {new Date().getFullYear()} Kejangu. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
