"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Home, X } from "lucide-react" // Removed: LogOut
// Removed: import { signOut } from "@/app/auth/actions"
import { useChat } from "@ai-sdk/react"
// Removed: import { createSupabaseBrowserClient } from "@/lib/supabase/client"

// Removed: interface RealEstateChatProps { userId: string | null; initialMessages?: Message[]; }
export default function RealEstateChat() {
  // Removed props
  const [isOpen, setIsOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  // Removed: const supabase = createSupabaseBrowserClient()

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat", // Specify the API route for the chat
    // Removed: initialMessages: initialMessages,
    // Removed: onFinish callback
  })

  // Removed: useEffect for initialMessages
  // useEffect(() => { setMessages(initialMessages) }, [initialMessages, setMessages])

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
    if (!input.trim() || isLoading) return // Removed: || !userId

    // Removed: Save user message to DB immediately
    // const userMessageContent = input
    // const { error } = await supabase.from("chat_messages").insert({
    //   user_id: userId,
    //   role: "user",
    //   content: userMessageContent,
    // })
    // if (error) console.error("Error saving user message:", error)

    // Let useChat handle the submission to the API route
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
            {/* Removed: Logout button */}
            {/* {userId && (
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="icon" title="Sign Out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            )} */}
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
                  placeholder={"Ask about properties, market trends..."} // Simplified placeholder
                  className="flex-1"
                  disabled={isLoading} // Removed: || !userId
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  {" "}
                  {/* Removed: || !userId */}
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
