import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    console.log("Registration attempt started")

    const body = await request.json()
    console.log("Request body received:", { ...body, password: "[HIDDEN]" })

    const { name, email, password, role, country, phone, subscribeToUpdates } = body

    // Validate input
    if (!name || !email || !password || !role) {
      console.log("Validation failed: Missing required fields")
      return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("Validation failed: Password too short")
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!["landlord", "tenant"].includes(role)) {
      console.log("Validation failed: Invalid role")
      return NextResponse.json({ message: "Invalid role" }, { status: 400 })
    }

    console.log("Attempting to connect to MongoDB...")
    await connectDB()
    console.log("MongoDB connection successful")

    // Check if user already exists
    console.log("Checking for existing user with email:", email)
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 })
    }

    // Hash password
    console.log("Hashing password...")
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("Password hashed successfully")

    // Create user
    console.log("Creating new user...")
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      country: country || null,
      phone: phone || null,
      subscribeToUpdates: subscribeToUpdates || false,
    }

    console.log("User data to create:", { ...userData, password: "[HIDDEN]" })

    const user = await User.create(userData)
    console.log("User created successfully with ID:", user._id)

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: user._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error details:", error)

    // More specific error handling
    if (error.name === "ValidationError") {
      console.error("Mongoose validation error:", error.message)
      return NextResponse.json(
        {
          message: "Validation error: " + error.message,
        },
        { status: 400 },
      )
    }

    if (error.code === 11000) {
      console.error("Duplicate key error:", error)
      return NextResponse.json(
        {
          message: "User already exists with this email",
        },
        { status: 400 },
      )
    }

    if (error.name === "MongoNetworkError") {
      console.error("MongoDB network error:", error.message)
      return NextResponse.json(
        {
          message: "Database connection error",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
