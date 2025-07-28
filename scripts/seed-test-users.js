const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const { User, Listing, Booking } = require("../lib/models") // Adjust path as needed

require("dotenv").config({ path: ".env.local" }) // Load .env.local

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env.local")
  process.exit(1)
}

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return
  }
  return mongoose.connect(MONGODB_URI)
}

async function seedDatabase() {
  try {
    await connectDB()
    console.log("MongoDB connected for seeding.")

    // Clear existing test data
    console.log("Clearing existing test users, listings, and bookings...")
    await User.deleteMany({ email: { $in: ["landlord@test.com", "tenant@test.com", "admin@test.com"] } })
    await Listing.deleteMany({})
    await Booking.deleteMany({})
    console.log("Existing test data cleared.")

    const hashedPassword = await bcrypt.hash("123456", 10)

    console.log("Creating test users...")
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
    console.log("Test users created.")

    console.log("Creating test listings...")
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
    console.log("Test listings created.")

    console.log("Creating test bookings...")
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
    console.log("Test bookings created.")

    console.log("Database seeding complete!")
    console.log("Test Landlord Email:", landlord.email)
    console.log("Test Tenant Email:", tenant.email)
    console.log("Test Admin Email:", admin.email)
    console.log("Password for all test accounts: 123456")
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  } finally {
    mongoose.connection.close()
  }
}

seedDatabase()
