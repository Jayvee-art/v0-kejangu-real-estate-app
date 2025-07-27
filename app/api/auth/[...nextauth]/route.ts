import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Ensure secret is available
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is not set")
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
