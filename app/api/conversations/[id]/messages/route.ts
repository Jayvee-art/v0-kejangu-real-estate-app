import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Conversation, Message } from "@/lib/models"
import { verifyToken } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase()
  const authResult = await verifyToken(req)

  if (authResult.status !== 200) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status })
  }

  const currentUser = authResult.user
  const conversationId = params.id

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json({ message: "Invalid conversation ID" }, { status: 400 })
  }

  try {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return NextResponse.json({ message: "Conversation not found" }, { status: 404 })
    }

    // Ensure the current user is a participant in this conversation
    if (!conversation.participants.includes(currentUser._id)) {
      return NextResponse.json({ message: "Unauthorized access to conversation" }, { status: 403 })
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate({
        path: "sender",
        select: "name email",
      })
      .sort({ createdAt: 1 }) // Sort by oldest first

    // Mark messages as read by the current user
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: currentUser._id }, readBy: { $ne: currentUser._id } },
      { $addToSet: { readBy: currentUser._id } },
    )

    return NextResponse.json(messages, { status: 200 })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase()
  const authResult = await verifyToken(req)

  if (authResult.status !== 200) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status })
  }

  const currentUser = authResult.user
  const conversationId = params.id
  const { content } = await req.json()

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json({ message: "Invalid conversation ID" }, { status: 400 })
  }

  if (!content || content.trim() === "") {
    return NextResponse.json({ message: "Message content cannot be empty" }, { status: 400 })
  }

  try {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return NextResponse.json({ message: "Conversation not found" }, { status: 404 })
    }

    // Ensure the current user is a participant in this conversation
    if (!conversation.participants.includes(currentUser._id)) {
      return NextResponse.json({ message: "Unauthorized to send message to this conversation" }, { status: 403 })
    }

    const newMessage = new Message({
      conversation: conversationId,
      sender: currentUser._id,
      content,
      readBy: [currentUser._id], // Sender automatically reads their own message
    })
    await newMessage.save()

    // Update the lastMessage in the conversation
    conversation.lastMessage = newMessage._id
    await conversation.save()

    // Populate sender for the response
    await newMessage.populate("sender", "name email")

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
