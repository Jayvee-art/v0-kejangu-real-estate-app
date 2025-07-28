import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models"
import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

// Generate a fallback secret for development
const generateFallbackSecret = () => {
  if (typeof window === "undefined") {
    // Server-side only
    const crypto = require("crypto")
    return crypto.randomBytes(32).toString("hex")
  }
  return "fallback-secret-for-development-only"
}

const secret = process.env.NEXTAUTH_SECRET || generateFallbackSecret()
const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only"

interface DecodedToken {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

export async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { status: 401, message: "Unauthorized: No token provided or invalid format" }
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    await connectDB() // Ensure DB connection for user lookup
    const user = await User.findById(decoded.userId).select("-password") // Fetch user to ensure they exist and get full details

    if (!user) {
      return { status: 404, message: "Unauthorized: User not found" }
    }

    // Return the full user object from DB, not just decoded token
    return { status: 200, user: user.toObject() }
  } catch (error) {
    console.error("Token verification error:", error)
    if (error instanceof jwt.JsonWebTokenError) {
      return { status: 401, message: "Unauthorized: Invalid or expired token" }
    }
    return { status: 500, message: "Internal server error during token verification" }
  }
}

export const authOptions: NextAuthOptions = {
  secret,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectDB()
          const user = await User.findOne({ email: credentials.email.toLowerCase() })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          await connectDB()

          const existingUser = await User.findOne({ email: user.email?.toLowerCase() })

          if (!existingUser) {
            // Create new user for OAuth
            await User.create({
              name: user.name,
              email: user.email?.toLowerCase(),
              role: "tenant", // Default role for OAuth users
              authProvider: account.provider,
              authProviderId: account.providerAccountId,
            })
          }

          return true
        } catch (error) {
          console.error("OAuth sign in error:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
}
