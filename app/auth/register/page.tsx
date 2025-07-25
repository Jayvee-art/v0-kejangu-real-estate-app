"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Building2, Eye, EyeOff, Globe, Users, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const countries = [
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "UG", name: "Uganda", flag: "🇺🇬" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    country: "",
    phone: "",
    agreeToTerms: false,
    subscribeToUpdates: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isFacebookLoading, setIsFacebookLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    if (!formData.role) {
      toast({
        title: "Role required",
        description: "Please select whether you are a landlord or tenant",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("🚀 Submitting registration form...")

      const requestData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        country: formData.country,
        phone: formData.phone,
        subscribeToUpdates: formData.subscribeToUpdates,
      }

      console.log("📤 Request data:", { ...requestData, password: "[HIDDEN]" })

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      console.log("📥 Response status:", response.status)

      const data = await response.json()
      console.log("📋 Response data:", data)

      if (response.ok) {
        toast({
          title: "Welcome to Kejangu! 🎉",
          description: "Your account has been created successfully. Please sign in to continue.",
        })

        setTimeout(() => {
          router.push("/auth/login")
        }, 1500)
      } else {
        console.error("❌ Registration failed:", data)
        toast({
          title: "Registration failed",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("💥 Registration error:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please check your internet connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    try {
      const result = await signIn("google", {
        callbackUrl: "/listings",
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Google Sign Up Failed",
          description: "Unable to sign up with Google. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Google sign up error:", error)
      toast({
        title: "Error",
        description: "Something went wrong with Google sign up.",
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleFacebookSignUp = async () => {
    setIsFacebookLoading(true)
    try {
      const result = await signIn("facebook", {
        callbackUrl: "/listings",
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Facebook Sign Up Failed",
          description: "Unable to sign up with Facebook. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Facebook sign up error:", error)
      toast({
        title: "Error",
        description: "Something went wrong with Facebook sign up.",
        variant: "destructive",
      })
    } finally {
      setIsFacebookLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Modern 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl transform rotate-12 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl transform -rotate-12 animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-xl transform rotate-45 animate-pulse"></div>
        <div className="absolute bottom-20 right-32 w-28 h-28 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full animate-bounce"></div>
      </div>

      <Card className="w-full max-w-lg relative z-10 shadow-2xl border-0 bg-white/90 backdrop-blur-md">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join Kejangu
          </CardTitle>
          <CardDescription className="flex items-center justify-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all transform hover:scale-105"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all transform hover:scale-105"
              onClick={handleFacebookSignUp}
              disabled={isFacebookLoading}
            >
              {isFacebookLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              Continue with Facebook
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-4 text-gray-500 font-medium">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 rounded-xl border-2 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12 rounded-xl border-2 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Country and Phone Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Country
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-2 focus:border-blue-500">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone (Optional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254 700 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                I am a *
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="h-12 rounded-xl border-2 focus:border-blue-500">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Tenant (Looking for rental)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="landlord">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Landlord (Have properties to rent)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="h-12 rounded-xl border-2 focus:border-blue-500 transition-all pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="h-12 rounded-xl border-2 focus:border-blue-500 transition-all pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="updates"
                  checked={formData.subscribeToUpdates}
                  onCheckedChange={(checked) => setFormData({ ...formData, subscribeToUpdates: checked as boolean })}
                />
                <Label htmlFor="updates" className="text-sm">
                  Subscribe to property updates and newsletters
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 rounded-xl shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating your account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
