import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, country, phone, subscribeToUpdates } = await request.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!["landlord", "tenant"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      country: country || null,
      phone: phone || null,
      subscribeToUpdates: subscribeToUpdates || false,
    })

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
