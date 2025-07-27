const crypto = require("crypto")

/**
 * Generate secure secrets for production use
 * Run: node scripts/generate-secrets.js
 */
function generateSecrets() {
  const jwtSecret = crypto.randomBytes(64).toString("hex")
  const nextAuthSecret = crypto.randomBytes(64).toString("hex")

  console.log("🔐 Generated Secure Secrets:")
  console.log("=".repeat(50))
  console.log(`JWT_SECRET=${jwtSecret}`)
  console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`)
  console.log("=".repeat(50))
  console.log("⚠️  IMPORTANT: Copy these secrets to your .env.local file and Vercel environment variables")
  console.log("🔒 Keep these secrets secure and never commit them to version control")
  console.log("")
  console.log("📋 For Vercel deployment:")
  console.log("1. Go to your Vercel project dashboard")
  console.log("2. Navigate to Settings > Environment Variables")
  console.log("3. Add both JWT_SECRET and NEXTAUTH_SECRET")
  console.log("4. Redeploy your application")

  return {
    jwtSecret,
    nextAuthSecret,
  }
}

// Generate secrets
generateSecrets()
