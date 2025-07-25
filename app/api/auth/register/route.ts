import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Registration attempt started")

    const body = await request.json()
    console.log("📝 Request body received:", { ...body, password: "[HIDDEN]" })

    const { name, email, password, role, country, phone, subscribeToUpdates } = body

    // Enhanced validation
    if (!name?.trim()) {
      console.log("❌ Validation failed: Name is required")
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    if (!email?.trim()) {
      console.log("❌ Validation failed: Email is required")
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    if (!password) {
      console.log("❌ Validation failed: Password is required")
      return NextResponse.json({ message: "Password is required" }, { status: 400 })
    }

    if (!role) {
      console.log("❌ Validation failed: Role is required")
      return NextResponse.json({ message: "Please select your role (Landlord or Tenant)" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Validation failed: Invalid email format")
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("❌ Validation failed: Password too short")
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 })
    }

    if (!["landlord", "tenant"].includes(role)) {
      console.log("❌ Validation failed: Invalid role")
      return NextResponse.json({ message: "Role must be either landlord or tenant" }, { status: 400 })
    }

    console.log("✅ All validations passed")

    console.log("🔌 Attempting to connect to MongoDB...")
    await connectDB()
    console.log("✅ MongoDB connection successful")

    // Check if user already exists
    console.log("🔍 Checking for existing user with email:", email)
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      console.log("❌ User already exists")
      return NextResponse.json(
        {
          message: "An account with this email already exists. Please try logging in instead.",
        },
        { status: 400 },
      )
    }

    console.log("✅ Email is available")

    // Hash password
    console.log("🔐 Hashing password...")
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log("✅ Password hashed successfully")

    // Prepare user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role.toLowerCase(),
      country: country || null,
      phone: phone?.trim() || null,
      subscribeToUpdates: Boolean(subscribeToUpdates),
      authProvider: "credentials",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("👤 Creating new user with data:", {
      ...userData,
      password: "[HIDDEN]",
      hashedPassword: "[HIDDEN]",
    })

    // Create user
    const newUser = await User.create(userData)
    console.log("✅ User created successfully with ID:", newUser._id)

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully! You can now sign in.",
        userId: newUser._id,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("💥 Registration error details:", error)

    // Handle specific MongoDB errors
    if (error.name === "ValidationError") {
      console.error("📋 Mongoose validation error:", error.message)
      const firstError = Object.values(error.errors)[0] as any
      return NextResponse.json(
        {
          message: firstError?.message || "Validation error occurred",
        },
        { status: 400 },
      )
    }

    if (error.code === 11000) {
      console.error("🔄 Duplicate key error:", error)
      const field = Object.keys(error.keyPattern || {})[0]
      return NextResponse.json(
        {
          message: `An account with this ${field} already exists`,
        },
        { status: 400 },
      )
    }

    if (error.name === "MongoNetworkError" || error.name === "MongooseServerSelectionError") {
      console.error("🌐 MongoDB connection error:", error.message)
      return NextResponse.json(
        {
          message: "Database connection error. Please try again later.",
        },
        { status: 500 },
      )
    }

    if (error.name === "CastError") {
      console.error("🎯 MongoDB cast error:", error.message)
      return NextResponse.json(
        {
          message: "Invalid data format provided",
        },
        { status: 400 },
      )
    }

    // Generic error response
    return NextResponse.json(
      {
        message: "An unexpected error occurred. Please try again later.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
