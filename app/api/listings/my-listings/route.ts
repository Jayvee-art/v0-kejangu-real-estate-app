import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Listing } from "@/lib/models"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    if (currentUser.role !== "landlord") {
      return NextResponse.json({ message: "Only landlords can view their own listings" }, { status: 403 })
    }

    await connectDB()

    const listings = await Listing.find({ landlord: currentUser._id }).sort({ createdAt: -1 })

    return NextResponse.json(listings)
  } catch (error) {
    console.error("Error fetching landlord's listings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
