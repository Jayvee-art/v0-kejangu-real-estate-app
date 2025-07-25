const bcrypt = require("bcryptjs")

// Test user data
const testUsers = [
  {
    name: "Test Landlord",
    email: "landlord@test.com",
    password: "123456",
    role: "landlord",
    country: "KE",
    phone: "+254700000001",
    subscribeToUpdates: false,
    authProvider: "credentials",
    emailVerified: true,
    isActive: true,
  },
  {
    name: "Test Tenant",
    email: "tenant@test.com",
    password: "123456",
    role: "tenant",
    country: "KE",
    phone: "+254700000002",
    subscribeToUpdates: false,
    authProvider: "credentials",
    emailVerified: true,
    isActive: true,
  },
  {
    name: "John Landlord",
    email: "john.landlord@example.com",
    password: "password123",
    role: "landlord",
    country: "KE",
    phone: "+254700000003",
    subscribeToUpdates: true,
    authProvider: "credentials",
    emailVerified: true,
    isActive: true,
  },
]

async function seedTestUsers() {
  try {
    console.log("🌱 Starting to seed test users...")

    // Import required modules (dynamic import for ES modules)
    const { connectDB } = await import("../lib/mongodb.js")
    const { User } = await import("../lib/models.js")

    // Connect to database
    console.log("🔌 Connecting to MongoDB...")
    await connectDB()
    console.log("✅ Connected to MongoDB")

    // Create test users
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email })
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`)
          continue
        }

        // Hash password
        console.log(`🔐 Hashing password for ${userData.email}...`)
        const hashedPassword = await bcrypt.hash(userData.password, 12)

        // Create user
        const newUser = await User.create({
          ...userData,
          password: hashedPassword,
        })

        console.log(`✅ Created ${userData.role}: ${userData.email} (ID: ${newUser._id})`)
      } catch (userError) {
        console.error(`❌ Failed to create user ${userData.email}:`, userError.message)
      }
    }

    console.log("🎉 Test user seeding completed!")
    console.log("\n📋 Test Accounts Created:")
    console.log("Landlord Account:")
    console.log("  Email: landlord@test.com")
    console.log("  Password: 123456")
    console.log("\nTenant Account:")
    console.log("  Email: tenant@test.com")
    console.log("  Password: 123456")
    console.log("\nAdditional Landlord:")
    console.log("  Email: john.landlord@example.com")
    console.log("  Password: password123")
  } catch (error) {
    console.error("💥 Seeding failed:", error)
  }
}

// Run the seeding function
seedTestUsers()
