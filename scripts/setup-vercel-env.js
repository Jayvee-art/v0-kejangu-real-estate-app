const { execSync } = require("child_process")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const envVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "NEXTAUTH_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "OPENAI_API_KEY",
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM",
]

async function setVercelEnv() {
  console.log("Setting Vercel Environment Variables...")

  for (const envVar of envVars) {
    const value = process.env[envVar]
    if (value) {
      try {
        console.log(`Setting ${envVar} for development...`)
        execSync(`vercel env add ${envVar} ${value} development`)
        console.log(`Setting ${envVar} for preview...`)
        execSync(`vercel env add ${envVar} ${value} preview`)
        console.log(`Setting ${envVar} for production...`)
        execSync(`vercel env add ${envVar} ${value} production`)
        console.log(`Successfully set ${envVar}`)
      } catch (error) {
        console.error(`Failed to set ${envVar}:`, error.message)
        console.error(
          "Please ensure you are logged into Vercel CLI (`vercel login`) and are in the correct project directory.",
        )
        return // Exit if any command fails
      }
    } else {
      console.warn(`Warning: ${envVar} is not set in your local environment. Skipping.`)
    }
  }

  console.log("\nAll specified Vercel Environment Variables have been processed.")
  console.log("Remember to manually add any sensitive variables that should not be in .env.local.")

  rl.close()
}

setVercelEnv()
