"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function OAuthTestWidget() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading authentication status...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {session ? (
        <div className="text-center">
          <p className="text-lg font-semibold">Logged in as: {session.user?.name || session.user?.email}</p>
          <p className="text-sm text-gray-600">Role: {session.user?.role}</p>
          <Button onClick={() => signOut()} className="mt-4">
            Sign out
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
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
    </div>
  )
}
