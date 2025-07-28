import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Booking } from "@/lib/models"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    if (currentUser.role !== "landlord") {
      return NextResponse.json({ message: "Only landlords can view their property bookings" }, { status: 403 })
    }

    await connectDB()

    const bookings = await Booking.find({ landlord: currentUser._id })
      .populate({
        path: "property",
        select: "title location price imageUrl",
      })
      .populate({
        path: "tenant",
        select: "name email",
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching landlord bookings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
