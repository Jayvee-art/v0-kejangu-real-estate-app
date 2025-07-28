import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { verifyToken } from "@/lib/auth"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const authResult = await verifyToken(request)
    if (authResult.status !== 200) {
      return NextResponse.json({ message: authResult.message }, { status: authResult.status })
    }
    const currentUser = authResult.user

    // Only landlords and admins can upload images
    if (currentUser.role !== "landlord" && currentUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: Only landlords and admins can upload images" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    // Convert file to a buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "kejangu_properties", // Optional: specify a folder in Cloudinary
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error)
              return reject(error)
            }
            resolve(result)
          },
        )
        .end(buffer)
    })

    const imageUrl = (uploadResult as any).secure_url

    return NextResponse.json({ imageUrl }, { status: 200 })
  } catch (error) {
    console.error("API upload error:", error)
    return NextResponse.json({ message: "Image upload failed" }, { status: 500 })
  }
}
