import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models"
import { verifyToken } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    // const currentUser = authResult.user; // Not strictly needed for public profile, but good for auth check

    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID format" }, { status: 400 })
    }

    // Select public profile fields, exclude sensitive ones
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
