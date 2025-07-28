"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import jwt from "jsonwebtoken"
import { SessionProvider, useSession } from "next-auth/react"

interface User {
  _id: string
  name: string
  email: string
  role: "landlord" | "tenant" | "admin"
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status: sessionStatus } = useSession()

  const decodeToken = useCallback((jwtToken: string): User | null => {
    try {
      const decoded = jwt.decode(jwtToken) as { userId: string; email: string; role: string; name?: string }
      if (decoded && decoded.userId && decoded.email && decoded.role) {
        return {
          _id: decoded.userId,
          name: decoded.name || decoded.email, // Fallback to email if name is not in token
          email: decoded.email,
          role: decoded.role,
        }
      }
      return null
    } catch (error) {
      console.error("Error decoding token:", error)
      return null
    }
  }, [])

  const fetchUserProfile = useCallback(
    async (userId: string, jwtToken: string) => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        if (response.ok) {
          const userData: User = await response.json()
          setUser(userData)
        } else {
          console.error("Failed to fetch user profile:", await response.json())
          setUser(null)
          localStorage.removeItem("token")
          toast({
            title: "Session Expired",
            description: "Please log in again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Network error fetching user profile:", error)
        setUser(null)
        localStorage.removeItem("token")
        toast({
          title: "Network Error",
          description: "Could not connect to server to verify session.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const login = useCallback(
    async (jwtToken: string) => {
      localStorage.setItem("token", jwtToken)
      setToken(jwtToken)
      const decodedUser = decodeToken(jwtToken)
      if (decodedUser) {
        await fetchUserProfile(decodedUser._id, jwtToken)
        toast({
          title: "Login Successful",
          description: `Welcome back, ${decodedUser.name || decodedUser.email}!`,
        })
        // Redirect based on role
        if (decodedUser.role === "landlord") {
          router.push("/dashboard")
        } else if (decodedUser.role === "tenant") {
          router.push("/tenant-dashboard")
        } else if (decodedUser.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid token received.",
          variant: "destructive",
        })
        localStorage.removeItem("token")
        setUser(null)
        setToken(null)
      }
    },
    [decodeToken, fetchUserProfile, router, toast],
  )

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setUser(null)
    setToken(null)
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }, [router, toast])

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      const decodedUser = decodeToken(storedToken)
      if (decodedUser) {
        await fetchUserProfile(decodedUser._id, storedToken)
      } else {
        logout()
      }
    } else {
      setUser(null)
      setToken(null)
    }
  }, [decodeToken, fetchUserProfile, logout])

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true)
      const storedToken = localStorage.getItem("token")

      if (storedToken) {
        const decodedUser = decodeToken(storedToken)
        if (decodedUser) {
          setToken(storedToken)
          await fetchUserProfile(decodedUser._id, storedToken)
        } else {
          // Token is invalid or expired, clear it
          localStorage.removeItem("token")
          setUser(null)
          setToken(null)
        }
      } else if (sessionStatus === "authenticated" && session?.user?.email) {
        // If NextAuth session exists but no custom token, try to get/create user
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email, isOAuth: true }), // Indicate OAuth login
          })
          const data = await response.json()
          if (response.ok && data.token) {
            localStorage.setItem("token", data.token)
            setToken(data.token)
            const decodedUser = decodeToken(data.token)
            if (decodedUser) {
              await fetchUserProfile(decodedUser._id, data.token)
            }
          } else {
            console.error("Failed to get custom token for OAuth user:", data.message)
            // Optionally sign out NextAuth session if custom token cannot be obtained
            // signOut({ callbackUrl: "/" });
          }
        } catch (error) {
          console.error("Error during OAuth user login flow:", error)
        }
      } else {
        setUser(null)
        setToken(null)
      }
      setLoading(false)
    }

    initializeAuth()
  }, [session, sessionStatus, decodeToken, fetchUserProfile, toast])

  const value = { user, token, loading, login, logout, refreshUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Wrapper for NextAuth SessionProvider
export function AppSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
