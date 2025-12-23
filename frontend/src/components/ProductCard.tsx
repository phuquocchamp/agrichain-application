"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, DollarSign, Package } from "lucide-react";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { contractAddresses } from "@/lib/wagmi";
import { supplyChainAbi, PRODUCT_STATES } from "@/lib/contracts-wagmi";
import { useIPFS } from "@/hooks/useIPFS";
import type { ProductMetadata } from "@/types/metadata";

interface ProductCardProps {
  productId: bigint;
  onViewDetails: (id: bigint) => void;
}

export function ProductCard({ productId, onViewDetails }: ProductCardProps) {
  const [metadata, setMetadata] = useState<ProductMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const { getMetadata } = useIPFS();

  // Fetch product details from contract
  const { data: productData, isLoading: isLoadingProduct } = useReadContract({
    address: contractAddresses.supplyChain,
    abi: supplyChainAbi,
    functionName: "fetchItem",
    args: [productId],
  });

  // Fetch metadata from IPFS
  useEffect(() => {
    const loadMetadata = async () => {
      if (!productData) return;

      const product = productData as any;
      if (!product.ipfsHash) return;

      setIsLoadingMetadata(true);
      try {
        const data = await getMetadata(product.ipfsHash);
        setMetadata(data);
      } catch (error) {
        console.error("Failed to load metadata:", error);
        setMetadata(null);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();
  }, [productData]);

  // Loading state
  if (isLoadingProduct || isLoadingMetadata) {
    return (
      <Card>
        <Skeleton className="h-48 w-full rounded-t-lg" />
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!productData) {
    return null;
  }

  const product = productData as any;
  const itemState = Number(product.itemState);
  const price = formatEther(product.productPrice);
  const date = new Date(Number(product.productDate) * 1000);

  // Get status badge
  const getStatusBadge = (state: number) => {
    const stateInfo = {
      0: { label: "Produced", color: "bg-blue-500" },
      1: { label: "For Sale", color: "bg-green-500" },
      2: { label: "Sold", color: "bg-purple-500" },
      3: { label: "Shipped", color: "bg-orange-500" },
      4: { label: "Received", color: "bg-teal-500" },
      5: { label: "Processed", color: "bg-indigo-500" },
      6: { label: "Packed", color: "bg-cyan-500" },
      7: { label: "For Sale (Retailer)", color: "bg-green-600" },
      8: { label: "Purchased", color: "bg-purple-600" },
      9: { label: "Shipped (Retailer)", color: "bg-orange-600" },
      10: { label: "Received (Consumer)", color: "bg-teal-600" },
    };

    const info = stateInfo[state as keyof typeof stateInfo] || {
      label: "Unknown",
      color: "bg-gray-500",
    };

    return (
      <Badge className={`${info.color} text-white border-none`}>
        {info.label}
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      {metadata?.image ? (
        <div className="relative h-48 w-full bg-gray-100">
          <img
            src={`https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${metadata.image}`}
            alt={metadata.name || "Product"}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <Package className="h-16 w-16 text-gray-400" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1">
            {metadata?.name || `Product #${productId.toString()}`}
          </CardTitle>
          {getStatusBadge(itemState)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {metadata?.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {metadata.description}
          </p>
        )}

        {/* Attributes */}
        {metadata?.attributes && (
          <div className="flex flex-wrap gap-2">
            {metadata.attributes.category && (
              <Badge variant="outline" className="text-xs">
                {metadata.attributes.category}
              </Badge>
            )}
            {metadata.attributes.origin && (
              <Badge variant="outline" className="text-xs">
                📍 {metadata.attributes.origin}
              </Badge>
            )}
          </div>
        )}

        {/* Price and Date */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center text-sm">
            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-semibold">{price} ETH</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{date.toLocaleDateString()}</span>
          </div>
        </div>

        {/* View Details Button */}
        <Button
          className="w-full mt-2"
          variant="outline"
          onClick={() => onViewDetails(productId)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
