import { useState, useCallback, useEffect } from "react";
import type {
  ProductMetadata,
  IPFSUploadResponse,
  IPFSMetadataResult,
} from "@/types/metadata";

/**
 * Custom hook for IPFS operations using Pinata
 */
export function useIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);

  /**
   * Upload product metadata JSON to IPFS
   */
  const uploadMetadata = useCallback(
    async (metadata: ProductMetadata): Promise<string> => {
      setIsUploading(true);
      setUploadError(null);

      try {
        const response = await fetch("/api/ipfs/upload-metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadata),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to upload metadata");
        }

        const data: IPFSUploadResponse = await response.json();
        return data.cid;
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Unknown error");
        setUploadError(err);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  /**
   * Upload a file (image) to IPFS
   */
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/ipfs/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload file");
      }

      const data: IPFSUploadResponse = await response.json();
      return data.cid;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      setUploadError(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Fetch metadata from IPFS by hash
   */
  const getMetadata = useCallback(
    async (ipfsHash: string): Promise<ProductMetadata | null> => {
      try {
        const response = await fetch(
          `/api/ipfs/get-metadata?hash=${ipfsHash}`
        );

        if (!response.ok) {
          console.error("Failed to fetch metadata from IPFS");
          return null;
        }

        const metadata: ProductMetadata = await response.json();
        return metadata;
      } catch (error) {
        console.error("Error fetching metadata:", error);
        return null;
      }
    },
    []
  );

  return {
    uploadMetadata,
    uploadFile,
    getMetadata,
    isUploading,
    uploadError,
  };
}

/**
 * Hook to fetch and cache product metadata
 */
export function useProductMetadata(
  ipfsHash: string | null | undefined
): IPFSMetadataResult {
  const [metadata, setMetadata] = useState<ProductMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { getMetadata } = useIPFS();

  const fetchMetadata = useCallback(async () => {
    if (!ipfsHash) {
      setMetadata(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMetadata(ipfsHash);
      setMetadata(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  }, [ipfsHash]);

  // Fetch metadata when ipfsHash changes
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return { metadata, isLoading, error };
}
