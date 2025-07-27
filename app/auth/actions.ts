"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign-in error:", error.message)
    return { success: false, message: error.message }
  }

  redirect("/chat-demo") // Redirect to the chat demo page after successful login
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createSupabaseServerClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    console.error("Sign-up error:", error.message)
    return { success: false, message: error.message }
  }

  return { success: true, message: "Check your email for a confirmation link." }
}

export async function signOut() {
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/chat-demo") // Redirect to the chat demo page after logout
}

export async function getUserSession() {
  const supabase = createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}
