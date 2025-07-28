import { NextResponse } from "next/server"
import { testConnection } from "@/lib/mongodb" // Assuming testConnection is exported from lib/mongodb

export async function GET() {
  try {
    const result = await testConnection()
    if (result.success) {
      return NextResponse.json({ status: "success", message: result.message }, { status: 200 })
    } else {
      return NextResponse.json({ status: "error", message: result.message }, { status: 500 })
    }
  } catch (error: any) {
    console.error("API test-db error:", error)
    return NextResponse.json({ status: "error", message: error.message || "Internal server error" }, { status: 500 })
  }
}
