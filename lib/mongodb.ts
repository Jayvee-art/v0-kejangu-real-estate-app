import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log("MongoDB connected successfully.")
        return mongoose
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error)
        throw error
      })
  }
  cached.conn = await cached.promise
  return cached.conn
}

export async function testConnection() {
  try {
    await connectDB()
    return { success: true, message: "Successfully connected to MongoDB!" }
  } catch (error: any) {
    console.error("MongoDB connection test failed:", error)
    return { success: false, message: `Failed to connect to MongoDB: ${error.message}` }
  }
}
