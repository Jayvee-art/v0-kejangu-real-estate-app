import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    await connectDB()
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"

    return NextResponse.json(
      {
        status: "ok",
        database: dbStatus,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to database or other internal error.",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
