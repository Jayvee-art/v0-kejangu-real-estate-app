import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { Listing } from "@/lib/models"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// PUT update listing
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, JWT_SECRET) as any

    await connectDB()

    const listing = await Listing.findById(params.id)
    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 })
    }

    // Check if user owns the listing
    if (listing.landlord.toString() !== decoded.userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
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
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE listing
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, JWT_SECRET) as any

    await connectDB()

    const listing = await Listing.findById(params.id)
    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 })
    }

    // Check if user owns the listing
    if (listing.landlord.toString() !== decoded.userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await Listing.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Listing deleted successfully" })
  } catch (error) {
    console.error("Error deleting listing:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
