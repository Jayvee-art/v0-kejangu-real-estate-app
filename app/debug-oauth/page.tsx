"use client"

import { useState, useEffect } from "react"
import { signIn, signOut, useSession, getProviders } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Building2,
  CheckCircle,
  XCircle,
  Loader2,
  Chrome,
  AlertTriangle,
  Settings,
  Eye,
  RefreshCw,
  Copy,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DebugInfo {
  nextAuthUrl: string
  hasGoogleProvider: boolean
  hasGoogleCredentials: boolean
  sessionStatus: string
  providers: any
  environmentCheck: any
  errors: string[]
}

export default function DebugOAuthPage() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingEnv, setIsCheckingEnv] = useState(false)
  const [providers, setProviders] = useState<any>(null)
  const { toast } = useToast()

  const checkEnvironment = async () => {
    setIsCheckingEnv(true)
    try {
      const response = await fetch("/api/debug/oauth-config")
      const data = await response.json()

      const providersData = await getProviders()
      setProviders(providersData)

      const debugData: DebugInfo = {
        nextAuthUrl: data.nextAuthUrl || "Not set",
        hasGoogleProvider: !!providersData?.google,
        hasGoogleCredentials: data.hasGoogleCredentials,
        sessionStatus: status,
        providers: providersData,
        environmentCheck: data,
        errors: data.errors || [],
      }

      setDebugInfo(debugData)

      if (data.errors?.length > 0) {
        toast({
          title: "Configuration Issues Found",
          description: `${data.errors.length} issues detected`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Configuration Check Complete",
          description: "OAuth configuration verified",
        })
      }
    } catch (error: any) {
      toast({
        title: "Debug Check Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCheckingEnv(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      console.log("🚀 Attempting Google sign in...")
      console.log("Available providers:", providers)

      if (!providers?.google) {
        throw new Error("Google provider not available. Check your OAuth configuration.")
      }

      const result = await signIn("google", {
        callbackUrl: `${window.location.origin}/debug-oauth`,
        redirect: true, // Force redirect to see what happens
      })

      console.log("Sign in result:", result)

      if (result?.error) {
        console.error("Sign in error:", result.error)
        toast({
          title: "Google Sign In Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Sign in exception:", error)
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({
        callbackUrl: `${window.location.origin}/debug-oauth`,
        redirect: false,
      })
      toast({
        title: "Signed Out",
        description: "Successfully signed out",
      })
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "Configuration copied",
    })
  }

  useEffect(() => {
    checkEnvironment()
  }, [status])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Settings className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OAuth Debug Center</h1>
          <p className="text-gray-600">Diagnose and fix Google OAuth configuration issues</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button onClick={checkEnvironment} disabled={isCheckingEnv} className="h-16">
            {isCheckingEnv ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh Config
              </>
            )}
          </Button>

          {session ? (
            <Button onClick={handleSignOut} disabled={isLoading} variant="outline" className="h-16 bg-transparent">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing Out...
                </>
              ) : (
                "Sign Out"
              )}
            </Button>
          ) : (
            <Button onClick={handleGoogleSignIn} disabled={isLoading || !debugInfo?.hasGoogleProvider} className="h-16">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <Chrome className="h-5 w-5 mr-2" />
                  Test Google Sign In
                </>
              )}
            </Button>
          )}

          <Button asChild variant="outline" className="h-16 bg-transparent">
            <a href="/api/auth/providers" target="_blank" rel="noreferrer">
              <Eye className="h-5 w-5 mr-2" />
              View Providers API
            </a>
          </Button>
        </div>

        {/* Current Session Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {session ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Current Session Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === "loading" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading session...</span>
              </div>
            ) : session ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">✅ Authenticated</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong> {session.user?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {session.user?.email}
                    </p>
                    <p>
                      <strong>Role:</strong> {session.user?.role || "tenant"}
                    </p>
                    <p>
                      <strong>Provider:</strong> Google OAuth
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">❌ Not Authenticated</h4>
                <p className="text-sm text-red-700">No active session found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        {debugInfo && (
          <div className="space-y-6">
            {/* Errors */}
            {debugInfo.errors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium text-red-800">Configuration Issues:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {debugInfo.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Environment Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Configuration</CardTitle>
                <CardDescription>Current OAuth environment settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">NEXTAUTH_URL</span>
                      <Badge variant={debugInfo.nextAuthUrl !== "Not set" ? "default" : "destructive"}>
                        {debugInfo.nextAuthUrl !== "Not set" ? "Set" : "Missing"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">Google Credentials</span>
                      <Badge variant={debugInfo.hasGoogleCredentials ? "default" : "destructive"}>
                        {debugInfo.hasGoogleCredentials ? "Set" : "Missing"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">Google Provider</span>
                      <Badge variant={debugInfo.hasGoogleProvider ? "default" : "destructive"}>
                        {debugInfo.hasGoogleProvider ? "Available" : "Not Available"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">Session Status</span>
                      <Badge variant={debugInfo.sessionStatus === "authenticated" ? "default" : "secondary"}>
                        {debugInfo.sessionStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Providers */}
            <Card>
              <CardHeader>
                <CardTitle>Available Providers</CardTitle>
                <CardDescription>OAuth providers configured in NextAuth</CardDescription>
              </CardHeader>
              <CardContent>
                {providers ? (
                  <div className="space-y-3">
                    {Object.values(providers).map((provider: any) => (
                      <div key={provider.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          {provider.id === "google" && <Chrome className="h-5 w-5" />}
                          <div>
                            <p className="font-medium">{provider.name}</p>
                            <p className="text-sm text-gray-600">ID: {provider.id}</p>
                          </div>
                        </div>
                        <Badge>Available</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No providers available</p>
                )}
              </CardContent>
            </Card>

            {/* Configuration Help */}
            <Card>
              <CardHeader>
                <CardTitle>Fix Configuration Issues</CardTitle>
                <CardDescription>Steps to resolve common OAuth problems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!debugInfo.hasGoogleCredentials && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">Missing Google OAuth Credentials</p>
                          <div className="space-y-1 text-sm">
                            <p>
                              1. Go to{" "}
                              <a
                                href="https://console.cloud.google.com"
                                target="_blank"
                                className="text-blue-600 underline"
                                rel="noreferrer"
                              >
                                Google Cloud Console
                              </a>
                            </p>
                            <p>2. Create a new project or select existing one</p>
                            <p>3. Enable Google+ API</p>
                            <p>4. Create OAuth 2.0 credentials</p>
                            <p>
                              5. Add authorized redirect URI:{" "}
                              <code className="bg-gray-100 px-1 rounded">
                                {debugInfo.nextAuthUrl}/api/auth/callback/google
                              </code>
                            </p>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(`${debugInfo.nextAuthUrl}/api/auth/callback/google`)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Redirect URI
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {debugInfo.nextAuthUrl === "Not set" && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">Missing NEXTAUTH_URL</p>
                          <p className="text-sm">Set your NEXTAUTH_URL environment variable:</p>
                          <code className="block bg-gray-100 p-2 rounded text-sm">
                            NEXTAUTH_URL=https://your-domain.vercel.app
                          </code>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <Building2 className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">Vercel Environment Variables</p>
                        <p className="text-sm">Make sure these are set in your Vercel project:</p>
                        <div className="space-y-1 text-sm font-mono">
                          <p>• NEXTAUTH_URL</p>
                          <p>• NEXTAUTH_SECRET</p>
                          <p>• GOOGLE_CLIENT_ID</p>
                          <p>• GOOGLE_CLIENT_SECRET</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
