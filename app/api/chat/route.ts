import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
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

    const { conversationId, messageContent, propertyId } = await request.json()

    await connectDB()

    let conversation
    if (conversationId) {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return NextResponse.json({ message: "Invalid conversation ID format" }, { status: 400 })
      }
      conversation = await Conversation.findById(conversationId)
      if (!conversation) {
        return NextResponse.json({ message: "Conversation not found" }, { status: 404 })
      }
      // Ensure current user is a participant
      if (!conversation.participants.includes(currentUser._id)) {
        return NextResponse.json({ message: "Forbidden: Not a participant in this conversation" }, { status: 403 })
      }
    } else {
      // Create new conversation
      if (!propertyId) {
        return NextResponse.json({ message: "Property ID is required to start a new conversation" }, { status: 400 })
      }
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return NextResponse.json({ message: "Invalid property ID format" }, { status: 400 })
      }
      // Find property to get landlord ID
      const property = await (mongoose.models.Listing || mongoose.model("Listing")).findById(propertyId)
      if (!property) {
        return NextResponse.json({ message: "Property not found" }, { status: 404 })
      }
      if (property.landlord.toString() === currentUser._id.toString()) {
        return NextResponse.json({ message: "Cannot start a conversation with yourself" }, { status: 400 })
      }

      // Check if a conversation already exists between these two users for this property
      conversation = await Conversation.findOne({
        participants: { $all: [currentUser._id, property.landlord] },
        property: propertyId,
      })

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [currentUser._id, property.landlord],
          property: propertyId,
        })
      }
    }

    // Save user message
    const userMessage = await Message.create({
      conversation: conversation._id,
      sender: currentUser._id,
      content: messageContent,
      readBy: [currentUser._id],
    })

    conversation.lastMessage = userMessage._id
    await conversation.save()

    // Simulate AI response (replace with actual AI model integration)
    const { text: aiResponseContent } = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are a helpful real estate assistant. Respond to the following message from a user. The user is ${currentUser.name} (role: ${currentUser.role}). The conversation is about property: ${propertyId}. User message: "${messageContent}"`,
    })

    const aiMessage = await Message.create({
      conversation: conversation._id,
      sender: new mongoose.Types.ObjectId(), // Placeholder for AI user ID
      content: aiResponseContent,
      readBy: [currentUser._id], // Assume user reads AI response
    })

    conversation.lastMessage = aiMessage._id
    await conversation.save()

    return NextResponse.json(
      {
        message: "Message sent and AI responded",
        userMessage,
        aiMessage,
        conversationId: conversation._id,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error sending message or getting AI response:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
