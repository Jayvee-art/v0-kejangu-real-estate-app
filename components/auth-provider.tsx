"use client"

import { SessionProvider } from "next-auth/react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "landlord" | "tenant" | "admin" // Added admin role
  _id: string // Added _id for consistency with Mongoose documents
}

interface AuthContextType {
  user: User | null
  login: (user: User, token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth data on mount
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        // Ensure _id is present, if not, map id to _id for consistency
        if (!parsedUser._id && parsedUser.id) {
          parsedUser._id = parsedUser.id
        }
        setUser(parsedUser)
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = (userData: User, token: string) => {
    localStorage.setItem("token", token)
    // Ensure _id is set before storing
    if (!userData._id && userData.id) {
      userData._id = userData.id
    }
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <SessionProvider>
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
    </SessionProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
