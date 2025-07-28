import { NextResponse } from "next/server"

export async function GET() {
  try {
    const errors: string[] = []

    // Check required environment variables
    const nextAuthUrl = process.env.NEXTAUTH_URL
    const nextAuthSecret = process.env.NEXTAUTH_SECRET
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
    const facebookClientId = process.env.FACEBOOK_CLIENT_ID
    const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET

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

    if (!facebookClientId) {
      errors.push("FACEBOOK_CLIENT_ID environment variable is not set")
    }

    if (!facebookClientSecret) {
      errors.push("FACEBOOK_CLIENT_SECRET environment variable is not set")
    }

    // Check if URL is properly formatted
    if (nextAuthUrl && !nextAuthUrl.startsWith("http")) {
      errors.push("NEXTAUTH_URL must start with http:// or https://")
    }

    const envConfig = {
      GOOGLE_CLIENT_ID: !!googleClientId,
      GOOGLE_CLIENT_SECRET: !!googleClientSecret,
      FACEBOOK_CLIENT_ID: !!facebookClientId,
      FACEBOOK_CLIENT_SECRET: !!facebookClientSecret,
      NEXTAUTH_SECRET: !!nextAuthSecret,
    }

    const allSet = Object.values(envConfig).every(Boolean)
    const googleEnabled = envConfig.GOOGLE_CLIENT_ID && envConfig.GOOGLE_CLIENT_SECRET
    const facebookEnabled = envConfig.FACEBOOK_CLIENT_ID && envConfig.FACEBOOK_CLIENT_SECRET
    const nextAuthSecretSet = envConfig.NEXTAUTH_SECRET

    return NextResponse.json(
      {
        message: allSet ? "All OAuth environment variables are set." : "Some OAuth environment variables are missing.",
        nextAuthUrl: nextAuthUrl || "Not set",
        nextAuthSecretSet,
        googleEnabled,
        facebookEnabled,
        googleClientId: googleClientId ? `${googleClientId.substring(0, 10)}...` : "Not set",
        googleClientSecret: googleClientSecret ? "Set" : "Not set",
        facebookClientId: facebookClientId ? `${facebookClientId.substring(0, 10)}...` : "Not set",
        facebookClientSecret: facebookClientSecret ? "Set" : "Not set",
        errors,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        redirectUri: nextAuthUrl ? `${nextAuthUrl}/api/auth/callback/google` : "Cannot generate - NEXTAUTH_URL not set",
        envConfig,
      },
      { status: allSet ? 200 : 400 },
    )
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
