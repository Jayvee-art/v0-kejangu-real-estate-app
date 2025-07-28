import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Conversation, Message } from "@/lib/models"
import { verifyToken } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    const { recipientId, propertyId, initialMessage } = await request.json()

    if (!recipientId || !initialMessage) {
      return NextResponse.json({ message: "Recipient ID and initial message are required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return NextResponse.json({ message: "Invalid recipient ID format" }, { status: 400 })
    }

    if (currentUser._id.toString() === recipientId) {
      return NextResponse.json({ message: "Cannot start a conversation with yourself" }, { status: 400 })
    }

    await connectDB()

    // Check if a conversation already exists between these two users (and optionally for this property)
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUser._id, recipientId] },
      ...(propertyId && { property: propertyId }), // Add property filter if propertyId is provided
    })

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [currentUser._id, recipientId],
        property: propertyId || null,
      })
    }

    // Add the initial message
    const message = await Message.create({
      conversation: conversation._id,
      sender: currentUser._id,
      content: initialMessage,
      readBy: [currentUser._id],
    })

    conversation.lastMessage = message._id
    await conversation.save()

    // Populate for response
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate({
        path: "participants",
        select: "name email role",
      })
      .populate({
        path: "property",
        select: "title location imageUrl",
      })
      .populate({
        path: "lastMessage",
        select: "content sender createdAt",
      })

    return NextResponse.json(
      {
        message: "Conversation created/found and message sent",
        conversation: populatedConversation,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    await connectDB()

    const conversations = await Conversation.find({
      participants: currentUser._id,
    })
      .populate({
        path: "participants",
        select: "name email role",
      })
      .populate({
        path: "property",
        select: "title location imageUrl",
      })
      .populate({
        path: "lastMessage",
        select: "content sender createdAt",
      })
      .sort({ updatedAt: -1 }) // Sort by last message/update time

    // Filter out the current user from participants for display
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find((p: any) => p._id.toString() !== currentUser._id.toString())
      return {
        _id: conv._id,
        otherParticipant: otherParticipant
          ? {
              _id: otherParticipant._id,
              name: otherParticipant.name,
              email: otherParticipant.email,
              role: otherParticipant.role,
            }
          : null,
        property: conv.property,
        lastMessage: conv.lastMessage,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      }
    })

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
