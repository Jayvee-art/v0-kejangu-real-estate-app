"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function DebugOAuthPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
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

  if (status === "loading" || configLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading debug information...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">OAuth Debug Information</h1>

      <Card className="w-full max-w-2xl mb-6">
        <CardHeader>
          <CardTitle>NextAuth Session Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto">{JSON.stringify(session, null, 2)}</pre>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>OAuth Provider Configuration (Server-side)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto">{JSON.stringify(oauthConfig, null, 2)}</pre>
          <p className="mt-4 text-sm text-gray-600">
            This shows if your `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, and
            `FACEBOOK_CLIENT_SECRET` are detected by the server.
            <br />
            Ensure `NEXTAUTH_URL` is correctly set in your `.env.local` for proper callback URLs.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
