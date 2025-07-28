const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const { User, Listing, Booking, Conversation, Message } = require("../lib/models") // Adjust path as needed
const { connectDB } = require("../lib/mongodb") // Adjust path as needed

require("dotenv").config({ path: ".env.local" })

const seedDatabase = async () => {
  try {
    await connectDB()
    console.log("Database connected for seeding.")

    // Clear existing data (optional, for fresh seeding)
    console.log("Clearing existing data...")
    await User.deleteMany({})
    await Listing.deleteMany({})
    await Booking.deleteMany({})
    await Conversation.deleteMany({})
    await Message.deleteMany({})
    console.log("Existing data cleared.")

    // Create Users
    console.log("Creating test users...")
    const hashedPasswordLandlord = await bcrypt.hash("landlord123", 10)
    const hashedPasswordTenant = await bcrypt.hash("tenant123", 10)
    const hashedPasswordAdmin = await bcrypt.hash("admin123", 10)

    const landlordUser = await User.create({
      name: "Alice Landlord",
      email: "landlord@example.com",
      password: hashedPasswordLandlord,
      role: "landlord",
      country: "Kenya",
      phone: "+254712345678",
      emailVerified: true,
      isActive: true,
    })

    const tenantUser = await User.create({
      name: "Bob Tenant",
      email: "tenant@example.com",
      password: hashedPasswordTenant,
      role: "tenant",
      country: "Kenya",
      phone: "+254723456789",
      emailVerified: true,
      isActive: true,
    })

    const adminUser = await User.create({
      name: "Charlie Admin",
      email: "admin@example.com",
      password: hashedPasswordAdmin,
      role: "admin",
      emailVerified: true,
      isActive: true,
    })

    console.log("Test users created:", landlordUser.email, tenantUser.email, adminUser.email)

    // Create Listings
    console.log("Creating test listings...")
    const listing1 = await Listing.create({
      title: "Modern Apartment in Westlands",
      description: "Spacious 3-bedroom apartment with modern amenities and city views.",
      price: 75000, // KSh
      location: "Westlands, Nairobi",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1678901234/apartment1.jpg", // Placeholder
      landlord: landlordUser._id,
    })

    const listing2 = await Listing.create({
      title: "Cozy Studio in Kilimani",
      description: "Affordable and comfortable studio apartment, perfect for singles.",
      price: 30000, // KSh
      location: "Kilimani, Nairobi",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1678901235/studio1.jpg", // Placeholder
      landlord: landlordUser._id,
    })

    const listing3 = await Listing.create({
      title: "Family House in Karen",
      description: "Large 5-bedroom house with a garden, ideal for families.",
      price: 120000, // KSh
      location: "Karen, Nairobi",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1678901236/house1.jpg", // Placeholder
      landlord: landlordUser._id,
    })

    console.log("Test listings created:", listing1.title, listing2.title, listing3.title)

    // Create Bookings
    console.log("Creating test bookings...")
    const booking1 = await Booking.create({
      property: listing1._id,
      tenant: tenantUser._id,
      landlord: landlordUser._id,
      startDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Next month
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)), // Month after next
      totalPrice: listing1.price * 1, // For 1 month
      notes: "Looking forward to moving in!",
      status: "pending",
    })

    const booking2 = await Booking.create({
      property: listing2._id,
      tenant: tenantUser._id,
      landlord: landlordUser._id,
      startDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)),
      totalPrice: listing2.price * 1,
      notes: "Need a quiet place for my studies.",
      status: "confirmed",
    })

    console.log("Test bookings created:", booking1._id, booking2._id)

    // Create Conversations (optional)
    console.log("Creating test conversations...")
    const conversation1 = await Conversation.create({
      participants: [landlordUser._id, tenantUser._id],
      property: listing1._id,
    })

    const message1 = await Message.create({
      conversation: conversation1._id,
      sender: tenantUser._id,
      content: "Hi Alice, I'm interested in the Westlands apartment. Is it still available?",
      readBy: [landlordUser._id],
    })

    conversation1.lastMessage = message1._id
    await conversation1.save()

    console.log("Test conversations and messages created.")

    console.log("Seeding complete!")
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log("Database disconnected.")
  }
}

seedDatabase()
