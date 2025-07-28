import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Booking, Listing } from "@/lib/models"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    if (currentUser.role !== "landlord") {
      return NextResponse.json({ message: "Only landlords can view bookings for their properties" }, { status: 403 })
    }

    await connectDB()

    // Find all listings owned by the landlord
    const landlordListings = await Listing.find({ landlord: currentUser._id }).select("_id")
    const listingIds = landlordListings.map((listing) => listing._id)

    // Find bookings for these listings
    const bookings = await Booking.find({ property: { $in: listingIds } })
      .populate("property", "title location price imageUrl")
      .populate("tenant", "name email")
      .sort({ createdAt: -1 })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching landlord bookings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
