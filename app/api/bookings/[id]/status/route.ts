import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { Booking } from "@/lib/models"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ message: "Only landlords can update booking status" }, { status: 403 })
    }

    const { id: bookingId } = params
    const { status } = await request.json()

    if (!["confirmed", "cancelled"].includes(status)) {
      return NextResponse.json({ message: "Invalid status provided" }, { status: 400 })
    }

    await connectDB()

    const booking = await Booking.findById(bookingId).populate("property")

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Ensure the landlord making the request owns the property associated with the booking
    if (booking.property.landlord.toString() !== decoded.userId) {
      return NextResponse.json({ message: "You are not authorized to update this booking" }, { status: 403 })
    }

    booking.status = status
    await booking.save()

    return NextResponse.json({ message: `Booking status updated to ${status}`, booking })
  } catch (error) {
    console.error("Error updating booking status:", error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
