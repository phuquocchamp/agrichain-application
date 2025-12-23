import "server-only";
import { PinataSDK } from "pinata";

/**
 * Pinata SDK instance for server-side IPFS operations
 * This should only be used in API routes and server components
 */
export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL!,
});

/**
 * Validate Pinata configuration
 */
export function validatePinataConfig(): { isValid: boolean; error?: string } {
  if (!process.env.PINATA_JWT) {
    return {
      isValid: false,
      error: "PINATA_JWT environment variable is not set",
    };
  }

  if (!process.env.NEXT_PUBLIC_GATEWAY_URL) {
    return {
      isValid: false,
      error: "NEXT_PUBLIC_GATEWAY_URL environment variable is not set",
    };
  }

  return { isValid: true };
}
