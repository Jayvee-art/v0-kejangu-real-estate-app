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
      return NextResponse.json({ message: "Forbidden: Only admins can test portal access" }, { status: 403 })
    }

    // This is a placeholder for actual Vercel API interaction.
    // In a real scenario, you might try to fetch Vercel project details
    // using Vercel API tokens, which would be stored as environment variables.
    // For this example, we'll simulate a successful check.

    const vercelApiToken = process.env.VERCEL_API_TOKEN // Example env var

    if (vercelApiToken) {
      // Simulate a successful API call
      return NextResponse.json(
        {
          message: "Vercel API token is present. Portal access test successful (simulated).",
          status: "success",
        },
        { status: 200 },
      )
    } else {
      return NextResponse.json(
        {
          message: "Vercel API token is not set. Cannot test portal access.",
          status: "missing_token",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error testing portal access:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
