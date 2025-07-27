import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models"

const testUsers = [
  {
    name: "Test Landlord",
    email: "landlord@test.com",
    password: "123456",
    role: "landlord",
    country: "KE",
    phone: "+254700000001",
  },
  {
    name: "Test Tenant",
    email: "tenant@test.com",
    password: "123456",
    role: "tenant",
    country: "KE",
    phone: "+254700000002",
  },
  {
    name: "John Landlord",
    email: "john.landlord@example.com",
    password: "password123",
    role: "landlord",
    country: "KE",
    phone: "+254700000003",
  },
]

export async function POST(request: NextRequest) {
  try {
    console.log("🌱 Creating test accounts...")

    // Check for required environment variables
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          success: false,
          message: "MONGODB_URI environment variable is not set. Please configure your database connection.",
          error: "Missing environment variable",
        },
        { status: 500 },
      )
    }

    await connectDB()

    const createdUsers = []
    const skippedUsers = []

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email })
        if (existingUser) {
          console.log(`⚠️ User ${userData.email} already exists`)
          skippedUsers.push(userData.email)
          continue
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12)

        // Create user
        const newUser = await User.create({
          ...userData,
          password: hashedPassword,
          authProvider: "credentials",
          emailVerified: true,
          isActive: true,
          subscribeToUpdates: false,
        })

        console.log(`✅ Created ${userData.role}: ${userData.email}`)
        createdUsers.push({
          email: userData.email,
          role: userData.role,
          id: newUser._id,
        })
      } catch (userError) {
        console.error(`❌ Failed to create ${userData.email}:`, userError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Test accounts creation completed",
      created: createdUsers,
      skipped: skippedUsers,
      testAccounts: [
        {
          type: "Landlord",
          email: "landlord@test.com",
          password: "123456",
          description: "Use this to test the landlord dashboard",
        },
        {
          type: "Tenant",
          email: "tenant@test.com",
          password: "123456",
          description: "Use this to test the tenant features",
        },
        {
          type: "Additional Landlord",
          email: "john.landlord@example.com",
          password: "password123",
          description: "Another landlord account for testing",
        },
      ],
    })
  } catch (error: any) {
    console.error("💥 Test account creation failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create test accounts",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
