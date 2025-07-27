"use server"

import { createStreamableValue } from "ai/rsc"
import { generateText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export interface Message {
  id: string
  role: "user" | "assistant" | "tool"
  content: string
}

export async function continueConversation(history: Message[], userId: string | null) {
  const stream = createStreamableValue()
  const supabase = createSupabaseServerClient()

  // Save user message to DB
  if (userId && history.length > 0) {
    const lastUserMessage = history[history.length - 1]
    if (lastUserMessage.role === "user") {
      const { error } = await supabase.from("chat_messages").insert({
        user_id: userId,
        role: lastUserMessage.role,
        content: lastUserMessage.content,
      })
      if (error) console.error("Error saving user message:", error)
    }
  }
  ;(async () => {
    const { textStream, toolCalls } = generateText({
      model: openai("gpt-4o"),
      system: `You are a helpful real estate assistant for Kejangu Real Estate. You help customers with:
      - Property inquiries and searches
      - Market information and trends
      - Buying and selling guidance
      - Rental information
      - Neighborhood details
      - Investment advice
      
      Be professional, knowledgeable, and helpful. Always encourage users to contact a real estate agent for specific property details or to schedule viewings.`,
      messages: history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      tools: {
        propertySearch: tool({
          description: "Search for properties based on criteria",
          parameters: z.object({
            location: z.string().describe("The location to search for properties"),
            propertyType: z.string().describe("Type of property (house, apartment, condo, etc.)"),
            priceRange: z.string().describe("Price range for the property"),
            bedrooms: z.number().optional().describe("Number of bedrooms"),
          }),
          execute: async ({ location, propertyType, priceRange, bedrooms }) => {
            // Simulate property search results
            const properties = [
              {
                id: 1,
                address: `123 Main St, ${location}`,
                type: propertyType,
                price: priceRange,
                bedrooms: bedrooms || 3,
                bathrooms: 2,
                sqft: 1500,
              },
              {
                id: 2,
                address: `456 Oak Ave, ${location}`,
                type: propertyType,
                price: priceRange,
                bedrooms: bedrooms || 4,
                bathrooms: 3,
                sqft: 2000,
              },
            ]

            return {
              message: `Found ${properties.length} properties matching your criteria in ${location}`,
              properties,
            }
          },
        }),
        marketInfo: tool({
          description: "Get market information for a specific area",
          parameters: z.object({
            location: z.string().describe("The location to get market info for"),
          }),
          execute: async ({ location }) => {
            // Simulate market data
            return {
              location,
              averagePrice: "$450,000",
              priceChange: "+5.2% from last year",
              daysOnMarket: "28 days average",
              marketTrend: "Seller's market",
            }
          },
        }),
      },
    })

    let assistantResponseContent = ""
    for await (const text of textStream) {
      assistantResponseContent += text
      stream.update(text)
    }

    // Save assistant message to DB
    if (userId && assistantResponseContent) {
      const { error } = await supabase.from("chat_messages").insert({
        user_id: userId,
        role: "assistant",
        content: assistantResponseContent,
      })
      if (error) console.error("Error saving assistant message:", error)
    }

    stream.done()
  })()

  return {
    messages: history,
    newMessage: stream.value,
  }
}
