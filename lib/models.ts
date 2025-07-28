import mongoose, { Schema, models } from "mongoose"

// User Schema
const UserSchema = new Schema(
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
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function (this: any) {
        return this.authProvider === "credentials"
      }, // Required only for credentials login
    },
    role: {
      type: String,
      enum: ["landlord", "tenant", "admin"],
      default: "tenant",
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
    authProvider: {
      type: String,
      enum: ["credentials", "google", "facebook"],
      default: "credentials",
    },
    authProviderId: {
      type: String, // Stores ID from OAuth providers
      sparse: true, // Allows nulls, but unique if not null
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
)

// Listing Schema
const ListingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
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
      type: String, // URL to Cloudinary image
      trim: true,
    },
    landlord: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Booking Schema
const BookingSchema = new Schema(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlord: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Message Schema
const MessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Conversation Schema
const ConversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    property: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: false, // Conversations can be general or property-specific
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  },
)

export const User = models.User || mongoose.model("User", UserSchema)
export const Listing = models.Listing || mongoose.model("Listing", ListingSchema)
export const Booking = models.Booking || mongoose.model("Booking", BookingSchema)
export const Message = models.Message || mongoose.model("Message", MessageSchema)
export const Conversation = models.Conversation || mongoose.model("Conversation", ConversationSchema)
