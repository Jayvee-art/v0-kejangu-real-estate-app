"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, Database, Cloud, CheckCircle, XCircle } from "lucide-react"

export default function TestPage() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null)
  const [dbTestResult, setDbTestResult] = useState<any>(null)
  const [envCheckResult, setEnvCheckResult] = useState<any>(null)
  const [loading, setLoading] = useState({ health: false, db: false, env: false })

  const runHealthCheck = async () => {
    setLoading((prev) => ({ ...prev, health: true }))
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setHealthStatus(data.status === "ok" ? "OK" : `Error: ${data.message}`)
    } catch (error: any) {
      setHealthStatus(`Failed to connect: ${error.message}`)
    } finally {
      setLoading((prev) => ({ ...prev, health: false }))
    }
  }

  const runDbTest = async () => {
    setLoading((prev) => ({ ...prev, db: true }))
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()
      if (response.ok) {
        setDbTestResult({ success: true, message: data.message, users: data.users })
      } else {
        setDbTestResult({ success: false, message: data.message || "Failed to connect to DB." })
      }
    } catch (error: any) {
      setDbTestResult({ success: false, message: `Network error: ${error.message}` })
    } finally {
      setLoading((prev) => ({ ...prev, db: false }))
    }
  }

  const runEnvCheck = async () => {
    setLoading((prev) => ({ ...prev, env: true }))
    try {
      const response = await fetch("/api/check-env")
      const data = await response.json()
      if (response.ok) {
        setEnvCheckResult({ success: true, message: data.message, configured: data.configured })
      } else {
        setEnvCheckResult({ success: false, message: data.message, missing: data.missing })
      }
    } catch (error: any) {
      setEnvCheckResult({ success: false, message: `Network error: ${error.message}` })
    } finally {
      setLoading((prev) => ({ ...prev, env: false }))
    }
  }

  useEffect(() => {
    runHealthCheck()
    runDbTest()
    runEnvCheck()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center">System Health & Configuration Test</h1>
        <p className="text-center text-gray-600">
          Run checks to ensure your application's backend, database, and environment variables are correctly configured.
        </p>

        {/* Health Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" /> API Health Check
            </CardTitle>
            <CardDescription>Checks if the API server is running and can connect to the database.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runHealthCheck} disabled={loading.health}>
              {loading.health ? "Checking..." : "Run Health Check"}
            </Button>
            {healthStatus && (
              <Alert className="mt-4">
                {healthStatus === "OK" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertTitle>Status: {healthStatus}</AlertTitle>
                {healthStatus !== "OK" && <AlertDescription>{healthStatus}</AlertDescription>}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Database Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" /> Database Connection Test
            </CardTitle>
            <CardDescription>Attempts to connect to MongoDB and fetch some data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runDbTest} disabled={loading.db}>
              {loading.db ? "Testing..." : "Run DB Test"}
            </Button>
            {dbTestResult && (
              <Alert className="mt-4" variant={dbTestResult.success ? "default" : "destructive"}>
                {dbTestResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertTitle>{dbTestResult.message}</AlertTitle>
                {dbTestResult.success && dbTestResult.users && (
                  <AlertDescription>
                    <p>Fetched {dbTestResult.users.length} sample users.</p>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(
                        dbTestResult.users.map((u: any) => u.email),
                        null,
                        2,
                      )}
                    </pre>
                  </AlertDescription>
                )}
                {!dbTestResult.success && dbTestResult.message && (
                  <AlertDescription>{dbTestResult.message}</AlertDescription>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Environment Variables Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" /> Environment Variables Check
            </CardTitle>
            <CardDescription>Verifies if all critical environment variables are set.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runEnvCheck} disabled={loading.env}>
              {loading.env ? "Checking..." : "Run Env Check"}
            </Button>
            {envCheckResult && (
              <Alert className="mt-4" variant={envCheckResult.success ? "default" : "destructive"}>
                {envCheckResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertTitle>{envCheckResult.message}</AlertTitle>
                <AlertDescription>
                  {envCheckResult.success ? (
                    <p>All required environment variables are configured.</p>
                  ) : (
                    <p>Missing: {envCheckResult.missing.join(", ")}</p>
                  )}
                  <h4 className="font-semibold mt-2">Configuration Status:</h4>
                  <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(envCheckResult.configured, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
