"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function SimpleOAuthTestPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-700">Loading session...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Simple OAuth Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session ? (
            <div className="text-center">
              <p className="text-lg font-semibold">Welcome, {session.user?.name || session.user?.email}!</p>
              <p className="text-sm text-gray-600">You are logged in as a {session.user?.role}.</p>
              <pre className="bg-gray-100 p-3 rounded-md text-xs mt-4 text-left overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
              <Button onClick={() => signOut()} className="mt-6 w-full">
                Sign out
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700">You are not logged in.</p>
              <Button onClick={() => signIn("google")} className="w-full">
                Sign in with Google
              </Button>
              <Button onClick={() => signIn("facebook")} className="w-full" variant="outline">
                Sign in with Facebook
              </Button>
              <Button onClick={() => signIn("credentials")} className="w-full" variant="secondary">
                Sign in with Credentials
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
