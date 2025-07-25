"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TestPage() {
  const [isCreatingAccounts, setIsCreatingAccounts] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const { toast } = useToast()

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
          <p className="text-gray-600">Create test accounts and debug registration issues</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Create Test Accounts
              </CardTitle>
              <CardDescription>Create pre-configured test accounts for landlords and tenants</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={createTestAccounts} disabled={isCreatingAccounts} className="w-full">
                {isCreatingAccounts ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Accounts...
                  </>
                ) : (
                  "Create Test Accounts"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Test Registration
              </CardTitle>
              <CardDescription>Test the registration endpoint with a random user</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testRegistration} variant="outline" className="w-full bg-transparent">
                Test Registration Flow
              </Button>
            </CardContent>
          </Card>
        </div>

        {testResults && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {testResults.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Test Results
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
      </div>
    </div>
  )
}
