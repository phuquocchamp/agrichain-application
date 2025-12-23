import { type Dispute, type EscrowData } from "@/lib/contracts-wagmi";
import { escrowAbi, escrowAddress } from "@/lib/generated";
import { useReadContract } from "wagmi";

/**
 * Custom hook to fetch escrow data by escrow ID
 * This is separated from useEscrow to avoid violating the Rules of Hooks
 * 
 * @param escrowId - The ID of the escrow to fetch, or null to skip fetching
 */
export function useEscrowData(escrowId: bigint | null) {
  const {
    data: escrowData,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: escrowAddress[1337],
    abi: escrowAbi,
    functionName: "getEscrowData",
    args: escrowId !== null ? [escrowId] : undefined,
    query: {
      enabled: escrowId !== null, // Only fetch if we have an escrowId
    },
  });

  return {
    escrowData: escrowData as EscrowData | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Custom hook to fetch dispute data by escrow ID
 * 
 * @param escrowId - The ID of the escrow to fetch dispute for, or null to skip fetching
 */
export function useDisputeData(escrowId: bigint | null) {
  const {
    data: disputeData,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: escrowAddress[1337],
    abi: escrowAbi,
    functionName: "getDisputeData",
    args: escrowId !== null ? [escrowId] : undefined,
    query: {
      enabled: escrowId !== null, // Only fetch if we have an escrowId
    },
  });

  return {
    disputeData: disputeData as Dispute | undefined,
    isLoading,
    error,
    refetch,
  };
}
