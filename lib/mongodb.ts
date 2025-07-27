import mongoose from "mongoose"

// Get the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Use global variable to cache the connection in development
declare global {
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export async function connectDB() {
  try {
    // If we have a cached connection, return it
    if (cached.conn) {
      console.log("✅ Using cached MongoDB connection")
      return cached.conn
    }

    // If we don't have a cached promise, create one
    if (!cached.promise) {
      console.log("🔌 Creating new MongoDB connection...")

      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000, // Increased timeout
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true,
        w: "majority",
      }

      // Log connection attempt
      console.log("📡 Connecting to MongoDB with URI:", MONGODB_URI.substring(0, 20) + "...")

      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log("✅ MongoDB connected successfully")
        console.log("📊 Database name:", mongoose.connection.db?.databaseName)
        console.log("🔗 Connection state:", mongoose.connection.readyState)
        console.log("🏠 Host:", mongoose.connection.host)
        console.log("🔌 Port:", mongoose.connection.port)
        return mongoose
      })
    }

    // Wait for the connection
    cached.conn = await cached.promise
    return cached.conn
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:")
    console.error("Error name:", error.name)
    console.error("Error message:", error.message)
    console.error("Error code:", error.code)

    // Reset the cached promise so we can try again
    cached.promise = null

    // Provide specific error messages based on error type
    if (error.name === "MongooseServerSelectionError") {
      console.error("🔍 Server selection failed - check if MongoDB is running and accessible")
      throw new Error("Cannot connect to MongoDB server. Please check if the database is running and accessible.")
    }

    if (error.name === "MongoParseError") {
      console.error("🔍 MongoDB URI parsing failed - check connection string format")
      throw new Error("Invalid MongoDB connection string. Please check your MONGODB_URI environment variable.")
    }

    if (error.code === "ENOTFOUND") {
      console.error("🔍 DNS resolution failed - check hostname in connection string")
      throw new Error("Cannot resolve MongoDB hostname. Please check your connection string.")
    }

    if (error.code === "ECONNREFUSED") {
      console.error("🔍 Connection refused - check if MongoDB is running on specified port")
      throw new Error("Connection refused by MongoDB server. Please check if MongoDB is running.")
    }

    throw error
  }
}

// Connection event listeners
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected to MongoDB")
})

mongoose.connection.on("error", (err) => {
  console.error("🔴 Mongoose connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose disconnected from MongoDB")
})

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close()
    console.log("🔒 MongoDB connection closed through app termination")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error)
    process.exit(1)
  }
})

// Test connection function
export async function testConnection() {
  try {
    console.log("🧪 Testing MongoDB connection...")
    await connectDB()

    // Try a simple operation
    const admin = mongoose.connection.db?.admin()
    const result = await admin?.ping()

    console.log("✅ MongoDB ping successful:", result)
    return { success: true, message: "Connection successful" }
  } catch (error: any) {
    console.error("❌ MongoDB connection test failed:", error)
    return { success: false, message: error.message }
  }
}
