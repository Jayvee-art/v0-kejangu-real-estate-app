import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Conversation, Message } from "@/lib/models"
import { verifyToken } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    const conversationId = params.id

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json({ message: "Invalid conversation ID format" }, { status: 400 })
    }

    await connectDB()

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return NextResponse.json({ message: "Conversation not found" }, { status: 404 })
    }

    // Ensure current user is a participant
    if (!conversation.participants.includes(currentUser._id)) {
      return NextResponse.json({ message: "Forbidden: Not a participant in this conversation" }, { status: 403 })
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 }) // Oldest first

    // Mark messages as read by the current user
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: currentUser._id }, readBy: { $ne: currentUser._id } },
      { $addToSet: { readBy: currentUser._id } },
    )

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    const conversationId = params.id
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ message: "Message content is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json({ message: "Invalid conversation ID format" }, { status: 400 })
    }

    await connectDB()

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return NextResponse.json({ message: "Conversation not found" }, { status: 404 })
    }

    // Ensure current user is a participant
    if (!conversation.participants.includes(currentUser._id)) {
      return NextResponse.json({ message: "Forbidden: Not a participant in this conversation" }, { status: 403 })
    }

    const newMessage = new Message({
      conversation: conversationId,
      sender: currentUser._id,
      content,
    })
    await newMessage.save()

    // Update lastMessage in conversation
    conversation.lastMessage = newMessage._id
    await conversation.save()

    // Populate sender for response
    await newMessage.populate("sender", "name email")

    return NextResponse.json({ message: "Message sent", message: newMessage }, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
