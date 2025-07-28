import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only" // Fallback for development

export async function POST(request: Request) {
  try {
    await connectDB()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Compare password for credentials users
    if (user.authProvider === "credentials") {
      // Ensure user.password exists before comparing
      if (!user.password) {
        return NextResponse.json({ message: "Invalid credentials: Password not set for this user" }, { status: 401 })
      }
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
      }
    } else {
      // For OAuth users, password comparison is not applicable
      return NextResponse.json({ message: `Please log in using your ${user.authProvider} account.` }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    })

    // Update last login time
    user.lastLogin = new Date()
    await user.save()

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          country: user.country,
          phone: user.phone,
          subscribeToUpdates: user.subscribeToUpdates,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
