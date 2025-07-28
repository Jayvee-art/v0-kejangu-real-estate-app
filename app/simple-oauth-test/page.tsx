"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, signOut, useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export default function SimpleOAuthTestPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    await signIn(provider)
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut()
    setIsLoading(false)
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading session...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Simple OAuth Test</h1>

      <Card className="w-full max-w-md mb-6">
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Status:</span> Authenticated
              </p>
              <p>
                <span className="font-semibold">User Email:</span> {session.user?.email}
              </p>
              <p>
                <span className="font-semibold">User Name:</span> {session.user?.name}
              </p>
              <p>
                <span className="font-semibold">User Role:</span> {session.user?.role}
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
          <CardTitle>Sign In Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => handleSignIn("google")} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In with Google
          </Button>
          <Button onClick={() => handleSignIn("facebook")} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In with Facebook
          </Button>
          <Button onClick={() => handleSignIn("credentials")} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In with Email/Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
