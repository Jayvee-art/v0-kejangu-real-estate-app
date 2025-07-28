"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, Info, CheckCircle, XCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { OAuthTestWidget } from "@/components/oauth-test-widget"

interface EnvConfig {
  GOOGLE_CLIENT_ID: boolean
  GOOGLE_CLIENT_SECRET: boolean
  FACEBOOK_CLIENT_ID: boolean
  FACEBOOK_CLIENT_SECRET: boolean
  NEXTAUTH_SECRET: boolean
}

export default function OAuthDebugPage() {
  const { data: session, status } = useSession()
  const [envConfig, setEnvConfig] = useState<EnvConfig | null>(null)
  const [isLoadingEnv, setIsLoadingEnv] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEnvConfig = async () => {
      setIsLoadingEnv(true)
      setError(null)
      try {
        const response = await fetch("/api/debug/oauth-config")
        if (response.ok) {
          const data = await response.json()
          setEnvConfig(data)
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch OAuth configuration.")
        }
      } catch (err: any) {
        setError(err.message || "Network error fetching OAuth configuration.")
      } finally {
        setIsLoadingEnv(false)
      }
    }

    fetchEnvConfig()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center">OAuth Debugging Panel</h1>
        <p className="text-center text-gray-600">
          Use this page to verify your NextAuth.js OAuth setup and environment variables.
        </p>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Environment Variable Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" /> Environment Variables Check
            </CardTitle>
            <CardDescription>Verifies if necessary OAuth environment variables are set.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEnv ? (
              <p className="text-gray-500">Loading environment configuration...</p>
            ) : envConfig ? (
              <div className="space-y-2">
                {Object.entries(envConfig).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    {value ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-mono">{key}:</span>
                    <span className={value ? "text-green-700" : "text-red-700"}>
                      {value ? "Configured" : "Missing/Empty"}
                    </span>
                  </div>
                ))}
                {!envConfig.NEXTAUTH_SECRET && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>NEXTAUTH_SECRET Warning</AlertTitle>
                    <AlertDescription>
                      `NEXTAUTH_SECRET` is crucial for security. If not set, NextAuth.js will generate a random one in
                      development, but it must be set in production.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Could not retrieve environment configuration.</p>
            )}
          </CardContent>
        </Card>

        {/* Session Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" /> Current Session Status
            </CardTitle>
            <CardDescription>Displays the current authentication status and user data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Session Status: <span className="font-semibold capitalize">{status}</span>
            </p>
            {status === "authenticated" && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold">User Data:</h3>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                  {JSON.stringify(session.user, null, 2)}
                </pre>
                <p className="text-sm text-gray-600">
                  User ID: <span className="font-mono">{session.user.id}</span>
                </p>
                <p className="text-sm text-gray-600">
                  User Role: <span className="font-mono">{session.user.role}</span>
                </p>
              </div>
            )}
            {status === "unauthenticated" && <p className="mt-4 text-gray-600">You are currently not logged in.</p>}
          </CardContent>
        </Card>

        {/* OAuth Login Test Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Test OAuth Logins
            </CardTitle>
            <CardDescription>Attempt to log in using configured OAuth providers.</CardDescription>
          </CardHeader>
          <CardContent>
            <OAuthTestWidget />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" /> Instructions
            </CardTitle>
            <CardDescription>How to use this debugging panel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              1. **Environment Variables**: Ensure all required `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
              `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, and `NEXTAUTH_SECRET` are set in your `.env.local` file
              (for local development) or Vercel project settings (for deployment).
            </p>
            <p>
              2. **Test Logins**: Use the "Test OAuth Logins" section to attempt signing in with Google or Facebook.
              Observe the session status update.
            </p>
            <p>
              3. **Verify User Data**: After successful login, check the "Current Session Status" to ensure `user.id`
              and `user.role` are correctly populated.
            </p>
            <p>
              4. **Troubleshooting**: If logins fail, check your provider configurations (redirect URIs, client
              IDs/secrets) and your server logs for more detailed errors.
            </p>
            <p className="text-sm text-gray-500">
              Note: This page is for debugging purposes and should not be exposed in production without proper access
              control.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
