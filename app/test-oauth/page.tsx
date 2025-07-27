"use client"

import { useState, useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Chrome,
  Play,
  RotateCcw,
  Eye,
  Settings,
  Home,
  Shield,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface TestResult {
  portal: string
  status: "success" | "error" | "pending"
  message: string
  timestamp: string
  url?: string
}

export default function TestOAuthPage() {
  const { data: session, status } = useSession()
  const [isAutoTesting, setIsAutoTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [currentTest, setCurrentTest] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  const portals = [
    { name: "Home Page", path: "/", description: "Main landing page", icon: Home },
    { name: "Property Listings", path: "/listings", description: "Browse all properties", icon: Building2 },
    {
      name: "Landlord Dashboard",
      path: "/dashboard",
      description: "Property management (landlord only)",
      icon: Settings,
    },
    { name: "Admin Panel", path: "/admin", description: "Admin controls", icon: Shield },
    { name: "Test Panel", path: "/test", description: "Development testing tools", icon: Eye },
  ]

  const addTestResult = (portal: string, status: "success" | "error", message: string, url?: string) => {
    const result: TestResult = {
      portal,
      status,
      message,
      timestamp: new Date().toLocaleTimeString(),
      url,
    }
    setTestResults((prev) => [result, ...prev])
  }

  const handleGoogleSignIn = async () => {
    try {
      setCurrentTest("Google Sign In")
      addTestResult("Google OAuth", "pending", "Initiating Google sign in...")

      const result = await signIn("google", {
        callbackUrl: "/test-oauth",
        redirect: false,
      })

      if (result?.error) {
        addTestResult("Google OAuth", "error", `Sign in failed: ${result.error}`)
        toast({
          title: "Google Sign In Failed",
          description: result.error,
          variant: "destructive",
        })
      } else {
        addTestResult("Google OAuth", "success", "Google sign in initiated successfully")
        toast({
          title: "Google Sign In",
          description: "Redirecting to Google...",
        })
      }
    } catch (error: any) {
      addTestResult("Google OAuth", "error", `Error: ${error.message}`)
      toast({
        title: "Error",
        description: "Failed to initiate Google sign in",
        variant: "destructive",
      })
    } finally {
      setCurrentTest("")
    }
  }

  const handleSignOut = async () => {
    try {
      setCurrentTest("Sign Out")
      addTestResult("Sign Out", "pending", "Signing out...")

      await signOut({ redirect: false })

      addTestResult("Sign Out", "success", "Successfully signed out")
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      })
    } catch (error: any) {
      addTestResult("Sign Out", "error", `Error: ${error.message}`)
    } finally {
      setCurrentTest("")
    }
  }

  const testPortalAccess = async (portal: { name: string; path: string; description: string }) => {
    try {
      setCurrentTest(portal.name)
      addTestResult(portal.name, "pending", `Testing access to ${portal.path}...`)

      // Simulate navigation test
      const response = await fetch(portal.path, { method: "HEAD" })

      if (response.ok) {
        addTestResult(portal.name, "success", `Portal accessible: ${portal.path}`, portal.path)
      } else {
        addTestResult(portal.name, "error", `Portal returned ${response.status}: ${response.statusText}`)
      }
    } catch (error: any) {
      addTestResult(portal.name, "error", `Network error: ${error.message}`)
    } finally {
      setCurrentTest("")
    }
  }

  const runAutoTest = async () => {
    if (!session) {
      toast({
        title: "Please Sign In First",
        description: "You need to be signed in to run portal tests",
        variant: "destructive",
      })
      return
    }

    setIsAutoTesting(true)
    setTestResults([])

    addTestResult("Auto Test", "pending", "Starting automated portal testing...")

    // Test each portal with delay
    for (const portal of portals) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second delay
      await testPortalAccess(portal)
    }

    addTestResult("Auto Test", "success", "Automated testing completed")
    setIsAutoTesting(false)

    toast({
      title: "Auto Test Complete",
      description: `Tested ${portals.length} portals`,
    })
  }

  const navigateToPortal = (path: string) => {
    router.push(path)
  }

  const clearResults = () => {
    setTestResults([])
    toast({
      title: "Results Cleared",
      description: "Test results have been cleared",
    })
  }

  useEffect(() => {
    if (session) {
      addTestResult("Session", "success", `Signed in as ${session.user?.name} (${session.user?.email})`)
    }
  }, [session])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Chrome className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OAuth Portal Testing</h1>
          <p className="text-gray-600">Automated Google OAuth testing and portal navigation</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Control Panel
                </CardTitle>
                <CardDescription>Manage authentication and testing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Session Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Session Status</h4>
                  {status === "loading" ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : session ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Signed In</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Name:</strong> {session.user?.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {session.user?.email}
                        </p>
                        <p>
                          <strong>Role:</strong> {session.user?.role || "tenant"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Not signed in</span>
                    </div>
                  )}
                </div>

                {/* Authentication Controls */}
                <div className="space-y-3">
                  {!session ? (
                    <Button onClick={handleGoogleSignIn} disabled={currentTest === "Google Sign In"} className="w-full">
                      {currentTest === "Google Sign In" ? (
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
                  ) : (
                    <Button
                      onClick={handleSignOut}
                      disabled={currentTest === "Sign Out"}
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      {currentTest === "Sign Out" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Signing Out...
                        </>
                      ) : (
                        "Sign Out"
                      )}
                    </Button>
                  )}

                  <Button onClick={runAutoTest} disabled={isAutoTesting || !session} className="w-full">
                    {isAutoTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing Portals...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Auto Test
                      </>
                    )}
                  </Button>

                  <Button onClick={clearResults} variant="outline" className="w-full bg-transparent">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear Results
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Portal Quick Access */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Quick Access
                </CardTitle>
                <CardDescription>Navigate to different portals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {portals.map((portal) => {
                    const Icon = portal.icon
                    return (
                      <Button
                        key={portal.path}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigateToPortal(portal.path)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {portal.name}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="results" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results">Test Results</TabsTrigger>
                <TabsTrigger value="portals">Portal Info</TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Test Results</span>
                      <Badge variant="secondary">{testResults.length} tests</Badge>
                    </CardTitle>
                    <CardDescription>Real-time testing results and portal access logs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {testResults.length === 0 ? (
                      <div className="text-center py-8">
                        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No test results yet</p>
                        <p className="text-sm text-gray-500">Sign in and run tests to see results here</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {testResults.map((result, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${
                              result.status === "success"
                                ? "bg-green-50 border-green-500"
                                : result.status === "error"
                                  ? "bg-red-50 border-red-500"
                                  : "bg-yellow-50 border-yellow-500"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {result.status === "success" ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : result.status === "error" ? (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                ) : (
                                  <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                                )}
                                <span className="font-medium">{result.portal}</span>
                              </div>
                              <span className="text-xs text-gray-500">{result.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700">{result.message}</p>
                            {result.url && (
                              <Link
                                href={result.url}
                                className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                              >
                                Visit Portal →
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portals" className="space-y-4">
                <div className="grid gap-4">
                  {portals.map((portal) => {
                    const Icon = portal.icon
                    return (
                      <Card key={portal.path}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Icon className="h-5 w-5" />
                            {portal.name}
                          </CardTitle>
                          <CardDescription>{portal.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{portal.path}</code>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testPortalAccess(portal)}
                                disabled={currentTest === portal.name}
                              >
                                {currentTest === portal.name ? <Loader2 className="h-3 w-3 animate-spin" /> : "Test"}
                              </Button>
                              <Button size="sm" onClick={() => navigateToPortal(portal.path)}>
                                Visit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              How to Use This Testing Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">🚀 Quick Start:</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Click "Sign In with Google" to authenticate</li>
                  <li>Click "Run Auto Test" to test all portals automatically</li>
                  <li>Use "Quick Access" to navigate to specific portals</li>
                  <li>Monitor results in real-time</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-3">🔧 Features:</h4>
                <ul className="text-sm space-y-2 list-disc list-inside">
                  <li>Automated Google OAuth testing</li>
                  <li>Portal accessibility verification</li>
                  <li>Real-time result logging</li>
                  <li>Quick navigation between portals</li>
                  <li>Session status monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
