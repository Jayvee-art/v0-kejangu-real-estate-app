import crypto from "crypto"

export function generateSecret(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

// Example usage (can be run as a script)
if (require.main === module) {
  console.log("Generated JWT_SECRET:", generateSecret(32))
  console.log("Generated NEXTAUTH_SECRET:", generateSecret(32))
}
