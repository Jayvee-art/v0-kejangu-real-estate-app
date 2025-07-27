import { openai } from "@ai-sdk/openai"
import { streamText, tool } from "ai"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()
  const cookieStore = cookies()
  const supabase = createSupabaseServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id || null

  let assistantResponseContent = ""

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a helpful real estate assistant for Kejangu Real Estate. You help customers with:
    - Property inquiries and searches
    - Market information and trends
    - Buying and selling guidance
    - Rental information
    - Neighborhood details
    - Investment advice
    
    Be professional, knowledgeable, and helpful. Always encourage users to contact a real estate agent for specific property details or to schedule viewings.`,
    messages,
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
    onChunk: ({ chunk }) => {
      if (chunk.type === "text-delta") {
        assistantResponseContent += chunk.text
      }
    },
    onFinish: async () => {
      if (userId && assistantResponseContent) {
        const { error } = await supabase.from("chat_messages").insert({
          user_id: userId,
          role: "assistant",
          content: assistantResponseContent,
        })
        if (error) console.error("Error saving assistant message:", error)
      }
    },
  })

  return result.toDataStreamResponse()
}
