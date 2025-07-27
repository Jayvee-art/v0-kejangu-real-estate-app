"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Database,
  Wifi,
  WifiOff,
  Key,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TestPage() {
  const [isCreatingAccounts, setIsCreatingAccounts] = useState(false)
  const [isTestingDB, setIsTestingDB] = useState(false)
  const [isCheckingEnv, setIsCheckingEnv] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [dbTestResults, setDbTestResults] = useState<any>(null)
  const [envResults, setEnvResults] = useState<any>(null)
  const { toast } = useToast()

  const checkEnvironmentVariables = async () => {
    setIsCheckingEnv(true)
    try {
      console.log("🔍 Checking environment variables...")

      const response = await fetch("/api/check-env")
      const data = await response.json()

      setEnvResults(data)

      if (data.success) {
        toast({
          title: "Environment Check Passed! ✅",
          description: "All required environment variables are properly set",
        })
      } else {
        toast({
          title: "Environment Issues Found ⚠️",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Environment check error:", error)
      const errorData = {
        success: false,
        message: "Network error - could not reach environment check endpoint",
        error: error.message,
      }
      setEnvResults(errorData)

      toast({
        title: "Environment Check Error",
        description: "Check console for details",
        variant: "destructive",
      })
    } finally {
      setIsCheckingEnv(false)
    }
  }

  const testDatabaseConnection = async () => {
    setIsTestingDB(true)
    try {
      console.log("🧪 Testing database connection...")

      const response = await fetch("/api/test-db")
      const data = await response.json()

      setDbTestResults(data)

      if (data.success) {
        toast({
          title: "Database Connection Successful! ✅",
          description: `Connected to database with ${data.data.userCount} users`,
        })
      } else {
        toast({
          title: "Database Connection Failed ❌",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Database test error:", error)
      const errorData = {
        success: false,
        message: "Network error - could not reach database test endpoint",
        error: error.message,
      }
      setDbTestResults(errorData)

      toast({
        title: "Database Test Error",
        description: "Check console for details",
        variant: "destructive",
      })
    } finally {
      setIsTestingDB(false)
    }
  }

  const createTestAccounts = async () => {
    setIsCreatingAccounts(true)
    try {
      const response = await fetch("/api/admin/create-test-accounts", {
        method: "POST",
      })

      const data = await response.json()
      setTestResults(data)

      if (data.success) {
        toast({
          title: "Test Accounts Created! 🎉",
          description: `Created ${data.created.length} accounts, skipped ${data.skipped.length} existing ones`,
        })
      } else {
        toast({
          title: "Failed to create accounts",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating test accounts:", error)
      toast({
        title: "Error",
        description: "Failed to create test accounts",
        variant: "destructive",
      })
    } finally {
      setIsCreatingAccounts(false)
    }
  }

  const testRegistration = async () => {
    try {
      const testData = {
        name: "Test User " + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: "123456",
        role: "landlord",
        country: "KE",
        phone: "+254700000000",
        subscribeToUpdates: false,
      }

      console.log("Testing registration with:", { ...testData, password: "[HIDDEN]" })

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const result = await response.json()
      console.log("Registration test result:", result)

      if (response.ok) {
        toast({
          title: "Registration Test Passed! ✅",
          description: `Account created: ${testData.email}`,
        })
      } else {
        toast({
          title: "Registration Test Failed ❌",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Registration test error:", error)
      toast({
        title: "Registration Test Error",
        description: "Check console for details",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kejangu Test Panel</h1>
          <p className="text-gray-600">Test environment variables, database connection, and debug issues</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Environment
              </CardTitle>
              <CardDescription>Check environment variables and secrets</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={checkEnvironmentVariables} disabled={isCheckingEnv} className="w-full">
                {isCheckingEnv ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Check Env
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database
              </CardTitle>
              <CardDescription>Test MongoDB connection and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testDatabaseConnection} disabled={isTestingDB} className="w-full">
                {isTestingDB ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Test DB
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Test Accounts
              </CardTitle>
              <CardDescription>Create pre-configured test accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={createTestAccounts} disabled={isCreatingAccounts} className="w-full">
                {isCreatingAccounts ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Accounts"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Registration
              </CardTitle>
              <CardDescription>Test the registration endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testRegistration} variant="outline" className="w-full bg-transparent">
                Test Registration
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Environment Variables Results */}
        {envResults && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {envResults.success ? (
                  <>
                    <Key className="h-5 w-5 text-green-600" />
                    <span className="text-green-600">Environment Variables OK</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600">Environment Issues Found</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {envResults.success ? (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">✅ All Required Variables Set</h4>
                    <p className="text-sm text-green-700">Environment: {envResults.environment}</p>
                  </div>

                  {envResults.envStatus.warnings.length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">⚠️ Warnings:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {envResults.envStatus.warnings.map((warning: string, index: number) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Required Variables:</h4>
                      <div className="space-y-2">
                        {Object.entries(envResults.envStatus.required).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <span className="font-mono">{key}</span>
                            <Badge variant={value.exists ? "default" : "destructive"}>
                              {value.exists ? `${value.length} chars` : "Missing"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Optional Variables:</h4>
                      <div className="space-y-2">
                        {Object.entries(envResults.envStatus.optional).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <span className="font-mono">{key}</span>
                            <Badge variant={value.exists ? "default" : "secondary"}>
                              {value.exists ? `${value.length} chars` : "Not Set"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-1">Missing Variables</h4>
                    <p className="text-sm text-red-700">{envResults.message}</p>
                  </div>

                  {envResults.envStatus?.missing && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Required but Missing:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {envResults.envStatus.missing.map((variable: string, index: number) => (
                          <li key={index} className="font-mono">
                            • {variable}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Database Test Results */}
        {dbTestResults && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {dbTestResults.success ? (
                  <>
                    <Wifi className="h-5 w-5 text-green-600" />
                    <span className="text-green-600">Database Connection Successful</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-red-600" />
                    <span className="text-red-600">Database Connection Failed</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dbTestResults.success ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-1">Connection Status</h4>
                      <p className="text-sm text-green-700">{dbTestResults.data.connectionStatus}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-1">Database Type</h4>
                      <p className="text-sm text-blue-700">{dbTestResults.data.databaseName}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-1">Total Users</h4>
                      <p className="text-sm text-purple-700">{dbTestResults.data.userCount}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-1">Test Time</h4>
                      <p className="text-sm text-gray-700">{new Date(dbTestResults.data.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  {dbTestResults.data.sampleUsers && dbTestResults.data.sampleUsers.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Sample Users in Database:</h4>
                      <div className="space-y-2">
                        {dbTestResults.data.sampleUsers.map((user: any, index: number) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            <span className="font-medium">{user.name}</span> ({user.email}) - {user.role}
                            <span className="text-gray-500 ml-2">{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-1">Error Message</h4>
                    <p className="text-sm text-red-700">{dbTestResults.message}</p>
                  </div>
                  {dbTestResults.error && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-1">Error Details</h4>
                      <p className="text-sm text-red-700 font-mono">{dbTestResults.error}</p>
                    </div>
                  )}
                  {dbTestResults.errorType && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-1">Error Type</h4>
                      <p className="text-sm text-yellow-700">{dbTestResults.errorType}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Account Creation Results */}
        {testResults && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {testResults.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Test Account Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.success && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Available Test Accounts:</h3>
                    <div className="grid gap-3">
                      {testResults.testAccounts.map((account: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant={account.type.includes("Landlord") ? "default" : "secondary"}>
                              {account.type}
                            </Badge>
                          </div>
                          <p className="text-sm">
                            <strong>Email:</strong> {account.email}
                          </p>
                          <p className="text-sm">
                            <strong>Password:</strong> {account.password}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{account.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {testResults.created.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">✅ Created Accounts:</h4>
                      <ul className="text-sm space-y-1">
                        {testResults.created.map((user: any, index: number) => (
                          <li key={index} className="text-green-700">
                            {user.email} ({user.role})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {testResults.skipped.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-600 mb-2">⚠️ Skipped (Already Exist):</h4>
                      <ul className="text-sm space-y-1">
                        {testResults.skipped.map((email: string, index: number) => (
                          <li key={index} className="text-yellow-700">
                            {email}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!testResults.success && (
                <div className="text-red-600">
                  <p>
                    <strong>Error:</strong> {testResults.message}
                  </p>
                  {testResults.error && (
                    <p className="text-sm mt-2">
                      <strong>Details:</strong> {testResults.error}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Access Links</CardTitle>
            <CardDescription>Direct links to test different parts of the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild variant="outline">
                <a href="/auth/login">Login Page</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/auth/register">Registration Page</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/dashboard">Landlord Dashboard</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/listings">Property Listings</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/admin">Admin Panel</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/">Home Page</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Fix NextAuth NO_SECRET Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">🔧 To Fix the NO_SECRET Error:</h4>
              <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
                <li>
                  Run: <code className="bg-yellow-100 px-2 py-1 rounded">node scripts/generate-secrets.js</code>
                </li>
                <li>Copy the generated secrets to your Vercel environment variables</li>
                <li>
                  Set <code className="bg-yellow-100 px-2 py-1 rounded">NEXTAUTH_URL</code> to your production URL
                </li>
                <li>Redeploy your application</li>
              </ol>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📋 Required Environment Variables:</h4>
              <ul className="text-sm text-blue-700 space-y-1 font-mono">
                <li>• MONGODB_URI</li>
                <li>• JWT_SECRET</li>
                <li>• NEXTAUTH_SECRET</li>
                <li>• NEXTAUTH_URL</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
