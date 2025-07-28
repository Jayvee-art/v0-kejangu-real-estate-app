import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Booking } from "@/lib/models"
import { sendEmail } from "@/lib/email"
import { format } from "date-fns"
import { verifyToken } from "@/lib/auth"
import mongoose from "mongoose"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    if (currentUser.role !== "landlord") {
      return NextResponse.json({ message: "Only landlords can update booking status" }, { status: 403 })
    }

    const { id: bookingId } = params
    const { status } = await request.json()

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ message: "Invalid booking ID format" }, { status: 400 })
    }

    if (!["confirmed", "cancelled"].includes(status)) {
      return NextResponse.json({ message: "Invalid status provided" }, { status: 400 })
    }

    await connectDB()

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "property",
        select: "title location landlord", // Ensure landlord is populated for ownership check
      })
      .populate({
        path: "tenant",
        select: "name email",
      })
      .populate({
        path: "landlord",
        select: "name email",
      })

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Ensure the landlord making the request owns the property associated with the booking
    if (booking.property.landlord.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: "You are not authorized to update this booking" }, { status: 403 })
    }

    booking.status = status
    await booking.save()

    // Send email notifications
    const bookingDates = `${format(new Date(booking.startDate), "MMM dd, yyyy")} - ${format(new Date(booking.endDate), "MMM dd, yyyy")}`
    const propertyTitle = booking.property.title
    const tenantName = booking.tenant.name
    const landlordName = booking.landlord.name

    // Email to Tenant
    if (booking.tenant && booking.tenant.email) {
      const tenantSubject = `Your Booking for ${propertyTitle} is ${status}`
      const tenantHtml = `
        <p>Dear ${tenantName},</p>
        <p>Your booking for the property <strong>${propertyTitle}</strong> (${bookingDates}) has been <strong>${status}</strong> by the landlord.</p>
        ${status === "confirmed" ? "<p>The landlord has confirmed your booking. Please contact them for further arrangements.</p>" : ""}
        ${status === "cancelled" ? "<p>The landlord has cancelled your booking. We apologize for any inconvenience.</p>" : ""}
        <p>Thank you,<br>Kejangu Team</p>
      `
      await sendEmail({
        to: booking.tenant.email,
        subject: tenantSubject,
        html: tenantHtml,
      })
    }

    // Email to Landlord (confirmation of action)
    if (booking.landlord && booking.landlord.email) {
      const landlordSubject = `You have ${status} a Booking for ${propertyTitle}`
      const landlordHtml = `
        <p>Dear ${landlordName},</p>
        <p>You have successfully <strong>${status}</strong> the booking for your property <strong>${propertyTitle}</strong> (${bookingDates}) made by ${tenantName}.</p>
        <p>Thank you,<br>Kejangu Team</p>
      `
      await sendEmail({
        to: booking.landlord.email,
        subject: landlordSubject,
        html: landlordHtml,
      })
    }

    return NextResponse.json({ message: `Booking status updated to ${status}`, booking })
  } catch (error) {
    console.error("Error updating booking status:", error)
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json({ message: "Invalid booking ID" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
