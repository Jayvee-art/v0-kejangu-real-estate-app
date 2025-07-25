import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { Listing } from "@/lib/models"

// GET all listings
export async function GET() {
  try {
    await connectDB()

    const listings = await Listing.find().populate("landlord", "name email").sort({ createdAt: -1 })

    return NextResponse.json(listings)
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST new listing
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

    if (decoded.role !== "landlord") {
      return NextResponse.json({ message: "Only landlords can create listings" }, { status: 403 })
    }

    const { title, description, price, location, imageUrl } = await request.json()

    if (!title || !description || !price || !location) {
      return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 })
    }

    await connectDB()

    const listing = await Listing.create({
      title,
      description,
      price,
      location,
      imageUrl,
      landlord: decoded.userId,
    })

    const populatedListing = await Listing.findById(listing._id).populate("landlord", "name email")

    return NextResponse.json(populatedListing, { status: 201 })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
