import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Booking } from "@/lib/models"
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

    const query: { tenant?: mongoose.Types.ObjectId } = {}

    if (userId) {
      // If userId is provided, fetch bookings for that specific user
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
      }
      query.tenant = new mongoose.Types.ObjectId(userId)
    } else {
      // Otherwise, fetch bookings for the authenticated user
      if (currentUser.role !== "tenant") {
        return NextResponse.json({ message: "Only tenants can view their own bookings" }, { status: 403 })
      }
      query.tenant = new mongoose.Types.ObjectId(currentUser._id)
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
