import mongoose from "mongoose"

// Enhanced User Schema with OAuth support
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      index: true, // Add index for search
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
      index: true, // Add index for faster lookups
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "credentials"
      },
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["landlord", "tenant"],
        message: "Role must be either landlord or tenant",
      },
      required: [true, "Role is required"],
      default: "tenant",
      index: true, // Add index for role-based queries
    },
    country: {
      type: String,
      trim: true,
      maxlength: [2, "Country code must be 2 characters"],
      uppercase: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },
    subscribeToUpdates: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ["credentials", "google", "facebook"],
      default: "credentials",
      index: true,
    },
    authProviderId: {
      type: String,
      sparse: true, // Allow null values but create index for non-null
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    // Add collection-level options
    collection: "users",
  },
)

// Add compound index for OAuth users
userSchema.index({ email: 1, authProvider: 1 })
userSchema.index({ authProvider: 1, authProviderId: 1 })
userSchema.index({ role: 1, isActive: 1 })
userSchema.index({ createdAt: -1 }) // For sorting by creation date

// Pre-save middleware for additional validation
userSchema.pre("save", function (next) {
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase().trim()
  }

  // Ensure country code is uppercase
  if (this.country) {
    this.country = this.country.toUpperCase().trim()
  }

  next()
})

// Listing Schema
const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
      index: true, // For search functionality
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [10000000, "Price cannot exceed 10,000,000"],
      index: true, // For price-based queries
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      minlength: [2, "Location must be at least 2 characters"],
      maxlength: [100, "Location cannot exceed 100 characters"],
      index: true, // For location-based search
    },
    imageUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: "Image URL must be a valid HTTP/HTTPS URL",
      },
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Landlord is required"],
      index: true, // For landlord-specific queries
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "listings",
  },
)

// Add indexes for better performance
listingSchema.index({ landlord: 1, isActive: 1 })
listingSchema.index({ location: 1, price: 1 })
listingSchema.index({ price: 1, isActive: 1 })
listingSchema.index({ createdAt: -1, isActive: 1 })
listingSchema.index({ featured: 1, isActive: 1 })

// Text index for search functionality
listingSchema.index({
  title: "text",
  description: "text",
  location: "text",
})

// Pre-save middleware for listings
listingSchema.pre("save", function (next) {
  // Ensure location is properly formatted
  if (this.location) {
    this.location = this.location.trim()
  }

  next()
})

// Export models with error handling
let User: mongoose.Model<any>
let Listing: mongoose.Model<any>

try {
  User = mongoose.models.User || mongoose.model("User", userSchema)
  Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema)
} catch (error) {
  console.error("❌ Error creating models:", error)
  throw error
}

export { User, Listing }

// Export schema for testing
export { userSchema, listingSchema }
