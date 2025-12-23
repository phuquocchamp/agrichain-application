import { parseAbi } from "viem";

// SupplyChain Contract ABI
export const supplyChainAbi = parseAbi([
  // View functions
  "function owner() external view returns (address)",
  "function isFarmer(address account) external view returns (bool)",
  "function isDistributor(address account) external view returns (bool)",
  "function isRetailer(address account) external view returns (bool)",
  "function isConsumer(address account) external view returns (bool)",
  "function verifiedUsers(address user) external view returns (bool)",
  "function getUserProducts(address user) external view returns (uint256[])",
  "function getTotalProductCount() external view returns (uint256)",
  "function fetchItem(uint256 productCode) external view returns ((uint256 stockUnit, uint256 productCode, address ownerID, address farmerID, uint256 productID, uint256 productDate, uint256 productPrice, uint256 productSliced, uint256 slicesRemaining, uint256 slicesSold, uint256 parentProduct, uint8 itemState, address distributorID, address retailerID, address consumerID, uint256 shippingDeadline, uint256 receivingDeadline, bool isExpired, string ipfsHash))",

  // Write functions
  "function addFarmer(address account) external",
  "function addDistributor(address account) external",
  "function addRetailer(address account) external",
  "function addConsumer(address account) external",
  "function verifyUser(address user) external",
  "function unverifyUser(address user) external",
  "function produceItemByFarmer(uint256 productCode, string ipfsHash, uint256 price, uint256 shippingDeadline) external",
  "function sellItemByFarmer(uint256 productCode, uint256 price) external",
  "function purchaseItemByDistributor(uint256 productCode) external payable",
  "function shippedItemByFarmer(uint256 productCode) external",
  "function receivedItemByDistributor(uint256 productCode) external",
  "function processedItemByDistributor(uint256 productCode, uint256 slices) external",
  "function packageItemByDistributor(uint256 productCode) external",
  "function sellItemByDistributor(uint256 productCode, uint256 price) external",
  "function sellSlicesToRetailer(uint256 productCode, uint256 slicesToSell, uint256 pricePerSlice) external returns (uint256)",
  "function purchaseItemByRetailer(uint256 productCode) external payable",
  "function shippedItemByDistributor(uint256 productCode) external",
  "function receivedItemByRetailer(uint256 productCode) external",
  "function sellItemByRetailer(uint256 productCode, uint256 price) external",
  "function purchaseItemByConsumer(uint256 productCode) external payable",

  // Events
  "event ProduceByFarmer(uint256 indexed productCode, address indexed farmer)",
  "event ForSaleByFarmer(uint256 indexed productCode, uint256 price)",
  "event PurchasedByDistributor(uint256 indexed productCode, address indexed distributor)",
  "event ShippedByFarmer(uint256 indexed productCode)",
  "event ReceivedByDistributor(uint256 indexed productCode)",
  "event ProcessedByDistributor(uint256 indexed productCode, uint256 slices)",
  "event PackageByDistributor(uint256 indexed productCode)",
  "event ForSaleByDistributor(uint256 indexed productCode, uint256 price)",
  "event PurchasedByRetailer(uint256 indexed productCode, address indexed retailer)",
  "event SlicesBatchCreated(uint256 indexed parentProduct, uint256 indexed batchProduct, uint256 slicesCount)",
  "event ShippedByDistributor(uint256 indexed productCode)",
  "event ReceivedByRetailer(uint256 indexed productCode)",
  "event ForSaleByRetailer(uint256 indexed productCode, uint256 price)",
  "event PurchasedByConsumer(uint256 indexed productCode, address indexed consumer)",
  "event UserVerified(address indexed user, bool verified)",
]);

// Escrow Contract ABI
export const escrowAbi = parseAbi([
  // View functions
  "function escrows(uint256 escrowId) external view returns (uint256 productCode, address buyer, address seller, uint256 amount, uint256 deadline, uint8 disputeStatus, address arbitrator, bool isReleased, bool isRefunded)",
  "function disputes(uint256 escrowId) external view returns (uint256 escrowId, address complainant, string reason, uint256 timestamp, uint8 resolution, bool isResolved)",
  "function arbitrators(address arbitrator) external view returns (bool)",
  "function getEscrowData(uint256 escrowId) external view returns ((uint256 productCode, address buyer, address seller, uint256 amount, uint256 deadline, uint8 disputeStatus, address arbitrator, bool isReleased, bool isRefunded))",
  "function getDisputeData(uint256 escrowId) external view returns ((uint256 escrowId, address complainant, string reason, uint256 timestamp, uint8 resolution, bool isResolved))",
  "function ARBITRATION_FEE() external view returns (uint256)",
  "function ESCROW_TIMEOUT() external view returns (uint256)",
  
  // Write functions
  "function createEscrow(uint256 productCode, address buyer, address seller, uint256 deadline) external payable returns (uint256)",
  "function releasePayment(uint256 escrowId) external",
  "function refundPayment(uint256 escrowId) external",
  "function openDispute(uint256 escrowId, string reason) external payable",
  "function resolveDispute(uint256 escrowId, uint8 resolution) external",
  "function addArbitrator(address arbitrator) external",
  "function removeArbitrator(address arbitrator) external",
  
  // Events
  "event EscrowCreated(uint256 indexed escrowId, uint256 indexed productCode, address buyer, address seller, uint256 amount)",
  "event PaymentReleased(uint256 indexed escrowId, address seller, uint256 amount)",
  "event PaymentRefunded(uint256 indexed escrowId, address buyer, uint256 amount)",
  "event DisputeOpened(uint256 indexed escrowId, address complainant, string reason)",
  "event DisputeResolved(uint256 indexed escrowId, uint8 resolution)",
]);

// Reputation Contract ABI
export const reputationAbi = parseAbi([
  "function registerUser(address user) external",
  "function addReview(address reviewee, uint256 rating, string comment) external",
  "function verifyReview(uint256 reviewId) external",
  "function recordTransactionSuccess(address user) external",
  "function recordTransactionFailure(address user) external",
  "function getUserReputation(address user) external view returns (uint256, uint256, uint256, uint256, bool)",
  "function calculateReputationLevel(address user) external view returns (string)",
  "function activeUsers(address user) external view returns (bool)",
]);

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