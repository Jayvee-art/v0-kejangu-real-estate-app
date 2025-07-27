"use client"

import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Chrome, LogOut, User, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function OAuthTestWidget() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn("google", {
        callbackUrl: window.location.href,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Sign In Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ redirect: false })
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          OAuth Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {session ? (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Signed In
                </Badge>
              </div>
              <p className="text-sm font-medium">{session.user?.name}</p>
              <p className="text-xs text-gray-600">{session.user?.email}</p>
              <p className="text-xs text-gray-600">Role: {session.user?.role || "tenant"}</p>
            </div>
            <Button onClick={handleSignOut} disabled={isLoading} variant="outline" className="w-full bg-transparent">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <Badge variant="secondary">Not Signed In</Badge>
            </div>
            <Button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <Chrome className="h-4 w-4 mr-2" />
                  Sign In with Google
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
