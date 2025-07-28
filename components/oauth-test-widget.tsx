"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function OAuthTestWidget() {
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
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading session...</span>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm">Signed in as {session.user?.email}</span>
        <Button onClick={handleSignOut} disabled={isLoading} size="sm">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => handleSignIn("google")} disabled={isLoading} size="sm">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign in with Google
      </Button>
      <Button onClick={() => handleSignIn("facebook")} disabled={isLoading} size="sm">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign in with Facebook
      </Button>
      <Button onClick={() => handleSignIn("credentials")} disabled={isLoading} size="sm">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign in with Credentials
      </Button>
    </div>
  )
}
