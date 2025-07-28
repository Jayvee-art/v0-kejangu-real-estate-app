import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { User } from "@/lib/models"
import { connectDB } from "@/lib/mongodb"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-development-only"

// Centralized token verification function
export async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    return { status: 401, message: "Authentication required: No token provided." }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }
    await connectDB()
    const user = await User.findById(decoded.userId).select("-password") // Exclude password
    if (!user) {
      return { status: 404, message: "User not found." }
    }
    return { status: 200, message: "Authorized", user: user.toObject() }
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return { status: 401, message: "Authentication failed: Token expired." }
    }
    if (error.name === "JsonWebTokenError") {
      return { status: 401, message: "Authentication failed: Invalid token." }
    }
    console.error("Token verification error:", error)
    return { status: 500, message: "Internal server error during authentication." }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        await connectDB()
        const user = await User.findOne({ email: credentials.email.toLowerCase() })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        // Return user object with necessary fields for JWT
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login", // Redirect to login page on error
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role // Cast user to any to access role
      }
      if (account && account.provider !== "credentials") {
        await connectDB()
        let existingUser = await User.findOne({
          email: token.email?.toLowerCase(),
          authProvider: account.provider,
        })

        if (!existingUser) {
          // If user doesn't exist with this provider, create them
          existingUser = await User.create({
            name: token.name,
            email: token.email?.toLowerCase(),
            authProvider: account.provider,
            authProviderId: account.providerAccountId,
            emailVerified: true, // Assume verified for OAuth
            isActive: true,
            role: "tenant", // Default role for new OAuth users
          })
        } else if (existingUser.authProvider !== account.provider) {
          // Handle case where email exists but with a different provider
          // This might require linking accounts or showing an error
          console.warn(`User with email ${token.email} already exists with provider ${existingUser.authProvider}`)
          // You might want to throw an error here or redirect to a linking page
        }

        token.id = existingUser._id.toString()
        token.role = existingUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to the dashboard after successful login
      return `${baseUrl}/dashboard`
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
