// Re-export generated ABIs, addresses, and configs from wagmi codegen
export {
  supplyChainAbi,
  supplyChainAddress,
  supplyChainConfig,
  escrowAbi,
  escrowAddress,
  escrowConfig,
  reputationAbi,
  reputationAddress,
  reputationConfig,
} from "@/lib/generated";

// Note: generated.ts doesn't include TypeScript type definitions or helper constants
// so we define them here to provide better DX for the frontend

// Types
export type Product = {
  stockUnit: bigint;
  productCode: bigint;
  ownerID: `0x${string}`;
  farmerID: `0x${string}`;
  productID: bigint;
  productDate: bigint;
  productPrice: bigint;
  productSliced: bigint;
  slicesRemaining: bigint;
  slicesSold: bigint;
  parentProduct: bigint;
  itemState: number;
  distributorID: `0x${string}`;
  retailerID: `0x${string}`;
  consumerID: `0x${string}`;
  shippingDeadline: bigint;
  receivingDeadline: bigint;
  isExpired: boolean;
  ipfsHash: string;
};

export type EscrowData = {
  productCode: bigint;
  buyer: `0x${string}`;
  seller: `0x${string}`;
  amount: bigint;
  deadline: bigint;
  disputeStatus: number;
  arbitrator: `0x${string}`;
  isReleased: boolean;
  isRefunded: boolean;
};

export type Dispute = {
  escrowId: bigint;
  complainant: `0x${string}`;
  reason: string;
  timestamp: bigint;
  resolution: number;
  isResolved: boolean;
};

export type ReputationData = {
  score: bigint;
  totalReviews: bigint;
  successfulTransactions: bigint;
  failedTransactions: bigint;
  isActive: boolean;
};

// Escrow enums
export const DISPUTE_STATUS = {
  NONE: 0,
  OPEN: 1,
  RESOLVED: 2,
  REJECTED: 3,
} as const;

export const RESOLUTION = {
  SELLER: 0,
  BUYER: 1,
  SPLIT: 2,
} as const;

export const DISPUTE_STATUS_LABELS = [
  "No Dispute",
  "Dispute Open",
  "Dispute Resolved",
  "Dispute Rejected",
] as const;

export const RESOLUTION_LABELS = [
  "Favor Seller",
  "Favor Buyer",
  "Split 50/50",
] as const;

// User roles
export const USER_ROLES = {
  FARMER: "Farmer",
  DISTRIBUTOR: "Distributor",
  RETAILER: "Retailer",
  CONSUMER: "Consumer",
  OWNER: "Owner",
  NONE: "No Role",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Product states
export const PRODUCT_STATES = [
  "Produced by Farmer",
  "For Sale by Farmer",
  "Purchased by Distributor",
  "Shipped by Farmer",
  "Received by Distributor",
  "Processed by Distributor",
  "Packaged by Distributor",
  "For Sale by Distributor",
  "Purchased by Retailer",
  "Shipped by Distributor",
  "Received by Retailer",
  "For Sale by Retailer",
  "Purchased by Consumer",
] as const;

export type ProductState = (typeof PRODUCT_STATES)[number];

// Product struct type