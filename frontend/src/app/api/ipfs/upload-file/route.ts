import { NextResponse, type NextRequest } from "next/server";
import { pinata, validatePinataConfig } from "@/lib/pinata";

/**
 * POST /api/ipfs/upload-file
 * Upload a file (image) to IPFS
 */
export async function POST(request: NextRequest) {
  try {
    // Validate Pinata configuration
    const configCheck = validatePinataConfig();
    if (!configCheck.isValid) {
      return NextResponse.json(
        { error: configCheck.error },
        { status: 500 }
      );
    }

    // Get file from form data
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Upload file to IPFS
    const upload = await pinata.upload.public.file(file);

    // Return CID
    return NextResponse.json(
      {
        cid: upload.cid,
        size: upload.size,
        timestamp: upload.created_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    return NextResponse.json(
      {
        error: "Failed to upload file to IPFS",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
