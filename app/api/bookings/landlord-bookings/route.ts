import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { Booking, Listing } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET

    if (!JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set")
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 })
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, JWT_SECRET) as any

    if (decoded.role !== "landlord") {
      return NextResponse.json({ message: "Only landlords can view bookings for their properties" }, { status: 403 })
    }

    await connectDB()

    // Find all listings owned by the landlord
    const landlordListings = await Listing.find({ landlord: decoded.userId }).select("_id")
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
