const crypto = require("crypto")
const fs = require("fs")
const path = require("path")

const envPath = path.resolve(process.cwd(), ".env.local")

// Function to generate a random hex string
const generateRandomHex = (length) => crypto.randomBytes(length).toString("hex")

// Function to update or add an environment variable in .env.local
const updateEnvFile = (key, value) => {
  let envContent = ""
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8")
  }

  const lines = envContent.split("\n")
  let updated = false
  const newLines = lines.map((line) => {
    if (line.startsWith(`${key}=`)) {
      updated = true
      return `${key}=${value}`
    }
    return line
  })

  if (!updated) {
    newLines.push(`${key}=${value}`)
  }

  fs.writeFileSync(envPath, newLines.join("\n"))
  console.log(`Updated/Added ${key} in .env.local`)
}

const generateSecrets = () => {
  console.log("Generating secrets for .env.local...")

  // Generate NEXTAUTH_SECRET
  const nextAuthSecret = generateRandomHex(32)
  updateEnvFile("NEXTAUTH_SECRET", nextAuthSecret)

  // Generate JWT_SECRET
  const jwtSecret = generateRandomHex(32)
  updateEnvFile("JWT_SECRET", jwtSecret)

  console.log("Secrets generation complete. Check your .env.local file.")
}

generateSecrets()
