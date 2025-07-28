"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { login: authContextLogin } = useAuth()

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        await authContextLogin(data.token) // Use the login function from AuthContext
        // Redirection is handled by AuthContext's login function
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid email or password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/dashboard" }) // Redirect to dashboard after OAuth login
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
      toast({
        title: "Sign In Failed",
        description: `Could not sign in with ${provider}.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Login to your account</CardTitle>
          <CardDescription>Enter your credentials below to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.0003 4.75C14.0253 4.75 15.8003 5.4375 17.1503 6.6125L20.0253 3.7375C18.0753 1.9375 15.2503 0.875 12.0003 0.875C7.27525 0.875 3.17525 3.5125 1.25025 7.3875L5.10025 10.3625C5.90025 7.9875 8.72525 6.25 12.0003 6.25C13.5003 6.25 14.8753 6.75 15.9753 7.5625L17.3503 6.1875C16.0003 5.25 14.1753 4.75 12.0003 4.75Z" />
                <path d="M23.125 12.0003C23.125 11.3753 23.0625 10.7503 22.9375 10.1878H12V13.8128H18.75C18.475 15.1378 17.725 16.2628 16.625 17.0628L20.525 20.0378C21.675 18.8878 22.525 17.4128 22.9375 15.7503C23.0625 15.1878 23.125 14.5628 23.125 13.9378V12.0003Z" />
                <path d="M12.0003 23.125C15.2503 23.125 18.0753 22.0625 20.0253 20.2625L16.6253 17.0625C15.2753 18.2375 13.5003 18.925 12.0003 18.925C8.72525 18.925 5.90025 17.1875 5.10025 14.8125L1.25025 17.7875C3.17525 21.6625 7.27525 24.3003 12.0003 24.3003Z" />
                <path d="M0.875 12.0003C0.875 11.3753 0.9375 10.7503 1.0625 10.1878L4.9125 7.2128C4.7875 7.8503 4.75 8.5128 4.75 9.1878C4.75 10.8503 5.125 12.4128 5.8125 13.8128L1.9125 16.7878C1.25 15.4378 0.875 13.7878 0.875 12.0003Z" />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => handleOAuthSignIn("facebook")}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.675 0.000390625H1.325C0.59375 0.000390625 0 0.594141 0 1.32539V22.6754C0 23.4066 0.59375 24.0004 1.325 24.0004H12.45V14.6254H9.375V10.9254H12.45V8.37539C12.45 5.27539 14.3875 3.57539 17.15 3.57539C18.4875 3.57539 19.625 3.67539 20 3.72539V6.82539H18.125C16.6 6.82539 16.3 7.57539 16.3 8.67539V10.9254H20L19.5 14.6254H16.3V24.0004H22.675C23.4062 24.0004 24 23.4066 24 22.6754V1.32539C24 0.594141 23.4062 0.000390625 22.675 0.000390625Z" />
              </svg>
              Facebook
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
