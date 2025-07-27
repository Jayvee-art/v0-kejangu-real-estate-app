"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Home, X, LogOut } from "lucide-react"
import { signOut } from "@/app/auth/actions"
import { useChat, type Message } from "@ai-sdk/react" // Import Message from @ai-sdk/react
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

interface RealEstateChatProps {
  userId: string | null
  initialMessages?: Message[]
}

export default function RealEstateChat({ userId, initialMessages = [] }: RealEstateChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const supabase = createSupabaseBrowserClient()

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat", // Specify the API route for the chat
    initialMessages: initialMessages,
    onFinish: (message) => {
      // This callback fires when the AI response is complete
      // The assistant message is already saved on the server via onFinish in route.ts
    },
  })

  useEffect(() => {
    // This effect ensures that if initialMessages change (e.g., after login),
    // the useChat hook's internal state is updated.
    setMessages(initialMessages)
  }, [initialMessages, setMessages])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages]) // Scroll when messages change

  const toggleChat = () => setIsOpen(!isOpen)

  const handleUserSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!input.trim() || isLoading || !userId) return

    // Save user message to DB immediately
    const userMessageContent = input
    const { error } = await supabase.from("chat_messages").insert({
      user_id: userId,
      role: "user",
      content: userMessageContent,
    })
    if (error) console.error("Error saving user message:", error)

    // Then, let useChat handle the submission to the API route
    handleSubmit(event)
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <Button onClick={toggleChat} className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50" size="icon">
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-xl z-40 flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Home className="h-5 w-5" />
              Kejangu Real Estate Assistant
            </CardTitle>
            {userId && (
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="icon" title="Sign Out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            )}
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
              <div className="space-y-4 pb-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      Hi! I'm your real estate assistant. Ask me about properties, market trends, or any real estate
                      questions!
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.parts.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <div key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                                {part.text}
                              </div>
                            )
                          default:
                            return null
                        }
                      })}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-current rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-current rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <form onSubmit={handleUserSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={userId ? "Ask about properties, market trends..." : "Sign in to chat..."}
                  className="flex-1"
                  disabled={isLoading || !userId}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !userId}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
