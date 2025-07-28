"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SimpleOAuthTest() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const testGoogleOAuth = async () => {
    setIsLoading(true)
    try {
      // Direct redirect to Google OAuth
      const baseUrl = window.location.origin
      const googleAuthUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(baseUrl + "/simple-oauth-test")}`

      console.log("Redirecting to:", googleAuthUrl)
      window.location.href = googleAuthUrl
    } catch (error: any) {
      console.error("OAuth test error:", error)
      toast({
        title: "OAuth Test Failed",
        description: error.message,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const checkProviders = async () => {
    try {
      const response = await fetch("/api/auth/providers")
      const providers = await response.json()
      console.log("Available providers:", providers)

      toast({
        title: "Providers Check",
        description: `Found ${Object.keys(providers).length} providers`,
      })
    } catch (error: any) {
      toast({
        title: "Providers Check Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Simple OAuth Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testGoogleOAuth} disabled={isLoading} className="w-full h-12">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting to Google...
              </>
            ) : (
              <>
                <Chrome className="h-4 w-4 mr-2" />
                Test Google OAuth (Direct)
              </>
            )}
          </Button>

          <Button onClick={checkProviders} variant="outline" className="w-full bg-transparent">
            Check Available Providers
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Debug URLs:</p>
            <div className="space-y-1 text-xs">
              <a
                href="/api/auth/providers"
                target="_blank"
                className="block text-blue-600 hover:underline"
                rel="noreferrer"
              >
                /api/auth/providers
              </a>
              <a
                href="/api/auth/signin"
                target="_blank"
                className="block text-blue-600 hover:underline"
                rel="noreferrer"
              >
                /api/auth/signin
              </a>
              <a href="/debug-oauth" className="block text-blue-600 hover:underline">
                Full Debug Center
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
