import mongoose from "mongoose"

// Get the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var myMongoose: MongooseCache | undefined
}

const cached: MongooseCache = global.myMongoose || { conn: null, promise: null }

if (!global.myMongoose) {
  global.myMongoose = cached
}

export async function connectDB() {
  // Only check for MONGODB_URI when actually connecting, not during build
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: "kejangu", // Explicitly set database name
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Connected to MongoDB Atlas - Kejangu Database")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("MongoDB connection error:", e)
    throw e
  }

  return cached.conn
}
