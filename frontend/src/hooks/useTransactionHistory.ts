import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { type Log, type Address, decodeEventLog, keccak256, toHex } from 'viem';
import { supplyChainAddress, escrowAddress, supplyChainAbi, escrowAbi } from '@/lib/generated';

export interface Transaction {
  hash: string;
  blockNumber: bigint;
  timestamp: number;
  from: Address;
  to: Address;
  type: TransactionType;
  status: 'success' | 'pending' | 'failed';
  eventName: string;
  eventData: Record<string, unknown>;
  productCode?: bigint;
  amount?: bigint;
}

export enum TransactionType {
  PRODUCE = 'Produce',
  SELL = 'Sell',
  PURCHASE = 'Purchase',
  SHIP = 'Ship',
  RECEIVE = 'Receive',
  PROCESS = 'Process',
  PACKAGE = 'Package',
  ESCROW_CREATED = 'Escrow Created',
  ESCROW_RELEASE = 'Payment Released',
  ESCROW_REFUND = 'Payment Refunded',
  DISPUTE_OPENED = 'Dispute Opened',
  DISPUTE_RESOLVED = 'Dispute Resolved',
  USER_VERIFIED = 'User Verified',
  ROLE_ADDED = 'Role Added',
  ROLE_REMOVED = 'Role Removed',
  SLICES_SOLD = 'Slices Sold',
  UNKNOWN = 'Unknown',
}

// Event signature mappings for SupplyChain contract
const SUPPLY_CHAIN_EVENT_TYPES: Record<string, { type: TransactionType; eventName: string }> = {
  'ProduceByFarmer': { type: TransactionType.PRODUCE, eventName: 'ProduceByFarmer' },
  'SellByFarmer': { type: TransactionType.SELL, eventName: 'SellByFarmer' },
  'PurchaseByDistributor': { type: TransactionType.PURCHASE, eventName: 'PurchaseByDistributor' },
  'ShippedByFarmer': { type: TransactionType.SHIP, eventName: 'ShippedByFarmer' },
  'ReceivedByDistributor': { type: TransactionType.RECEIVE, eventName: 'ReceivedByDistributor' },
  'ProcessedByDistributor': { type: TransactionType.PROCESS, eventName: 'ProcessedByDistributor' },
  'PackagedByDistributor': { type: TransactionType.PACKAGE, eventName: 'PackagedByDistributor' },
  'SellByDistributor': { type: TransactionType.SELL, eventName: 'SellByDistributor' },
  'PurchaseByRetailer': { type: TransactionType.PURCHASE, eventName: 'PurchaseByRetailer' },
  'ShippedByDistributor': { type: TransactionType.SHIP, eventName: 'ShippedByDistributor' },
  'ReceivedByRetailer': { type: TransactionType.RECEIVE, eventName: 'ReceivedByRetailer' },
  'SellByRetailer': { type: TransactionType.SELL, eventName: 'SellByRetailer' },
  'PurchaseByConsumer': { type: TransactionType.PURCHASE, eventName: 'PurchaseByConsumer' },
  'UserVerified': { type: TransactionType.USER_VERIFIED, eventName: 'UserVerified' },
  'SlicesBatchCreated': { type: TransactionType.SLICES_SOLD, eventName: 'SlicesBatchCreated' },
  'FarmerAdded': { type: TransactionType.ROLE_ADDED, eventName: 'FarmerAdded' },
  'DistributorAdded': { type: TransactionType.ROLE_ADDED, eventName: 'DistributorAdded' },
  'RetailerAdded': { type: TransactionType.ROLE_ADDED, eventName: 'RetailerAdded' },
  'ConsumerAdded': { type: TransactionType.ROLE_ADDED, eventName: 'ConsumerAdded' },
};

// Event signature mappings for Escrow contract
const ESCROW_EVENT_TYPES: Record<string, { type: TransactionType; eventName: string }> = {
  'EscrowCreated': { type: TransactionType.ESCROW_CREATED, eventName: 'EscrowCreated' },
  'PaymentReleased': { type: TransactionType.ESCROW_RELEASE, eventName: 'PaymentReleased' },
  'PaymentRefunded': { type: TransactionType.ESCROW_REFUND, eventName: 'PaymentRefunded' },
  'DisputeOpened': { type: TransactionType.DISPUTE_OPENED, eventName: 'DisputeOpened' },
  'DisputeResolved': { type: TransactionType.DISPUTE_RESOLVED, eventName: 'DisputeResolved' },
};

export function useTransactionHistory(address: Address | undefined) {
  const publicClient = usePublicClient();

  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['transactionHistory', address],
    queryFn: async () => {
      if (!address || !publicClient) return [];

      try {
        // Fetch SupplyChain events
        const supplyChainLogs = await publicClient.getLogs({
          address: supplyChainAddress[1337],
          fromBlock: 0n,
          toBlock: 'latest',
        });

        // Fetch Escrow events
        const escrowLogs = await publicClient.getLogs({
          address: escrowAddress[1337],
          fromBlock: 0n,
          toBlock: 'latest',
        });

        // Parse and combine all logs
        const supplyChainTransactions = await Promise.all(
          supplyChainLogs
            .filter(log => isUserInvolved(log, address))
            .map(log => parseSupplyChainLog(log, publicClient))
        );

        const escrowTransactions = await Promise.all(
          escrowLogs
            .filter(log => isUserInvolved(log, address))
            .map(log => parseEscrowLog(log, publicClient))
        );

        // Combine, filter nulls, and sort by timestamp (newest first)
        const allTransactions = [...supplyChainTransactions, ...escrowTransactions]
          .filter((tx): tx is Transaction => tx !== null)
          .sort((a, b) => b.timestamp - a.timestamp);

        return allTransactions;
      } catch (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }
    },
    enabled: !!address && !!publicClient,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

  return {
    transactions: transactions || [],
    isLoading,
    error,
    refetch,
  };
}

function isUserInvolved(log: Log, userAddress: Address): boolean {
  try {
    const topics = log.topics;
    if (!topics || topics.length === 0) return false;

    // Check if user address appears in indexed parameters (topics)
    const userAddressLower = userAddress.toLowerCase().slice(2); // Remove 0x prefix
    
    for (let i = 1; i < topics.length; i++) {
      const topic = topics[i];
      if (topic && topic.toLowerCase().includes(userAddressLower)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

async function parseSupplyChainLog(
  log: Log,
  publicClient: ReturnType<typeof usePublicClient>
): Promise<Transaction | null> {
  try {
    if (!publicClient) return null;
    
    // Get block to extract timestamp
    const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
    
    // Try to decode the event
    let decodedEvent: { eventName: string; args: Record<string, unknown> } | null = null;
    let eventInfo = { type: TransactionType.UNKNOWN, eventName: 'Unknown' };
    
    try {
      decodedEvent = decodeEventLog({
        abi: supplyChainAbi,
        data: log.data,
        topics: log.topics,
      }) as { eventName: string; args: Record<string, unknown> };
      
      // Get event info from mapping
      if (decodedEvent.eventName && SUPPLY_CHAIN_EVENT_TYPES[decodedEvent.eventName]) {
        eventInfo = SUPPLY_CHAIN_EVENT_TYPES[decodedEvent.eventName];
      }
    } catch {
      // Could not decode event, use fallback
    }

    // Extract product code from decoded event or topics
    let productCode: bigint | undefined;
    if (decodedEvent?.args.upc) {
      productCode = decodedEvent.args.upc as bigint;
    } else if (decodedEvent?.args.productCode) {
      productCode = decodedEvent.args.productCode as bigint;
    } else if (log.topics.length > 1 && log.topics[1]) {
      try {
        productCode = BigInt(log.topics[1]);
      } catch {
        // Not a valid product code
      }
    }

    // Extract amount from decoded event
    let amount: bigint | undefined;
    if (decodedEvent?.args.productPrice) {
      amount = decodedEvent.args.productPrice as bigint;
    } else if (decodedEvent?.args.price) {
      amount = decodedEvent.args.price as bigint;
    } else if (decodedEvent?.args.amount) {
      amount = decodedEvent.args.amount as bigint;
    }

    // Fallback: get transaction value if no amount in event
    if (!amount) {
      try {
        const tx = await publicClient.getTransaction({ hash: log.transactionHash! });
        if (tx.value && tx.value > 0n) {
          amount = tx.value;
        }
      } catch {
        // Could not get transaction value
      }
    }

    return {
      hash: log.transactionHash || '0x',
      blockNumber: log.blockNumber || 0n,
      timestamp: Number(block.timestamp),
      from: log.address,
      to: log.address,
      type: eventInfo.type,
      status: 'success',
      eventName: eventInfo.eventName,
      eventData: decodedEvent?.args || {},
      productCode,
      amount,
    };
  } catch (error) {
    console.error('Error parsing SupplyChain log:', error);
    return null;
  }
}

async function parseEscrowLog(
  log: Log,
  publicClient: ReturnType<typeof usePublicClient>
): Promise<Transaction | null> {
  try {
    if (!publicClient) return null;
    
    // Get block to extract timestamp
    const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
    
    // Try to decode the event
    let decodedEvent: { eventName: string; args: Record<string, unknown> } | null = null;
    let eventInfo = { type: TransactionType.UNKNOWN, eventName: 'Unknown' };
    
    try {
      decodedEvent = decodeEventLog({
        abi: escrowAbi,
        data: log.data,
        topics: log.topics,
      }) as { eventName: string; args: Record<string, unknown> };
      
      // Get event info from mapping
      if (decodedEvent.eventName && ESCROW_EVENT_TYPES[decodedEvent.eventName]) {
        eventInfo = ESCROW_EVENT_TYPES[decodedEvent.eventName];
      }
    } catch {
      // Could not decode event, use fallback
    }

    // Extract product code
    let productCode: bigint | undefined;
    if (decodedEvent?.args.productCode) {
      productCode = decodedEvent.args.productCode as bigint;
    } else if (decodedEvent?.args.upc) {
      productCode = decodedEvent.args.upc as bigint;
    }

    // Extract amount
    let amount: bigint | undefined;
    if (decodedEvent?.args.amount) {
      amount = decodedEvent.args.amount as bigint;
    } else if (decodedEvent?.args.value) {
      amount = decodedEvent.args.value as bigint;
    }

    return {
      hash: log.transactionHash || '0x',
      blockNumber: log.blockNumber || 0n,
      timestamp: Number(block.timestamp),
      from: log.address,
      to: log.address,
      type: eventInfo.type,
      status: 'success',
      eventName: eventInfo.eventName,
      eventData: decodedEvent?.args || {},
      productCode,
      amount,
    };
  } catch (error) {
    console.error('Error parsing Escrow log:', error);
    return null;
  }
}
