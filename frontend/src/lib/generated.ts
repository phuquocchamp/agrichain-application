//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Escrow
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const escrowAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'escrowId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'complainant', internalType: 'address', type: 'address', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'DisputeOpened',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'escrowId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'resolution', internalType: 'enum Escrow.Resolution', type: 'uint8', indexed: false },
    ],
    name: 'DisputeResolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'escrowId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'buyer', internalType: 'address', type: 'address', indexed: false },
      { name: 'seller', internalType: 'address', type: 'address', indexed: false },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'EscrowCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: false }],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'escrowId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'buyer', internalType: 'address', type: 'address', indexed: false },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'PaymentRefunded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'escrowId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'seller', internalType: 'address', type: 'address', indexed: false },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'PaymentReleased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: false }],
    name: 'Unpaused',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ARBITRATION_FEE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ESCROW_TIMEOUT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arbitrator', internalType: 'address', type: 'address' }],
    name: 'addArbitrator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'arbitrators',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'productCode', internalType: 'uint256', type: 'uint256' },
      { name: 'buyer', internalType: 'address', type: 'address' },
      { name: 'seller', internalType: 'address', type: 'address' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createEscrow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'disputes',
    outputs: [
      { name: 'escrowId', internalType: 'uint256', type: 'uint256' },
      { name: 'complainant', internalType: 'address', type: 'address' },
      { name: 'reason', internalType: 'string', type: 'string' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'resolution', internalType: 'enum Escrow.Resolution', type: 'uint8' },
      { name: 'isResolved', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'escrows',
    outputs: [
      { name: 'productCode', internalType: 'uint256', type: 'uint256' },
      { name: 'buyer', internalType: 'address', type: 'address' },
      { name: 'seller', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'disputeStatus', internalType: 'enum Escrow.DisputeStatus', type: 'uint8' },
      { name: 'arbitrator', internalType: 'address', type: 'address' },
      { name: 'isReleased', internalType: 'bool', type: 'bool' },
      { name: 'isRefunded', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'escrowId', internalType: 'uint256', type: 'uint256' }],
    name: 'getDisputeData',
    outputs: [
      {
        name: '',
        internalType: 'struct Escrow.Dispute',
        type: 'tuple',
        components: [
          { name: 'escrowId', internalType: 'uint256', type: 'uint256' },
          { name: 'complainant', internalType: 'address', type: 'address' },
          { name: 'reason', internalType: 'string', type: 'string' },
          { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
          { name: 'resolution', internalType: 'enum Escrow.Resolution', type: 'uint8' },
          { name: 'isResolved', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'escrowId', internalType: 'uint256', type: 'uint256' }],
    name: 'getEscrowData',
    outputs: [
      {
        name: '',
        internalType: 'struct Escrow.EscrowData',
        type: 'tuple',
        components: [
          { name: 'productCode', internalType: 'uint256', type: 'uint256' },
          { name: 'buyer', internalType: 'address', type: 'address' },
          { name: 'seller', internalType: 'address', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'disputeStatus', internalType: 'enum Escrow.DisputeStatus', type: 'uint8' },
          { name: 'arbitrator', internalType: 'address', type: 'address' },
          { name: 'isReleased', internalType: 'bool', type: 'bool' },
          { name: 'isRefunded', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'escrowId', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'openDispute',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  { type: 'function', inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'escrowId', internalType: 'uint256', type: 'uint256' }],
    name: 'refundPayment',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'escrowId', internalType: 'uint256', type: 'uint256' }],
    name: 'releasePayment',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'arbitrator', internalType: 'address', type: 'address' }],
    name: 'removeArbitrator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'escrowId', internalType: 'uint256', type: 'uint256' },
      { name: 'resolution', internalType: 'enum Escrow.Resolution', type: 'uint8' },
    ],
    name: 'resolveDispute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'function', inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable' },
] as const;

/**
 *
 */
export const escrowAddress = {
  1337: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
} as const;

/**
 *
 */
export const escrowConfig = { address: escrowAddress, abi: escrowAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Reputation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const reputationAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      { name: 'newScore', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'totalTransactions', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ReputationUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'reviewId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'reviewer', internalType: 'address', type: 'address', indexed: false },
      { name: 'reviewee', internalType: 'address', type: 'address', indexed: false },
      { name: 'rating', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ReviewAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'reviewId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'verified', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ReviewVerified',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_RATING',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_SCORE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_RATING',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_SCORE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'reviewee', internalType: 'address', type: 'address' },
      { name: 'rating', internalType: 'uint256', type: 'uint256' },
      { name: 'comment', internalType: 'string', type: 'string' },
    ],
    name: 'addReview',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'authorizedCallers',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'calculateReputationLevel',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'deactivateUser',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'reviewId', internalType: 'uint256', type: 'uint256' }],
    name: 'getReview',
    outputs: [
      {
        name: '',
        internalType: 'struct Reputation.Review',
        type: 'tuple',
        components: [
          { name: 'reviewId', internalType: 'uint256', type: 'uint256' },
          { name: 'reviewer', internalType: 'address', type: 'address' },
          { name: 'reviewee', internalType: 'address', type: 'address' },
          { name: 'rating', internalType: 'uint256', type: 'uint256' },
          { name: 'comment', internalType: 'string', type: 'string' },
          { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
          { name: 'isVerified', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserReputation',
    outputs: [
      {
        name: '',
        internalType: 'struct Reputation.ReputationData',
        type: 'tuple',
        components: [
          { name: 'score', internalType: 'uint256', type: 'uint256' },
          { name: 'totalTransactions', internalType: 'uint256', type: 'uint256' },
          { name: 'successfulTransactions', internalType: 'uint256', type: 'uint256' },
          { name: 'failedTransactions', internalType: 'uint256', type: 'uint256' },
          { name: 'lastUpdate', internalType: 'uint256', type: 'uint256' },
          { name: 'isActive', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserReviews',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'hasInteracted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'partner', internalType: 'address', type: 'address' },
    ],
    name: 'recordTransactionFailure',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'partner', internalType: 'address', type: 'address' },
    ],
    name: 'recordTransactionSuccess',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'registerUser',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'reputations',
    outputs: [
      { name: 'score', internalType: 'uint256', type: 'uint256' },
      { name: 'totalTransactions', internalType: 'uint256', type: 'uint256' },
      { name: 'successfulTransactions', internalType: 'uint256', type: 'uint256' },
      { name: 'failedTransactions', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdate', internalType: 'uint256', type: 'uint256' },
      { name: 'isActive', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'reviews',
    outputs: [
      { name: 'reviewId', internalType: 'uint256', type: 'uint256' },
      { name: 'reviewer', internalType: 'address', type: 'address' },
      { name: 'reviewee', internalType: 'address', type: 'address' },
      { name: 'rating', internalType: 'uint256', type: 'uint256' },
      { name: 'comment', internalType: 'string', type: 'string' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'isVerified', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_caller', internalType: 'address', type: 'address' },
      { name: '_status', internalType: 'bool', type: 'bool' },
    ],
    name: 'setAuthorizedCaller',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userReviews',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'reviewId', internalType: 'uint256', type: 'uint256' }],
    name: 'verifyReview',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

/**
 *
 */
export const reputationAddress = {
  1337: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
} as const;

/**
 *
 */
export const reputationConfig = { address: reputationAddress, abi: reputationAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SupplyChain
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const supplyChainAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_escrowContract', internalType: 'address', type: 'address' },
      { name: '_reputationContract', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'batchId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'operator', internalType: 'address', type: 'address', indexed: true },
      { name: 'productCount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'BatchOperationCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: true }],
    name: 'ConsumerAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: true }],
    name: 'ConsumerRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: true }],
    name: 'DistributorAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: true }],
    name: 'DistributorRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: true }],
    name: 'FarmerAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: true }],
    name: 'FarmerRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'price', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ForSaleByDistributor',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'price', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ForSaleByFarmer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'price', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ForSaleByRetailer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true }],
    name: 'PackagedByDistributor',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: false }],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'slices', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ProcessedByDistributor',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'farmer', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'ProduceByFarmer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true }],
    name: 'ProductExpired',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'consumer', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'PurchasedByConsumer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'distributor', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'PurchasedByDistributor',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'retailer', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'PurchasedByRetailer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true }],
    name: 'ReceivedByDistributor',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true }],
    name: 'ReceivedByRetailer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: true }],
    name: 'RetailerAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: true }],
    name: 'RetailerRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true }],
    name: 'ShippedByDistributor',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'productCode', internalType: 'uint256', type: 'uint256', indexed: true }],
    name: 'ShippedByFarmer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'parentProduct', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'batchProduct', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'slicesCount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'SlicesBatchCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: false }],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      { name: 'verified', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'UserVerified',
  },
  {
    type: 'function',
    inputs: [],
    name: 'BATCH_LIMIT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_TIMEOUT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_PRODUCT_PRICE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_PRODUCT_PRICE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'addConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'addDistributor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'addFarmer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'addRetailer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'batchOperations',
    outputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'isCompleted', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCodes', internalType: 'uint256[]', type: 'uint256[]' }],
    name: 'checkExpiredProducts',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCodes', internalType: 'uint256[]', type: 'uint256[]' }],
    name: 'createBatchOperation',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'escrowContract',
    outputs: [{ name: '', internalType: 'contract Escrow', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCode', internalType: 'uint256', type: 'uint256' }],
    name: 'fetchItem',
    outputs: [
      {
        name: '',
        internalType: 'struct SupplyChain.Item',
        type: 'tuple',
        components: [
          { name: 'stockUnit', internalType: 'uint256', type: 'uint256' },
          { name: 'productCode', internalType: 'uint256', type: 'uint256' },
          { name: 'ownerID', internalType: 'address', type: 'address' },
          { name: 'farmerID', internalType: 'address', type: 'address' },
          { name: 'productID', internalType: 'uint256', type: 'uint256' },
          { name: 'productDate', internalType: 'uint256', type: 'uint256' },
          { name: 'productPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'productSliced', internalType: 'uint256', type: 'uint256' },
          { name: 'slicesRemaining', internalType: 'uint256', type: 'uint256' },
          { name: 'slicesSold', internalType: 'uint256', type: 'uint256' },
          { name: 'parentProduct', internalType: 'uint256', type: 'uint256' },
          { name: 'itemState', internalType: 'enum SupplyChain.State', type: 'uint8' },
          { name: 'distributorID', internalType: 'address', type: 'address' },
          { name: 'retailerID', internalType: 'address', type: 'address' },
          { name: 'consumerID', internalType: 'address', type: 'address' },
          { name: 'shippingDeadline', internalType: 'uint256', type: 'uint256' },
          { name: 'receivingDeadline', internalType: 'uint256', type: 'uint256' },
          { name: 'isExpired', internalType: 'bool', type: 'bool' },
          { name: 'ipfsHash', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCode', internalType: 'uint256', type: 'uint256' }],
    name: 'fetchItemHistory',
    outputs: [
      {
        name: '',
        internalType: 'struct SupplyChain.Txblocks',
        type: 'tuple',
        components: [
          { name: 'FTD', internalType: 'uint256', type: 'uint256' },
          { name: 'DTR', internalType: 'uint256', type: 'uint256' },
          { name: 'RTC', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalProductCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserProducts',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'isConsumer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'isDistributor',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'isFarmer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'isRetailer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'items',
    outputs: [
      { name: 'stockUnit', internalType: 'uint256', type: 'uint256' },
      { name: 'productCode', internalType: 'uint256', type: 'uint256' },
      { name: 'ownerID', internalType: 'address', type: 'address' },
      { name: 'farmerID', internalType: 'address', type: 'address' },
      { name: 'productID', internalType: 'uint256', type: 'uint256' },
      { name: 'productDate', internalType: 'uint256', type: 'uint256' },
      { name: 'productPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'productSliced', internalType: 'uint256', type: 'uint256' },
      { name: 'slicesRemaining', internalType: 'uint256', type: 'uint256' },
      { name: 'slicesSold', internalType: 'uint256', type: 'uint256' },
      { name: 'parentProduct', internalType: 'uint256', type: 'uint256' },
      { name: 'itemState', internalType: 'enum SupplyChain.State', type: 'uint8' },
      { name: 'distributorID', internalType: 'address', type: 'address' },
      { name: 'retailerID', internalType: 'address', type: 'address' },
      { name: 'consumerID', internalType: 'address', type: 'address' },
      { name: 'shippingDeadline', internalType: 'uint256', type: 'uint256' },
      { name: 'receivingDeadline', internalType: 'uint256', type: 'uint256' },
      { name: 'isExpired', internalType: 'bool', type: 'bool' },
      { name: 'ipfsHash', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'itemsHistory',
    outputs: [
      { name: 'FTD', internalType: 'uint256', type: 'uint256' },
      { name: 'DTR', internalType: 'uint256', type: 'uint256' },
      { name: 'RTC', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCode', internalType: 'uint256', type: 'uint256' }],
    name: 'packageItemByDistributor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'function', inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_productCode', internalType: 'uint256', type: 'uint256' },
      { name: 'slices', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'processedItemByDistributor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_productCode', internalType: 'uint256', type: 'uint256' },
      { name: '_ipfsHash', internalType: 'string', type: 'string' },
      { name: '_price', internalType: 'uint256', type: 'uint256' },
      { name: '_shippingDeadline', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'produceItemByFarmer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCode', internalType: 'uint256', type: 'uint256' }],
    name: 'purchaseItemByConsumer',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCode', internalType: 'uint256', type: 'uint256' }],
    name: 'purchaseItemByDistributor',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCode', internalType: 'uint256', type: 'uint256' }],
    name: 'purchaseItemByRetailer',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCode', internalType: 'uint256', type: 'uint256' }],
    name: 'receivedItemByDistributor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCode', internalType: 'uint256', type: 'uint256' }],
    name: 'receivedItemByRetailer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'renounceConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceDistributor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceFarmer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceRetailer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'reputationContract',
    outputs: [{ name: '', internalType: 'contract Reputation', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_productCode', internalType: 'uint256', type: 'uint256' },
      { name: '_price', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sellItemByDistributor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_productCode', internalType: 'uint256', type: 'uint256' },
      { name: '_price', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sellItemByFarmer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_productCode', internalType: 'uint256', type: 'uint256' },
      { name: '_price', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sellItemByRetailer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_productCode', internalType: 'uint256', type: 'uint256' },
      { name: '_slicesToSell', internalType: 'uint256', type: 'uint256' },
      { name: '_pricePerSlice', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sellSlicesToRetailer',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_escrowContract', internalType: 'address', type: 'address' }],
    name: 'setEscrowContract',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_reputationContract', internalType: 'address', type: 'address' }],
    name: 'setReputationContract',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCode', internalType: 'uint256', type: 'uint256' }],
    name: 'shippedItemByDistributor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_productCode', internalType: 'uint256', type: 'uint256' }],
    name: 'shippedItemByFarmer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'function', inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'unverifyUser',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userProducts',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'verifiedUsers',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'verifyUser',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

/**
 *
 */
export const supplyChainAddress = {
  1337: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
} as const;

/**
 *
 */
export const supplyChainConfig = { address: supplyChainAddress, abi: supplyChainAbi } as const;
