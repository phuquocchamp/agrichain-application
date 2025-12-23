import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { escrowAddress, escrowAbi } from "@/lib/generated";
import { type EscrowData, DISPUTE_STATUS } from "@/lib/contracts-wagmi";
import { useEscrowData } from "./useEscrowData";

export type EscrowStatus = "active" | "disputed" | "settled";
export type EscrowRole = "buyer" | "seller" | "arbitrator" | "all";

export interface EscrowListItem {
  escrowId: bigint;
  productCode: bigint;
  buyer: `0x${string}`;
  seller: `0x${string}`;
  amount: bigint;
  deadline: bigint;
  disputeStatus: number;
  isReleased: boolean;
  isRefunded: boolean;
  status: EscrowStatus;
  userRole?: EscrowRole;
}

export interface EscrowStats {
  total: number;
  active: number;
  disputed: number;
  settled: number;
}

export function useEscrowList() {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  // Check if user is arbitrator
  const { data: isArbitrator } = useReadContract({
    address: escrowAddress[1337],
    abi: escrowAbi,
    functionName: "arbitrators",
    args: address ? [address] : undefined,
  });

  /**
   * Fetch all escrows from EscrowCreated events
   */
  const {
    data: escrows = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["escrowList", address],
    queryFn: async () => {
      if (!publicClient) return [];

      try {
        // Fetch all EscrowCreated events
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
          fromBlock: 0n,
          toBlock: "latest",
        });

        // Fetch current data for each escrow
        const escrowPromises = logs.map(async (log) => {
          const escrowId = log.args.escrowId as bigint;

          try {
            const escrowData = (await publicClient.readContract({
              address: escrowAddress[1337],
              abi: escrowAbi,
              functionName: "getEscrowData",
              args: [escrowId],
            })) as EscrowData;

            // Determine status
            let status: EscrowStatus = "active";
            if (escrowData.isReleased || escrowData.isRefunded) {
              status = "settled";
            } else if (escrowData.disputeStatus === DISPUTE_STATUS.OPEN) {
              status = "disputed";
            }

            // Determine user role
            let userRole: EscrowRole | undefined;
            if (address) {
              if (escrowData.buyer.toLowerCase() === address.toLowerCase()) {
                userRole = "buyer";
              } else if (escrowData.seller.toLowerCase() === address.toLowerCase()) {
                userRole = "seller";
              } else if (isArbitrator && status === "disputed") {
                userRole = "arbitrator";
              }
            }

            return {
              escrowId,
              productCode: escrowData.productCode,
              buyer: escrowData.buyer,
              seller: escrowData.seller,
              amount: escrowData.amount,
              deadline: escrowData.deadline,
              disputeStatus: escrowData.disputeStatus,
              isReleased: escrowData.isReleased,
              isRefunded: escrowData.isRefunded,
              status,
              userRole,
            } as EscrowListItem;
          } catch (error) {
            console.error(`Error fetching escrow ${escrowId}:`, error);
            return null;
          }
        });

        const allEscrows = await Promise.all(escrowPromises);
        return allEscrows.filter((e): e is EscrowListItem => e !== null);
      } catch (error) {
        console.error("Error fetching escrow list:", error);
        return [];
      }
    },
    enabled: !!publicClient,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  /**
   * Filter escrows by status
   */
  const filterByStatus = (status: EscrowStatus | "all"): EscrowListItem[] => {
    if (status === "all") return escrows;
    return escrows.filter((e) => e.status === status);
  };

  /**
   * Filter escrows by user role
   */
  const filterByRole = (role: EscrowRole): EscrowListItem[] => {
    if (role === "all") return escrows;
    return escrows.filter((e) => e.userRole === role);
  };

  /**
   * Get escrows for current user (buyer, seller, or arbitrator)
   */
  const getUserEscrows = (): EscrowListItem[] => {
    if (!address) return [];
    return escrows.filter((e) => e.userRole !== undefined);
  };

  /**
   * Get disputed escrows (for arbitrators)
   */
  const getDisputedEscrows = (): EscrowListItem[] => {
    return escrows.filter((e) => e.status === "disputed");
  };

  /**
   * Get escrow statistics
   */
  const getStats = (): EscrowStats => {
    const userEscrows = getUserEscrows();
    return {
      total: userEscrows.length,
      active: userEscrows.filter((e) => e.status === "active").length,
      disputed: userEscrows.filter((e) => e.status === "disputed").length,
      settled: userEscrows.filter((e) => e.status === "settled").length,
    };
  };

  /**
   * Search escrows by ID or product code
   */
  const searchEscrows = (query: string): EscrowListItem[] => {
    if (!query.trim()) return escrows;
    
    const lowerQuery = query.toLowerCase();
    return escrows.filter((e) => {
      const escrowIdStr = e.escrowId.toString();
      const productCodeStr = e.productCode.toString();
      const buyerAddr = e.buyer.toLowerCase();
      const sellerAddr = e.seller.toLowerCase();
      
      return (
        escrowIdStr.includes(lowerQuery) ||
        productCodeStr.includes(lowerQuery) ||
        buyerAddr.includes(lowerQuery) ||
        sellerAddr.includes(lowerQuery)
      );
    });
  };

  return {
    // Data
    escrows,
    isLoading,
    error,
    isArbitrator: (isArbitrator as boolean) || false,

    // Actions
    refetch,

    // Filters
    filterByStatus,
    filterByRole,
    getUserEscrows,
    getDisputedEscrows,
    searchEscrows,

    // Stats
    getStats,
  };
}
