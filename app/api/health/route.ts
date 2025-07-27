import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check critical environment variables
    const requiredVars = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    }

    const optionalVars = {
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      FACEBOOK_CLIENT_ID: !!process.env.FACEBOOK_CLIENT_ID,
      FACEBOOK_CLIENT_SECRET: !!process.env.FACEBOOK_CLIENT_SECRET,
    }

    const missingRequired = Object.entries(requiredVars)
      .filter(([_, exists]) => !exists)
      .map(([key]) => key)

    const isHealthy = missingRequired.length === 0

    return NextResponse.json({
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      requiredVars,
      optionalVars,
      missingRequired,
      message: isHealthy
        ? "All required environment variables are set"
        : `Missing required variables: ${missingRequired.join(", ")}`,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 },
    )
  }
}
