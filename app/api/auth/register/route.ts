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

    // Enhanced validation with detailed logging
    if (!name?.trim()) {
      console.log("❌ Validation failed: Name is missing or empty")
      return NextResponse.json({ message: "Name is required and cannot be empty" }, { status: 400 })
    }

    if (!email?.trim()) {
      console.log("❌ Validation failed: Email is missing or empty")
      return NextResponse.json({ message: "Email is required and cannot be empty" }, { status: 400 })
    }

    if (!password) {
      console.log("❌ Validation failed: Password is missing")
      return NextResponse.json({ message: "Password is required" }, { status: 400 })
    }

    if (!role) {
      console.log("❌ Validation failed: Role is missing")
      return NextResponse.json({ message: "Please select your role (Landlord or Tenant)" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      console.log("❌ Validation failed: Invalid email format:", email)
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("❌ Validation failed: Password too short, length:", password.length)
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 })
    }

    if (!["landlord", "tenant"].includes(role.toLowerCase())) {
      console.log("❌ Validation failed: Invalid role:", role)
      return NextResponse.json({ message: "Role must be either landlord or tenant" }, { status: 400 })
    }

    console.log("✅ All validations passed")

    // Test MongoDB connection first
    console.log("🔌 Testing MongoDB connection...")
    try {
      await connectDB()
      console.log("✅ MongoDB connection successful")
    } catch (dbError) {
      console.error("❌ MongoDB connection failed:", dbError)
      return NextResponse.json({ message: "Database connection failed. Please try again later." }, { status: 500 })
    }

    // Check if user already exists
    console.log("🔍 Checking for existing user with email:", email.toLowerCase().trim())
    try {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
      if (existingUser) {
        console.log("❌ User already exists with ID:", existingUser._id)
        return NextResponse.json(
          {
            message: "An account with this email already exists. Please try logging in instead.",
          },
          { status: 400 },
        )
      }
      console.log("✅ Email is available")
    } catch (findError) {
      console.error("❌ Error checking existing user:", findError)
      return NextResponse.json({ message: "Error checking user existence. Please try again." }, { status: 500 })
    }

    // Hash password
    console.log("🔐 Hashing password...")
    let hashedPassword
    try {
      const saltRounds = 12
      hashedPassword = await bcrypt.hash(password, saltRounds)
      console.log("✅ Password hashed successfully")
    } catch (hashError) {
      console.error("❌ Password hashing failed:", hashError)
      return NextResponse.json({ message: "Error processing password. Please try again." }, { status: 500 })
    }

    // Prepare user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role.toLowerCase(),
      country: country?.trim() || null,
      phone: phone?.trim() || null,
      subscribeToUpdates: Boolean(subscribeToUpdates),
      authProvider: "credentials",
      emailVerified: false,
      isActive: true,
    }

    console.log("👤 Creating new user with data:", {
      ...userData,
      password: "[HIDDEN]",
    })

    // Create user with detailed error handling
    let newUser
    try {
      newUser = await User.create(userData)
      console.log("✅ User created successfully with ID:", newUser._id)
    } catch (createError) {
      console.error("❌ User creation failed:", createError)

      if (createError.code === 11000) {
        return NextResponse.json({ message: "An account with this email already exists" }, { status: 400 })
      }

      if (createError.name === "ValidationError") {
        const firstError = Object.values(createError.errors)[0] as any
        return NextResponse.json({ message: firstError?.message || "Validation error occurred" }, { status: 400 })
      }

      return NextResponse.json({ message: "Failed to create user account. Please try again." }, { status: 500 })
    }

    // Return success response
    console.log("🎉 Registration completed successfully")
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully! You can now sign in.",
        userId: newUser._id,
        userRole: newUser.role,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("💥 Unexpected registration error:", error)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        message: "An unexpected error occurred. Please try again later.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
