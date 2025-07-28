import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Conversation, User } from "@/lib/models"
import { verifyToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  await connectToDatabase()
  const authResult = await verifyToken(req)

  if (authResult.status !== 200) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status })
  }

  const currentUser = authResult.user

  try {
    const conversations = await Conversation.find({
      participants: currentUser._id,
    })
      .populate({
        path: "participants",
        select: "name email role",
      })
      .populate({
        path: "lastMessage",
        select: "content createdAt sender",
        populate: {
          path: "sender",
          select: "name",
        },
      })
      .populate({
        path: "property",
        select: "title imageUrl",
      })
      .sort({ updatedAt: -1 }) // Sort by most recent activity

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
        lastMessage: conv.lastMessage
          ? {
              content: conv.lastMessage.content,
              createdAt: conv.lastMessage.createdAt,
              senderName: conv.lastMessage.sender?.name,
            }
          : null,
        property: conv.property
          ? {
              _id: conv.property._id,
              title: conv.property.title,
              imageUrl: conv.property.imageUrl,
            }
          : null,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      }
    })

    return NextResponse.json(formattedConversations, { status: 200 })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase()
  const authResult = await verifyToken(req)

  if (authResult.status !== 200) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status })
  }

  const currentUser = authResult.user
  const { recipientId, propertyId } = await req.json()

  if (!recipientId) {
    return NextResponse.json({ message: "Recipient ID is required" }, { status: 400 })
  }

  if (currentUser._id.toString() === recipientId) {
    return NextResponse.json({ message: "Cannot start a conversation with yourself" }, { status: 400 })
  }

  try {
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return NextResponse.json({ message: "Recipient not found" }, { status: 404 })
    }

    // Check if a conversation already exists between these two participants, optionally for a specific property
    let existingConversation
    if (propertyId) {
      existingConversation = await Conversation.findOne({
        participants: { $all: [currentUser._id, recipientId] },
        property: propertyId,
      })
    } else {
      existingConversation = await Conversation.findOne({
        participants: { $all: [currentUser._id, recipientId] },
        property: { $exists: false }, // For general conversations not tied to a property
      })
    }

    if (existingConversation) {
      return NextResponse.json(
        { message: "Conversation already exists", conversationId: existingConversation._id },
        { status: 200 },
      )
    }

    const newConversation = new Conversation({
      participants: [currentUser._id, recipientId],
      property: propertyId || null,
    })
    await newConversation.save()

    return NextResponse.json(
      { message: "Conversation created successfully", conversationId: newConversation._id },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
