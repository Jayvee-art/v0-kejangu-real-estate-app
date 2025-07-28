import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Listing } from "@/lib/models"
import { verifyToken } from "@/lib/auth"

// GET all listings
export async function GET(request: NextRequest) {
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
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    if (currentUser.role !== "landlord") {
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
      landlord: currentUser._id,
    })

    const populatedListing = await Listing.findById(listing._id).populate("landlord", "name email")

    return NextResponse.json(populatedListing, { status: 201 })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
