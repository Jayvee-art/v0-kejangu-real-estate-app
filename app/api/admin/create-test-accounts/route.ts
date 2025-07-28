import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User, Listing, Booking } from "@/lib/models"

export async function POST() {
  try {
    await connectDB()

    // Clear existing test data (optional, for clean slate)
    await User.deleteMany({ email: { $in: ["landlord@test.com", "tenant@test.com", "admin@test.com"] } })
    await Listing.deleteMany({})
    await Booking.deleteMany({})

    const hashedPassword = await bcrypt.hash("123456", 10)

    const landlord = await User.create({
      name: "Test Landlord",
      email: "landlord@test.com",
      password: hashedPassword,
      role: "landlord",
      country: "Kenya",
      phone: "+254712345678",
      emailVerified: true,
    })

    const tenant = await User.create({
      name: "Test Tenant",
      email: "tenant@test.com",
      password: hashedPassword,
      role: "tenant",
      country: "Kenya",
      phone: "+254787654321",
      emailVerified: true,
    })

    const admin = await User.create({
      name: "Test Admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
    })

    const listing1 = await Listing.create({
      title: "Spacious Apartment in Westlands",
      description: "A beautiful 3-bedroom apartment with modern amenities and city views.",
      price: 75000,
      location: "Westlands",
      imageUrl: "/placeholder.svg?height=400&width=600",
      landlord: landlord._id,
    })

    const listing2 = await Listing.create({
      title: "Cozy House in Karen",
      description: "A charming 4-bedroom house with a large garden, perfect for families.",
      price: 120000,
      location: "Karen",
      imageUrl: "/placeholder.svg?height=400&width=600",
      landlord: landlord._id,
    })

    await Booking.create({
      property: listing1._id,
      tenant: tenant._id,
      landlord: landlord._id,
      startDate: new Date("2025-08-01"),
      endDate: new Date("2025-08-15"),
      totalPrice: listing1.price * 15, // Example calculation
      status: "pending",
      notes: "Looking forward to my stay!",
    })

    return NextResponse.json(
      {
        message: "Test accounts and data created successfully!",
        users: {
          landlord: landlord.email,
          tenant: tenant.email,
          admin: admin.email,
        },
        listings: [listing1.title, listing2.title],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating test accounts:", error)
    return NextResponse.json({ message: "Failed to create test accounts", error: error.message }, { status: 500 })
  }
}
