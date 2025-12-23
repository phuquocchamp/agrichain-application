/**
 * Product Metadata stored on IPFS
 * Follows ERC721 metadata standard with supply chain extensions
 */
export interface ProductMetadata {
  // Core ERC721 fields
  name: string;
  description: string;
  image?: string; // IPFS CID of product image

  // Supply chain specific attributes
  attributes?: {
    category?: string; // e.g., "Vegetables", "Fruits", "Grains"
    origin?: string; // e.g., "California, USA"
    certifications?: string[]; // e.g., ["USDA Organic", "Non-GMO"]
    weight?: string; // e.g., "10 kg"
    harvestDate?: string; // ISO date string
  };

  // Metadata
  createdAt: number; // Unix timestamp
  version: string; // Metadata schema version
}

/**
 * Response from IPFS upload
 */
export interface IPFSUploadResponse {
  cid: string; // Content Identifier
  url?: string; // Gateway URL (optional)
}

/**
 * IPFS metadata fetch result
 */
export interface IPFSMetadataResult {
  metadata: ProductMetadata | null;
  isLoading: boolean;
  error: Error | null;
}
