import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextResponse } from "next/server"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Ensure OPENAI_API_KEY is set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ message: "OPENAI_API_KEY is not set" }, { status: 500 })
    }

    const { messages } = await req.json()

    const result = streamText({
      model: openai("gpt-4o"), // Using GPT-4o as a powerful general-purpose model [^2][^6]
      messages,
      system:
        "You are a helpful and friendly real estate assistant for Kejangu. Your goal is to assist users with property-related queries, provide information about listings, and guide them through the Kejangu platform. Keep your responses concise and relevant to real estate.",
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
