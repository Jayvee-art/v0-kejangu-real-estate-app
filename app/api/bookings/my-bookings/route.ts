import { type NextRequest, NextResponse } from "next/server"
import { connectMongoDB } from "@/lib/mongodb"
import { Booking } from "@/lib/models"
import { getToken } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB()
    const token = await getToken(request)

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const query: { tenant?: mongoose.Types.ObjectId } = {}

    if (userId) {
      // If userId is provided, fetch bookings for that specific user
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
      }
      query.tenant = new mongoose.Types.ObjectId(userId)
    } else {
      // Otherwise, fetch bookings for the authenticated user
      query.tenant = new mongoose.Types.ObjectId(token.id)
    }

    const bookings = await Booking.find(query)
      .populate({
        path: "property",
        select: "title location price imageUrl",
      })
      .populate({
        path: "landlord",
        select: "name email",
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
