import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models"

export async function GET() {
  try {
    // Test database connection
    await connectDB()
    // Test a simple query to ensure the database is responsive
    await User.findOne({})

    return NextResponse.json({ status: "ok", database: "connected" }, { status: 200 })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json({ status: "error", database: "disconnected", message: error.message }, { status: 500 })
  }
}
