const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const envLocalPath = path.resolve(process.cwd(), ".env.local")

if (!fs.existsSync(envLocalPath)) {
  console.error("Error: .env.local file not found. Please create it with your environment variables.")
  process.exit(1)
}

const envContent = fs.readFileSync(envLocalPath, "utf8")
const lines = envContent.split("\n")

const envVars = {}
lines.forEach((line) => {
  const trimmedLine = line.trim()
  if (trimmedLine && !trimmedLine.startsWith("#")) {
    const [key, value] = trimmedLine.split("=")
    if (key && value) {
      envVars[key] = value
    }
  }
})

const projectEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "NEXTAUTH_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "FACEBOOK_CLIENT_ID",
  "FACEBOOK_CLIENT_SECRET",
  "NEXTAUTH_URL",
]

console.log("Setting Vercel environment variables...")

projectEnvVars.forEach((key) => {
  const value = envVars[key]
  if (value) {
    try {
      // Use --build-time for variables needed during build process (e.g., NEXTAUTH_SECRET)
      // Use --sensitive for variables that should not be exposed in logs
      const flags = ["--git"] // Apply to all Git branches
      if (["NEXTAUTH_SECRET", "JWT_SECRET", "CLOUDINARY_API_SECRET", "EMAIL_PASS"].includes(key)) {
        flags.push("--sensitive")
      }
      if (["NEXTAUTH_SECRET"].includes(key)) {
        flags.push("--build-time")
      }

      execSync(`vercel env add ${key} ${flags.join(" ")}`, {
        input: value,
        stdio: "inherit", // Show output from vercel command
      })
      console.log(`Successfully set ${key} on Vercel.`)
    } catch (error) {
      console.error(`Failed to set ${key} on Vercel:`, error.message)
    }
  } else {
    console.warn(`Warning: ${key} not found in .env.local. Skipping Vercel environment setup for this variable.`)
  }
})

console.log("Vercel environment variable setup complete.")
console.log("Remember to redeploy your Vercel project for changes to take effect.")
