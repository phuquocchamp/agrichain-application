import { type UserRole, USER_ROLES } from "@/lib/contracts-wagmi";
import { supplyChainAbi, supplyChainAddress } from "@/lib/generated";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export function useSupplyChain() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Invalidate queries when transaction is confirmed
  React.useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({
        queryKey: ["readContract", supplyChainAddress[1337]],
      });
    }
  }, [isConfirmed, queryClient]);

  // Read contract state
  const { data: owner } = useReadContract({
    address: supplyChainAddress[1337],
    abi: supplyChainAbi,
    functionName: "owner",
  });

  const { data: isFarmer } = useReadContract({
    address: supplyChainAddress[1337],
    abi: supplyChainAbi,
    functionName: "isFarmer",
    args: address ? [address] : undefined,
  });

  const { data: isDistributor } = useReadContract({
    address: supplyChainAddress[1337],
    abi: supplyChainAbi,
    functionName: "isDistributor",
    args: address ? [address] : undefined,
  });

  const { data: isRetailer } = useReadContract({
    address: supplyChainAddress[1337],
    abi: supplyChainAbi,
    functionName: "isRetailer",
    args: address ? [address] : undefined,
  });

  const { data: isConsumer } = useReadContract({
    address: supplyChainAddress[1337],
    abi: supplyChainAbi,
    functionName: "isConsumer",
    args: address ? [address] : undefined,
  });

  const { data: isVerified } = useReadContract({
    address: supplyChainAddress[1337],
    abi: supplyChainAbi,
    functionName: "verifiedUsers",
    args: address ? [address] : undefined,
  });

  const { data: userProducts } = useReadContract({
    address: supplyChainAddress[1337],
    abi: supplyChainAbi,
    functionName: "getUserProducts",
    args: address ? [address] : undefined,
  });

  const { data: totalProducts } = useReadContract({
    address: supplyChainAddress[1337],
    abi: supplyChainAbi,
    functionName: "getTotalProductCount",
  });

  // Determine user role
  const role: UserRole = (() => {
    if (!address) return USER_ROLES.NONE;
    if (address === owner) return USER_ROLES.OWNER;
    if (isFarmer) return USER_ROLES.FARMER;
    if (isDistributor) return USER_ROLES.DISTRIBUTOR;
    if (isRetailer) return USER_ROLES.RETAILER;
    if (isConsumer) return USER_ROLES.CONSUMER;
    return USER_ROLES.NONE;
  })();

  // Contract interaction functions
  const addFarmer = (account: `0x${string}`) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "addFarmer",
      args: [account],
    });
  };

  const addDistributor = (account: `0x${string}`) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "addDistributor",
      args: [account],
    });
  };

  const addRetailer = (account: `0x${string}`) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "addRetailer",
      args: [account],
    });
  };

  const addConsumer = (account: `0x${string}`) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "addConsumer",
      args: [account],
    });
  };

  const verifyUser = (user: `0x${string}`) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "verifyUser",
      args: [user],
    });
  };

  const unverifyUser = (user: `0x${string}`) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "unverifyUser",
      args: [user],
    });
  };

  const produceItemByFarmer = (
    productCode: bigint,
    ipfsHash: string,
    price: string,
    shippingDeadline: bigint
  ) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "produceItemByFarmer",
      args: [productCode, ipfsHash, parseEther(price), shippingDeadline],
    });
  };

  const sellItemByFarmer = (productCode: bigint, price: string) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "sellItemByFarmer",
      args: [productCode, parseEther(price)],
    });
  };

  const purchaseItemByDistributor = (productCode: bigint, value: string) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "purchaseItemByDistributor",
      args: [productCode],
      value: parseEther(value),
    });
  };

  const shippedItemByFarmer = (productCode: bigint) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "shippedItemByFarmer",
      args: [productCode],
    });
  };

  const receivedItemByDistributor = (productCode: bigint) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "receivedItemByDistributor",
      args: [productCode],
    });
  };

  const processedItemByDistributor = (productCode: bigint, slices: bigint) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "processedItemByDistributor",
      args: [productCode, slices],
    });
  };

  const packageItemByDistributor = (productCode: bigint) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "packageItemByDistributor",
      args: [productCode],
    });
  };

  const sellItemByDistributor = (productCode: bigint, price: string) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "sellItemByDistributor",
      args: [productCode, parseEther(price)],
    });
  };

  const sellSlicesToRetailer = (
    productCode: bigint,
    slicesToSell: bigint,
    pricePerSlice: string
  ) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "sellSlicesToRetailer",
      args: [productCode, slicesToSell, parseEther(pricePerSlice)],
    });
  };

  const purchaseItemByRetailer = (productCode: bigint, value: string) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "purchaseItemByRetailer",
      args: [productCode],
      value: parseEther(value),
    });
  };

  const shippedItemByDistributor = (productCode: bigint) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "shippedItemByDistributor",
      args: [productCode],
    });
  };

  const receivedItemByRetailer = (productCode: bigint) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "receivedItemByRetailer",
      args: [productCode],
    });
  };

  const sellItemByRetailer = (productCode: bigint, price: string) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "sellItemByRetailer",
      args: [productCode, parseEther(price)],
    });
  };

  const purchaseItemByConsumer = (productCode: bigint, value: string) => {
    writeContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "purchaseItemByConsumer",
      args: [productCode],
      value: parseEther(value),
    });
  };

  // Function to fetch individual product details
  const fetchProductDetails = (productCode: bigint) => {
    return useReadContract({
      address: supplyChainAddress[1337],
      abi: supplyChainAbi,
      functionName: "fetchItem",
      args: [productCode],
    });
  };

  return {
    // State
    address,
    role,
    owner,
    isFarmer,
    isDistributor,
    isRetailer,
    isConsumer,
    isVerified,
    userProducts: (userProducts as bigint[]) || [],
    totalProducts: (totalProducts as bigint) || BigInt(0),

    // Transaction state
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,

    // Functions
    addFarmer,
    addDistributor,
    addRetailer,
    addConsumer,
    verifyUser,
    unverifyUser,
    produceItemByFarmer,
    sellItemByFarmer,
    purchaseItemByDistributor,
    shippedItemByFarmer,
    receivedItemByDistributor,
    processedItemByDistributor,
    packageItemByDistributor,
    sellItemByDistributor,
    sellSlicesToRetailer,
    purchaseItemByRetailer,
    shippedItemByDistributor,
    receivedItemByRetailer,
    sellItemByRetailer,
    purchaseItemByConsumer,
    fetchProductDetails,
  };
}
