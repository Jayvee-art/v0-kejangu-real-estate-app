import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Booking, Listing } from "@/lib/models"
import { sendEmail } from "@/lib/email"
import { format } from "date-fns"
import { verifyToken } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    if (currentUser.role !== "tenant") {
      return NextResponse.json({ message: "Only tenants can create bookings" }, { status: 403 })
    }

    const { propertyId, startDate, endDate, notes } = await request.json()

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json({ message: "Property ID, start date, and end date are required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
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

    const listing = await Listing.findById(propertyId).populate("landlord")
    if (!listing) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 })
    }

    // Calculate total price (simple daily rate for now)
    const oneDay = 24 * 60 * 60 * 1000 // milliseconds in a day
    const diffDays = Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay))
    const totalPrice = listing.price * diffDays

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      property: propertyId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }, // Existing booking overlaps with new
      ],
    })

    if (overlappingBookings.length > 0) {
      return NextResponse.json({ message: "Property is not available for the selected dates." }, { status: 409 })
    }

    const newBooking = new Booking({
      property: propertyId,
      tenant: currentUser._id,
      landlord: listing.landlord._id,
      startDate: start,
      endDate: end,
      totalPrice,
      notes,
      status: "pending",
    })

    await newBooking.save()

    // Send email notification to landlord
    const landlord = listing.landlord as any
    if (landlord && landlord.email) {
      const bookingDates = `${format(new Date(startDate), "MMM dd, yyyy")} - ${format(new Date(endDate), "MMM dd, yyyy")}`
      const emailHtml = `
        <p>Dear ${landlord.name},</p>
        <p>A new booking request has been made for your property: <strong>${listing.title}</strong>.</p>
        <p><strong>Tenant:</strong> ${currentUser.name} (${currentUser.email})</p>
        <p><strong>Dates:</strong> ${bookingDates}</p>
        <p><strong>Total Price:</strong> KSh ${totalPrice.toLocaleString()}</p>
        <p><strong>Notes:</strong> ${notes || "N/A"}</p>
        <p>Please log in to your dashboard to review and confirm this booking.</p>
        <p>Thank you,<br>Kejangu Team</p>
      `
      await sendEmail({
        to: landlord.email,
        subject: `New Booking Request for Your Property: ${listing.title}`,
        html: emailHtml,
      })
    }

    return NextResponse.json({ message: "Booking created successfully", booking: newBooking }, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    if (currentUser.role !== "tenant") {
      return NextResponse.json({ message: "Only tenants can view their bookings" }, { status: 403 })
    }

    await connectDB()

    const bookings = await Booking.find({ tenant: currentUser._id })
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
    console.error("Error fetching tenant bookings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
