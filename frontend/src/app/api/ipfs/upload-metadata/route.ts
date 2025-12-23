import { NextResponse, type NextRequest } from "next/server";
import { pinata, validatePinataConfig } from "@/lib/pinata";
import type { ProductMetadata } from "@/types/metadata";

/**
 * POST /api/ipfs/upload-metadata
 * Upload product metadata JSON to IPFS
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

    // Parse request body
    const metadata: ProductMetadata = await request.json();

    // Validate required fields
    if (!metadata.name || !metadata.description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // Add metadata version and timestamp if not provided
    const enrichedMetadata: ProductMetadata = {
      ...metadata,
      version: metadata.version || "1.0",
      createdAt: metadata.createdAt || Math.floor(Date.now() / 1000),
    };

    // Upload JSON to IPFS
    const upload = await pinata.upload.public.json(enrichedMetadata);

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
    console.error("Error uploading metadata to IPFS:", error);
    return NextResponse.json(
      {
        error: "Failed to upload metadata to IPFS",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
