import { NextResponse, type NextRequest } from "next/server";
import type { ProductMetadata } from "@/types/metadata";

/**
 * GET /api/ipfs/get-metadata?hash=QmXXX
 * Fetch metadata from IPFS by hash
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hash = searchParams.get("hash");

    if (!hash) {
      return NextResponse.json(
        { error: "IPFS hash is required" },
        { status: 400 }
      );
    }

    // Get gateway URL from environment
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
    if (!gatewayUrl) {
      return NextResponse.json(
        { error: "Gateway URL not configured" },
        { status: 500 }
      );
    }

    // Fetch metadata from IPFS gateway
    const url = `https://${gatewayUrl}/ipfs/${hash}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const metadata: ProductMetadata = await response.json();

    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error("Error fetching metadata from IPFS:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch metadata from IPFS",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
