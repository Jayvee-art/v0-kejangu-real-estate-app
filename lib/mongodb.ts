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
  // Check for MONGODB_URI
  if (!MONGODB_URI) {
    console.error("MONGODB_URI environment variable is not defined")
    throw new Error("Please define the MONGODB_URI environment variable in your .env.local file")
  }

  console.log("MongoDB URI exists:", MONGODB_URI.substring(0, 20) + "...")

  if (cached.conn) {
    console.log("Using cached MongoDB connection")
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    }

    console.log("Creating new MongoDB connection...")
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ Connected to MongoDB successfully")
        console.log("Database name:", mongoose.connection.db.databaseName)
        console.log("Connection state:", mongoose.connection.readyState)
        return mongoose
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error)
        cached.promise = null
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
    console.log("MongoDB connection established")
  } catch (e) {
    cached.promise = null
    console.error("Failed to establish MongoDB connection:", e)
    throw e
  }

  return cached.conn
}

// Add connection event listeners
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB")
})

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB")
})
