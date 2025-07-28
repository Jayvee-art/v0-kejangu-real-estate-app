"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, signOut, useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function TestOAuthPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [oauthConfig, setOauthConfig] = useState<any>(null)
  const [configLoading, setConfigLoading] = useState(true)

  useEffect(() => {
    const fetchOAuthConfig = async () => {
      setConfigLoading(true)
      try {
        const response = await fetch("/api/debug/oauth-config")
        const data = await response.json()
        setOauthConfig(data)
      } catch (error) {
        console.error("Failed to fetch OAuth config:", error)
        toast({
          title: "Error",
          description: "Failed to load OAuth configuration.",
          variant: "destructive",
        })
      } finally {
        setConfigLoading(false)
      }
    }
    fetchOAuthConfig()
  }, [toast])

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/test-oauth" })
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

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Sign Out Failed",
        description: "Could not sign out.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || configLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading authentication status...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">OAuth Test Page</h1>

      <Card className="w-full max-w-md mb-6">
        <CardHeader>
          <CardTitle>Current Session Status</CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Status:</span> Authenticated
              </p>
              <p>
                <span className="font-semibold">User ID:</span> {session.user.id}
              </p>
              <p>
                <span className="font-semibold">Name:</span> {session.user.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {session.user.email}
              </p>
              <p>
                <span className="font-semibold">Role:</span> {session.user.role}
              </p>
              <Button onClick={handleSignOut} disabled={isLoading} className="mt-4 w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Status:</span> Unauthenticated
              </p>
              <p>No active session.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In with OAuth Providers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {oauthConfig?.googleEnabled ? (
            <Button onClick={() => handleSignIn("google")} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In with Google
            </Button>
          ) : (
            <p className="text-sm text-gray-500">Google OAuth not configured (missing CLIENT_ID/SECRET)</p>
          )}

          {oauthConfig?.facebookEnabled ? (
            <Button onClick={() => handleSignIn("facebook")} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In with Facebook
            </Button>
          ) : (
            <p className="text-sm text-gray-500">Facebook OAuth not configured (missing CLIENT_ID/SECRET)</p>
          )}

          <Button onClick={() => handleSignIn("credentials")} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In with Credentials
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mt-6">
        <CardHeader>
          <CardTitle>OAuth Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          {oauthConfig ? (
            <div className="space-y-2 text-sm">
              <p>
                Google Enabled:{" "}
                <span className={oauthConfig.googleEnabled ? "text-green-600" : "text-red-600"}>
                  {oauthConfig.googleEnabled ? "Yes" : "No"}
                </span>
              </p>
              <p>
                Facebook Enabled:{" "}
                <span className={oauthConfig.facebookEnabled ? "text-green-600" : "text-red-600"}>
                  {oauthConfig.facebookEnabled ? "Yes" : "No"}
                </span>
              </p>
              <p className="text-gray-500">
                (Ensure `NEXTAUTH_URL` is set correctly in your `.env.local` for callbacks)
              </p>
            </div>
          ) : (
            <p>Loading configuration...</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
