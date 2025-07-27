import { NextResponse } from "next/server"
import { testConnection } from "@/lib/mongodb"
import { User } from "@/lib/models"

export async function GET() {
  try {
    console.log("🧪 Starting database connection test...")

    // Test basic connection
    const connectionTest = await testConnection()

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: connectionTest.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Test model operations
    console.log("📊 Testing User model operations...")
    const userCount = await User.countDocuments()
    console.log("👥 Total users in database:", userCount)

    // Test a simple query
    const sampleUsers = await User.find().limit(3).select("name email role createdAt")
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
        message: "Database test failed",
        error: error.message,
        errorType: error.name,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
