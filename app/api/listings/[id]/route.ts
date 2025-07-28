import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Listing } from "@/lib/models"
import { verifyToken } from "@/lib/auth"
import mongoose from "mongoose"

// PUT update listing
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    await connectDB()

    const listing = await Listing.findById(params.id)
    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 })
    }

    // Check if user owns the listing
    if (listing.landlord.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: "Forbidden: You do not own this listing" }, { status: 403 })
    }

    const { title, description, price, location, imageUrl } = await request.json()

    const updatedListing = await Listing.findByIdAndUpdate(
      params.id,
      { title, description, price, location, imageUrl },
      { new: true },
    ).populate("landlord", "name email")

    return NextResponse.json(updatedListing)
  } catch (error) {
    console.error("Error updating listing:", error)
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json({ message: "Invalid listing ID" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE listing
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    await connectDB()

    const listing = await Listing.findById(params.id)
    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 })
    }

    // Check if user owns the listing
    if (listing.landlord.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: "Forbidden: You do not own this listing" }, { status: 403 })
    }

    await Listing.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Listing deleted successfully" })
  } catch (error) {
    console.error("Error deleting listing:", error)
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json({ message: "Invalid listing ID" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
