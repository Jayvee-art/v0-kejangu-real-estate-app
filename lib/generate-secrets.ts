import crypto from "crypto"

/**
 * Generate secure secrets for production use
 * Run this script to generate random secrets for your environment variables
 */
export function generateSecrets() {
  const jwtSecret = crypto.randomBytes(64).toString("hex")
  const nextAuthSecret = crypto.randomBytes(64).toString("hex")

  console.log("🔐 Generated Secure Secrets:")
  console.log("=".repeat(50))
  console.log(`JWT_SECRET=${jwtSecret}`)
  console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`)
  console.log("=".repeat(50))
  console.log("⚠️  IMPORTANT: Copy these secrets to your .env.local file and Vercel environment variables")
  console.log("🔒 Keep these secrets secure and never commit them to version control")

  return {
    jwtSecret,
    nextAuthSecret,
  }
}

// Run this function to generate secrets
if (require.main === module) {
  generateSecrets()
}
