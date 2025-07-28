/**
 * Script to help set up Vercel environment variables
 * Run this locally to get the commands you need to run
 */

const crypto = require("crypto")

function generateSecrets() {
  const jwtSecret = crypto.randomBytes(64).toString("hex")
  const nextAuthSecret = crypto.randomBytes(64).toString("hex")

  console.log("🔐 Generated Secure Secrets for Vercel Deployment")
  console.log("=".repeat(60))
  console.log("")
  console.log("📋 Copy and run these commands in your terminal:")
  console.log("")
  console.log("# Set MongoDB URI (replace with your actual MongoDB connection string)")
  console.log(`vercel env add MONGODB_URI`)
  console.log("# When prompted, paste your MongoDB connection string")
  console.log("")
  console.log("# Set JWT Secret")
  console.log(`vercel env add JWT_SECRET`)
  console.log(`# When prompted, paste: ${jwtSecret}`)
  console.log("")
  console.log("# Set NextAuth Secret")
  console.log(`vercel env add NEXTAUTH_SECRET`)
  console.log(`# When prompted, paste: ${nextAuthSecret}`)
  console.log("")
  console.log("# Set NextAuth URL (replace with your actual domain)")
  console.log(`vercel env add NEXTAUTH_URL`)
  console.log("# When prompted, paste: https://your-domain.vercel.app")
  console.log("")
  console.log("# Optional: Google OAuth (if you want Google sign-in)")
  console.log(`vercel env add GOOGLE_CLIENT_ID`)
  console.log(`vercel env add GOOGLE_CLIENT_SECRET`)
  console.log("")
  console.log("# Optional: Facebook OAuth (if you want Facebook sign-in)")
  console.log(`vercel env add FACEBOOK_CLIENT_ID`)
  console.log(`vercel env add FACEBOOK_CLIENT_SECRET`)
  console.log("")
  console.log("# Optional: Cloudinary (if you want image uploads)")
  console.log(`vercel env add CLOUDINARY_CLOUD_NAME`)
  console.log(`vercel env add CLOUDINARY_API_KEY`)
  console.log(`vercel env add CLOUDINARY_API_SECRET`)
  console.log("")
  console.log("# Optional: OpenAI (if you want the AI chatbot)")
  console.log(`vercel env add OPENAI_API_KEY`)
  console.log("")
  console.log("=".repeat(60))
  console.log("⚠️  IMPORTANT NOTES:")
  console.log("1. Run 'vercel login' first if you haven't already")
  console.log("2. Make sure you're in your project directory")
  console.log("3. After setting all variables, run 'vercel --prod' to redeploy")
  console.log("4. For MongoDB, you can use MongoDB Atlas (recommended)")
  console.log("5. Keep these secrets secure and never share them publicly")
  console.log("")
  console.log("🔗 MongoDB Atlas Setup:")
  console.log("1. Go to https://cloud.mongodb.com")
  console.log("2. Create a free cluster")
  console.log("3. Get your connection string")
  console.log("4. Replace <password> with your database password")
  console.log("")

  return {
    jwtSecret,
    nextAuthSecret,
  }
}

// Generate and display setup instructions
generateSecrets()
