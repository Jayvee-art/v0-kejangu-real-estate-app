import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    if (currentUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: Only admins can check environment variables" }, { status: 403 })
    }

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
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "FACEBOOK_CLIENT_ID",
      "FACEBOOK_CLIENT_SECRET",
    ]

    const missingEnvVars: string[] = []
    const presentEnvVars: { [key: string]: string } = {}

    requiredEnvVars.forEach((key) => {
      if (!process.env[key]) {
        missingEnvVars.push(key)
      } else {
        // For sensitive keys, only show a truncated version or "set"
        if (["JWT_SECRET", "NEXTAUTH_SECRET", "CLOUDINARY_API_SECRET", "EMAIL_PASS"].includes(key)) {
          presentEnvVars[key] = "******** (set)"
        } else {
          presentEnvVars[key] = process.env[key] as string
        }
      }
    })

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required environment variables",
          missing: missingEnvVars,
          present: presentEnvVars,
        },
        { status: 500 },
      )
    } else {
      return NextResponse.json(
        {
          status: "success",
          message: "All required environment variables are set",
          present: presentEnvVars,
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Error checking environment variables:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
