import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { Listing } from "@/lib/models"

export async function GET(request: NextRequest) {
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

    await connectDB()

    const listings = await Listing.find({ landlord: decoded.userId }).sort({ createdAt: -1 })

    return NextResponse.json(listings)
  } catch (error) {
    console.error("Error fetching user listings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
