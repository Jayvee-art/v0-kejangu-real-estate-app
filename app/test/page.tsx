"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TestResult {
  status: "success" | "error"
  message: string
  details?: any
}

export default function TestPage() {
  const [dbTestResult, setDbTestResult] = useState<TestResult | null>(null)
  const [envTestResult, setEnvTestResult] = useState<TestResult | null>(null)
  const [isLoadingDb, setIsLoadingDb] = useState(false)
  const [isLoadingEnv, setIsLoadingEnv] = useState(false)
  const { toast } = useToast()

  const runDbTest = async () => {
    setIsLoadingDb(true)
    setDbTestResult(null)
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()
      setDbTestResult(data)
      if (response.ok) {
        toast({
          title: "DB Test Success",
          description: data.message,
        })
      } else {
        toast({
          title: "DB Test Failed",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("DB test error:", error)
      setDbTestResult({ status: "error", message: error.message || "Network error" })
      toast({
        title: "DB Test Failed",
        description: error.message || "Network error",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDb(false)
    }
  }

  const runEnvTest = async () => {
    setIsLoadingEnv(true)
    setEnvTestResult(null)
    try {
      const response = await fetch("/api/check-env")
      const data = await response.json()
      setEnvTestResult(data)
      if (response.ok) {
        toast({
          title: "Env Test Success",
          description: data.message,
        })
      } else {
        toast({
          title: "Env Test Failed",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Env test error:", error)
      setEnvTestResult({ status: "error", message: error.message || "Network error" })
      toast({
        title: "Env Test Failed",
        description: error.message || "Network error",
        variant: "destructive",
      })
    } finally {
      setIsLoadingEnv(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">System Health Checks</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Database Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-700">Test the connection to your MongoDB database.</p>
            <Button onClick={runDbTest} disabled={isLoadingDb}>
              {isLoadingDb ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Database
            </Button>
            {dbTestResult && (
              <div
                className={`mt-4 p-3 rounded-md ${
                  dbTestResult.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                <p className="font-semibold">{dbTestResult.message}</p>
                {dbTestResult.details && (
                  <pre className="mt-2 text-xs whitespace-pre-wrap break-all">
                    {JSON.stringify(dbTestResult.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Variables Test */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-700">Check if all required environment variables are set.</p>
            <Button onClick={runEnvTest} disabled={isLoadingEnv}>
              {isLoadingEnv ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Environment
            </Button>
            {envTestResult && (
              <div
                className={`mt-4 p-3 rounded-md ${
                  envTestResult.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                <p className="font-semibold">{envTestResult.message}</p>
                {envTestResult.details && (
                  <div className="mt-2 text-xs">
                    {envTestResult.details.missing && envTestResult.details.missing.length > 0 && (
                      <p className="font-medium">Missing:</p>
                    )}
                    <ul className="list-disc list-inside">
                      {envTestResult.details.missing?.map((key: string) => (
                        <li key={key}>{key}</li>
                      ))}
                    </ul>
                    {envTestResult.details.present && Object.keys(envTestResult.details.present).length > 0 && (
                      <p className="font-medium mt-2">Present:</p>
                    )}
                    <ul className="list-disc list-inside">
                      {Object.entries(envTestResult.details.present || {}).map(([key, value]: [string, any]) => (
                        <li key={key}>
                          {key}: {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
