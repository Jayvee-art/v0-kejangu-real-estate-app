import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models"
import { verifyToken } from "@/lib/auth"
import mongoose from "mongoose"

// GET user by ID or "me"
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    await connectDB()

    let targetUser
    if (params.id === "me") {
      targetUser = await User.findById(currentUser._id).select("-password") // Exclude password
    } else {
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json({ message: "Invalid user ID format" }, { status: 400 })
      }
      targetUser = await User.findById(params.id).select("-password") // Exclude password

      // Authorization check: Only admin or the user themselves can view full profile
      if (currentUser.role !== "admin" && currentUser._id.toString() !== params.id) {
        // For non-admin and non-self requests, return limited public info
        if (targetUser) {
          return NextResponse.json(
            {
              id: targetUser._id,
              name: targetUser.name,
              role: targetUser.role,
              // Potentially add other public info like listings count if applicable
            },
            { status: 200 },
          )
        } else {
          return NextResponse.json({ message: "User not found" }, { status: 404 })
        }
      }
    }

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(targetUser)
  } catch (error) {
    console.error("Error fetching user:", error)
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PUT update user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    if (currentUser.role !== "admin" && currentUser._id.toString() !== params.id) {
      return NextResponse.json({ message: "Forbidden: You can only update your own profile" }, { status: 403 })
    }

    await connectDB()

    const { name, email, role, country, phone, subscribeToUpdates, isActive } = await request.json()

    const updateData: { [key: string]: any } = {}
    if (name) updateData.name = name
    if (email) updateData.email = email // Consider adding email verification flow if email changes
    if (country) updateData.country = country
    if (phone) updateData.phone = phone
    if (typeof subscribeToUpdates === "boolean") updateData.subscribeToUpdates = subscribeToUpdates

    // Only admin can change role or isActive status
    if (currentUser.role === "admin") {
      if (role) updateData.role = role
      if (typeof isActive === "boolean") updateData.isActive = isActive
    }

    const updatedUser = await User.findByIdAndUpdate(params.id, updateData, { new: true }).select("-password")

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    if (currentUser.role !== "admin" && currentUser._id.toString() !== params.id) {
      return NextResponse.json({ message: "Forbidden: You can only delete your own profile" }, { status: 403 })
    }

    await connectDB()

    const deletedUser = await User.findByIdAndDelete(params.id)

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
