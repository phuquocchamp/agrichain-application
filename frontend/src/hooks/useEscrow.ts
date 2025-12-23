import { escrowAbi, escrowAddress } from "@/lib/generated";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { parseEther } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export function useEscrow() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Invalidate queries when transaction is confirmed
  React.useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({
        queryKey: ["readContract", escrowAddress[1337]],
      });
    }
  }, [isConfirmed, queryClient]);

  // Read contract constants
  const { data: arbitrationFee } = useReadContract({
    address: escrowAddress[1337],
    abi: escrowAbi,
    functionName: "ARBITRATION_FEE",
  });

  const { data: escrowTimeout } = useReadContract({
    address: escrowAddress[1337],
    abi: escrowAbi,
    functionName: "ESCROW_TIMEOUT",
  });

  // Check if current user is arbitrator
  const { data: isArbitrator } = useReadContract({
    address: escrowAddress[1337],
    abi: escrowAbi,
    functionName: "arbitrators",
    args: address ? [address] : undefined,
  });

  // Note: getEscrowData and getDisputeData have been moved to a separate hook
  // to avoid violating the Rules of Hooks. Use useEscrowData hook instead.

  /**
   * Find escrow ID for a product by scanning EscrowCreated events
   * This is necessary because the Item struct doesn't store escrowId
   */
  const findEscrowByProductCode = async (
    productCode: bigint
  ): Promise<bigint | null> => {
    if (!publicClient) return null;

    try {
      // Get EscrowCreated events for this product
      const logs = await publicClient.getLogs({
        address: escrowAddress[1337],
        event: {
          type: "event",
          name: "EscrowCreated",
          inputs: [
            { type: "uint256", indexed: true, name: "escrowId" },
            { type: "uint256", indexed: true, name: "productCode" },
            { type: "address", indexed: false, name: "buyer" },
            { type: "address", indexed: false, name: "seller" },
            { type: "uint256", indexed: false, name: "amount" },
          ],
        },
        args: {
          productCode: productCode,
        },
        fromBlock: BigInt(0),
        toBlock: "latest",
      });

      // Return the most recent escrow for this product
      if (logs.length > 0) {
        const latestLog = logs[logs.length - 1];
        return latestLog.args.escrowId as bigint;
      }

      return null;
    } catch (error) {
      console.error("Error finding escrow:", error);
      return null;
    }
  };

  /**
   * Release payment to seller (buyer only)
   */
  const releasePayment = (escrowId: bigint) => {
    writeContract({
      address: escrowAddress[1337],
      abi: escrowAbi,
      functionName: "releasePayment",
      args: [escrowId],
    });
  };

  /**
   * Request refund (buyer or seller, or automatic after deadline)
   */
  const refundPayment = (escrowId: bigint) => {
    writeContract({
      address: escrowAddress[1337],
      abi: escrowAbi,
      functionName: "refundPayment",
      args: [escrowId],
    });
  };

  /**
   * Open dispute (buyer or seller, requires arbitration fee)
   */
  const openDispute = (escrowId: bigint, reason: string) => {
    const fee = arbitrationFee || parseEther("0.01");
    writeContract({
      address: escrowAddress[1337],
      abi: escrowAbi,
      functionName: "openDispute",
      args: [escrowId, reason],
      value: fee as bigint,
    });
  };

  /**
   * Resolve dispute (arbitrator only)
   * @param resolution 0 = Seller, 1 = Buyer, 2 = Split
   */
  const resolveDispute = (escrowId: bigint, resolution: number) => {
    writeContract({
      address: escrowAddress[1337],
      abi: escrowAbi,
      functionName: "resolveDispute",
      args: [escrowId, resolution],
    });
  };

  /**
   * Add arbitrator (owner only)
   */
  const addArbitrator = (arbitratorAddress: `0x${string}`) => {
    writeContract({
      address: escrowAddress[1337],
      abi: escrowAbi,
      functionName: "addArbitrator",
      args: [arbitratorAddress],
    });
  };

  /**
   * Remove arbitrator (owner only)
   */
  const removeArbitrator = (arbitratorAddress: `0x${string}`) => {
    writeContract({
      address: escrowAddress[1337],
      abi: escrowAbi,
      functionName: "removeArbitrator",
      args: [arbitratorAddress],
    });
  };

  return {
    // State
    address,
    isArbitrator: (isArbitrator as boolean) || false,
    arbitrationFee: (arbitrationFee as bigint) || parseEther("0.01"),
    escrowTimeout: (escrowTimeout as bigint) || BigInt(7 * 24 * 60 * 60), // 7 days

    // Transaction state
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,

    // Read functions
    findEscrowByProductCode,

    // Write functions
    releasePayment,
    refundPayment,
    openDispute,
    resolveDispute,
    addArbitrator,
    removeArbitrator,
  };
}
