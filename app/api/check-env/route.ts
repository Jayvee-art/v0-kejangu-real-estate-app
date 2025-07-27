import { NextResponse } from "next/server"

export async function GET() {
  try {
    const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "NEXTAUTH_SECRET", "NEXTAUTH_URL"]

    const optionalEnvVars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET"]

    const envStatus = {
      required: {},
      optional: {},
      missing: [],
      warnings: [],
    }

    // Check required environment variables
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar]
      envStatus.required[envVar] = {
        exists: !!value,
        length: value ? value.length : 0,
        masked: value ? `${value.substring(0, 8)}...` : "NOT SET",
      }

      if (!value) {
        envStatus.missing.push(envVar)
      }
    }

    // Check optional environment variables
    for (const envVar of optionalEnvVars) {
      const value = process.env[envVar]
      envStatus.optional[envVar] = {
        exists: !!value,
        length: value ? value.length : 0,
        masked: value ? `${value.substring(0, 8)}...` : "NOT SET",
      }
    }

    // Add warnings for weak secrets
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      envStatus.warnings.push("JWT_SECRET should be at least 32 characters long")
    }

    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
      envStatus.warnings.push("NEXTAUTH_SECRET should be at least 32 characters long")
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.includes("change-this")) {
      envStatus.warnings.push("JWT_SECRET appears to be using default value - please change it")
    }

    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.includes("change-this")) {
      envStatus.warnings.push("NEXTAUTH_SECRET appears to be using default value - please change it")
    }

    return NextResponse.json({
      success: envStatus.missing.length === 0,
      message:
        envStatus.missing.length === 0
          ? "All required environment variables are set"
          : `Missing required environment variables: ${envStatus.missing.join(", ")}`,
      envStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error: any) {
    console.error("Environment check error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error checking environment variables",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
