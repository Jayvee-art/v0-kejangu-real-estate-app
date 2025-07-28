import { NextResponse } from "next/server"

export async function GET() {
  const requiredEnvVars = [
    "MONGODB_URI",
    "JWT_SECRET",
    "NEXTAUTH_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "OPENAI_API_KEY",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASS",
    "EMAIL_FROM",
  ]

  const missingEnvVars: string[] = []
  const configuredEnvVars: { [key: string]: boolean } = {}

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar)
      configuredEnvVars[envVar] = false
    } else {
      configuredEnvVars[envVar] = true
    }
  })

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        message: "Missing required environment variables.",
        missing: missingEnvVars,
        configured: configuredEnvVars,
      },
      { status: 500 },
    )
  } else {
    return NextResponse.json(
      {
        message: "All required environment variables are configured.",
        configured: configuredEnvVars,
      },
      { status: 200 },
    )
  }
}
