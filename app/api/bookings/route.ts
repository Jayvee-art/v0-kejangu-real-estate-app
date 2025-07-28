import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { Booking, Listing } from "@/lib/models"
import { isValidObjectId } from "mongoose"

// POST new booking
export async function POST(request: NextRequest) {
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

    if (decoded.role !== "tenant") {
      return NextResponse.json({ message: "Only tenants can create bookings" }, { status: 403 })
    }

    const { propertyId, startDate, endDate, notes } = await request.json()

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json({ message: "Property ID, start date, and end date are required" }, { status: 400 })
    }

    if (!isValidObjectId(propertyId)) {
      return NextResponse.json({ message: "Invalid property ID format" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ message: "Invalid date format" }, { status: 400 })
    }

    if (start >= end) {
      return NextResponse.json({ message: "Start date must be before end date" }, { status: 400 })
    }

    await connectDB()

    const listing = await Listing.findById(propertyId)
    if (!listing) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 })
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      property: propertyId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }, // Existing booking overlaps with new
      ],
    })

    if (overlappingBookings.length > 0) {
      return NextResponse.json({ message: "Property is not available for the selected dates" }, { status: 409 })
    }

    // Calculate total price (simple daily rate for now)
    const oneDay = 24 * 60 * 60 * 1000 // milliseconds in a day
    const diffDays = Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay))
    const totalPrice = listing.price * diffDays

    const booking = await Booking.create({
      property: propertyId,
      tenant: decoded.userId,
      landlord: listing.landlord, // Get landlord from the listing
      startDate: start,
      endDate: end,
      totalPrice,
      notes,
      status: "pending", // Initial status
    })

    const populatedBooking = await Booking.findById(booking._id)
      .populate("property", "title location price imageUrl")
      .populate("tenant", "name email")
      .populate("landlord", "name email")

    return NextResponse.json(populatedBooking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
