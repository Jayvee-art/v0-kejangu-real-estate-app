import { type NextRequest, NextResponse } from "next/server"
import { connectMongoDB } from "@/lib/mongodb"
import { User } from "@/lib/models"
import { getToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB()
    const { id } = params

    const token = await getToken(request)
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findById(id).select("-password -authProviderId -emailVerified -isActive -lastLogin")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
