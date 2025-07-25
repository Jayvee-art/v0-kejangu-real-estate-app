import mongoose from "mongoose"

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["landlord", "tenant"],
      required: true,
    },
    country: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subscribeToUpdates: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Listing Schema
const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Export models
export const User = mongoose.models.User || mongoose.model("User", userSchema)
export const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema)
