import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Listing } from "@/lib/models"
import { verifyToken } from "@/lib/auth"

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
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    await connectDB()

    const newListing = new Listing({
      title,
      description,
      price,
      location,
      imageUrl,
      landlord: currentUser._id,
    })

    await newListing.save()

    return NextResponse.json({ message: "Listing created successfully", listing: newListing }, { status: 201 })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const listings = await Listing.find({}).populate("landlord", "name email").sort({ createdAt: -1 })
    return NextResponse.json(listings)
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
