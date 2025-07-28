import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  return NextResponse.json({ message: "Test portal is active!" }, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { portal, path } = await request.json()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          portal,
        },
        { status: 401 },
      )
    }

    // Simulate portal access test
    const testResult = {
      portal,
      path,
      accessible: true,
      userRole: session.user?.role || "tenant",
      timestamp: new Date().toISOString(),
      message: `Portal ${portal} is accessible for ${session.user?.role || "tenant"} role`,
    }

    // Add role-based access logic
    if (path === "/dashboard" && session.user?.role !== "landlord") {
      testResult.accessible = false
      testResult.message = "Dashboard requires landlord role"
    }

    if (path === "/admin" && session.user?.email !== "admin@kejangu.com") {
      testResult.accessible = false
      testResult.message = "Admin panel requires admin privileges"
    }

    return NextResponse.json({
      success: true,
      data: testResult,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Portal test failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
