import { useMemo } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { parseAbiItem, type Log, type Address } from 'viem';
import { contractAddresses } from '@/lib/wagmi';
import { supplyChainAbi, escrowAbi } from '@/lib/contracts-wagmi';

export interface Transaction {
  hash: string;
  blockNumber: bigint;
  timestamp: number;
  from: Address;
  to: Address;
  type: TransactionType;
  status: 'success' | 'pending' | 'failed';
  eventName: string;
  eventData: any;
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
}

export function useTransactionHistory(address: Address | undefined) {
  const publicClient = usePublicClient();

  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['transactionHistory', address],
    queryFn: async () => {
      if (!address || !publicClient) return [];

      try {
        // Fetch SupplyChain events
        const supplyChainLogs = await publicClient.getLogs({
          address: contractAddresses.supplyChain,
          fromBlock: 0n,
          toBlock: 'latest',
        });

        // Fetch Escrow events
        const escrowLogs = await publicClient.getLogs({
          address: contractAddresses.escrow,
          fromBlock: 0n,
          toBlock: 'latest',
        });

        // Combine all logs
        const allLogs = [...supplyChainLogs, ...escrowLogs];

        // Parse and filter logs for current user
        const parsedTransactions = await Promise.all(
          allLogs
            .filter(log => isUserInvolved(log, address))
            .map(log => parseLogToTransaction(log, publicClient))
        );

        // Sort by timestamp (newest first)
        return parsedTransactions
          .filter(tx => tx !== null)
          .sort((a, b) => b!.timestamp - a!.timestamp) as Transaction[];
      } catch (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }
    },
    enabled: !!address && !!publicClient,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes (formerly cacheTime)
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
    const userAddressLower = userAddress.toLowerCase();
    
    for (let i = 1; i < topics.length; i++) {
      const topic = topics[i];
      if (topic && topic.toLowerCase().includes(userAddressLower.slice(2))) {
        return true;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

async function parseLogToTransaction(
  log: Log,
  publicClient: any
): Promise<Transaction | null> {
  try {
    // Get block to extract timestamp
    const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
    
    // Get transaction receipt to extract value
    let txValue = 0n;
    try {
      const tx = await publicClient.getTransaction({ hash: log.transactionHash });
      txValue = tx.value || 0n;
    } catch (error) {
      console.error('Error fetching transaction:', error);
    }
    
    // Determine transaction type and parse data based on event signature
    const eventSignature = log.topics[0];
    const { type, eventName, eventData } = parseEventData(log, eventSignature);

    // Extract product code from topics if available
    let productCode: bigint | undefined;
    if (log.topics.length > 1 && log.topics[1]) {
      try {
        productCode = BigInt(log.topics[1]);
      } catch (error) {
        // Not a valid product code
      }
    }

    return {
      hash: log.transactionHash || '0x',
      blockNumber: log.blockNumber || 0n,
      timestamp: Number(block.timestamp),
      from: log.address,
      to: log.address,
      type,
      status: 'success',
      eventName,
      eventData,
      productCode: productCode || eventData.productCode,
      amount: txValue > 0n ? txValue : eventData.amount,
    };
  } catch (error) {
    console.error('Error parsing log:', error);
    return null;
  }
}

function parseEventData(log: Log, eventSignature: string | undefined) {
  if (!eventSignature) {
    return { type: TransactionType.PRODUCE, eventName: 'Unknown', eventData: {} };
  }

  // SupplyChain Events
  if (eventSignature === '0x...') { // ProduceByFarmer signature
    return {
      type: TransactionType.PRODUCE,
      eventName: 'ProduceByFarmer',
      eventData: { productCode: log.topics[1] },
    };
  }
  
  // For now, return a default
  // TODO: Add all event signatures
  return {
    type: TransactionType.PRODUCE,
    eventName: 'Unknown Event',
    eventData: {},
  };
}
