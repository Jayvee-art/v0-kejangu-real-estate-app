import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models"

export async function GET() {
  try {
    console.log("🧪 Starting database connection test...")

    // Check for required environment variables first
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          success: false,
          message: "MONGODB_URI environment variable is not set",
          error: "Missing environment variable",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Connect to the database
    await connectDB()

    // Test model operations
    console.log("📊 Testing User model operations...")
    const userCount = await User.countDocuments()
    console.log("👥 Total users in database:", userCount)

    // Test a simple query
    const sampleUsers = await User.find({}).limit(5).select("name email role createdAt")
    console.log("📋 Sample users:", sampleUsers)

    return NextResponse.json({
      success: true,
      message: "Database connection and operations successful",
      data: {
        connectionStatus: "Connected",
        databaseName: process.env.MONGODB_URI?.includes("mongodb://") ? "Local MongoDB" : "MongoDB Atlas",
        userCount,
        sampleUsers: sampleUsers.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        })),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Database test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Database connection or query failed",
        error: error.message,
        errorType: error.name,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
