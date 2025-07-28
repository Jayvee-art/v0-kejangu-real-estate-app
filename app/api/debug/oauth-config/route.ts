import { NextResponse } from "next/server"

export async function GET() {
  try {
    const errors: string[] = []

    // Check required environment variables
    const nextAuthUrl = process.env.NEXTAUTH_URL
    const nextAuthSecret = process.env.NEXTAUTH_SECRET
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!nextAuthUrl) {
      errors.push("NEXTAUTH_URL environment variable is not set")
    }

    if (!nextAuthSecret) {
      errors.push("NEXTAUTH_SECRET environment variable is not set")
    }

    if (!googleClientId) {
      errors.push("GOOGLE_CLIENT_ID environment variable is not set")
    }

    if (!googleClientSecret) {
      errors.push("GOOGLE_CLIENT_SECRET environment variable is not set")
    }

    // Check if URL is properly formatted
    if (nextAuthUrl && !nextAuthUrl.startsWith("http")) {
      errors.push("NEXTAUTH_URL must start with http:// or https://")
    }

    const hasGoogleCredentials = !!(googleClientId && googleClientSecret)

    return NextResponse.json({
      success: errors.length === 0,
      nextAuthUrl: nextAuthUrl || "Not set",
      nextAuthSecret: nextAuthSecret ? "Set" : "Not set",
      hasGoogleCredentials,
      googleClientId: googleClientId ? `${googleClientId.substring(0, 10)}...` : "Not set",
      googleClientSecret: googleClientSecret ? "Set" : "Not set",
      errors,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      redirectUri: nextAuthUrl ? `${nextAuthUrl}/api/auth/callback/google` : "Cannot generate - NEXTAUTH_URL not set",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
