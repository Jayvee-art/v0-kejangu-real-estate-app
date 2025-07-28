import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Listing } from "@/lib/models"
import { verifyToken } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const query: { landlord?: mongoose.Types.ObjectId } = {}

    if (userId) {
      // If userId is provided, fetch listings for that specific landlord
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
      }
      query.landlord = new mongoose.Types.ObjectId(userId)
    } else {
      // Otherwise, fetch listings for the authenticated landlord
      if (currentUser.role !== "landlord") {
        return NextResponse.json({ message: "Only landlords can view their own listings" }, { status: 403 })
      }
      query.landlord = new mongoose.Types.ObjectId(currentUser._id)
    }

    const listings = await Listing.find(query).populate("landlord", "name email").sort({ createdAt: -1 })

    return NextResponse.json(listings)
  } catch (error) {
    console.error("Error fetching my listings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
