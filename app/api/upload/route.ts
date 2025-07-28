import { NextResponse, type NextRequest } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { IncomingForm } from "formidable"
import { promises as fs } from "fs"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper function to parse multipart form data
async function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: "./tmp", // Temporary directory for uploads
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    })

    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ message: "Cloudinary credentials are not set" }, { status: 500 })
    }

    const { files } = await parseForm(request)

    const imageFile = files.image?.[0] // Access the first file if multiple are uploaded

    if (!imageFile) {
      return NextResponse.json({ message: "No image file provided" }, { status: 400 })
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageFile.filepath, {
      folder: "kejangu-properties", // Optional: organize uploads in a specific folder
    })

    // Clean up the temporary file
    await fs.unlink(imageFile.filepath)

    return NextResponse.json({ imageUrl: result.secure_url }, { status: 200 })
  } catch (error: any) {
    console.error("Cloudinary upload error:", error)
    return NextResponse.json({ message: "Image upload failed", error: error.message }, { status: 500 })
  }
}
