import crypto from "crypto"
import fs from "fs"
import path from "path"

export function generateRandomHex(length: number): string {
  return crypto.randomBytes(length).toString("hex")
}

export function generateNextAuthSecret(): string {
  return generateRandomHex(32)
}

export function generateJwtSecret(): string {
  return generateRandomHex(32)
}

export const generateSecret = () => generateRandomHex(64)

export const updateEnvFile = (key: string, value: string, envFilePath: string) => {
  let envContent = ""
  try {
    envContent = fs.readFileSync(envFilePath, "utf8")
  } catch (error) {
    console.warn(`Warning: ${envFilePath} not found, creating a new one.`)
  }

  const regex = new RegExp(`^${key}=.*`, "m")
  if (envContent.match(regex)) {
    envContent = envContent.replace(regex, `${key}=${value}`)
  } else {
    envContent += `\n${key}=${value}`
  }

  fs.writeFileSync(envFilePath, envContent.trim() + "\n")
  console.log(`Updated ${key} in ${envFilePath}`)
}

export const generateAndSetSecrets = () => {
  const envLocalPath = path.resolve(process.cwd(), ".env.local")

  const jwtSecret = generateJwtSecret()
  const nextAuthSecret = generateNextAuthSecret()

  updateEnvFile("JWT_SECRET", jwtSecret, envLocalPath)
  updateEnvFile("NEXTAUTH_SECRET", nextAuthSecret, envLocalPath)

  console.log("Generated and updated JWT_SECRET and NEXTAUTH_SECRET in .env.local")
}
