"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
} from "lucide-react";
import { formatEther } from "viem";
import { useEscrow } from "@/hooks/useEscrow";
import { useEscrowData } from "@/hooks/useEscrowData";
import {
  DISPUTE_STATUS,
  DISPUTE_STATUS_LABELS,
  type EscrowData,
} from "@/lib/contracts-wagmi";

interface EscrowStatusCardProps {
  productCode: bigint;
  currentUserAddress: `0x${string}`;
}

export function EscrowStatusCard({
  productCode,
  currentUserAddress,
}: EscrowStatusCardProps) {
  const { findEscrowByProductCode } = useEscrow();
  const [escrowId, setEscrowId] = useState<bigint | null>(null);
  const [isLoadingEscrow, setIsLoadingEscrow] = useState(true);

  // Find escrow ID for this product
  useEffect(() => {
    const loadEscrow = async () => {
      setIsLoadingEscrow(true);
      const id = await findEscrowByProductCode(productCode);
      setEscrowId(id);
      setIsLoadingEscrow(false);
    };
    loadEscrow();
  }, [productCode, findEscrowByProductCode]);

  // Fetch escrow data using the new hook
  const {
    escrowData,
    isLoading: isLoadingData,
    error,
  } = useEscrowData(escrowId);

  const formatAddress = (addr: `0x${string}`) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (escrow: EscrowData) => {
    if (escrow.isReleased) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Payment Released
        </Badge>
      );
    }
    if (escrow.isRefunded) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
          <XCircle className="h-3 w-3 mr-1" />
          Payment Refunded
        </Badge>
      );
    }
    if (escrow.disputeStatus === DISPUTE_STATUS.OPEN) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Dispute Open
        </Badge>
      );
    }
    if (escrow.disputeStatus === DISPUTE_STATUS.RESOLVED) {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          <Shield className="h-3 w-3 mr-1" />
          Dispute Resolved
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Payment Pending
      </Badge>
    );
  };

  const isDeadlinePassed = (deadline: bigint) => {
    return BigInt(Math.floor(Date.now() / 1000)) > deadline;
  };

  // Loading state
  if (isLoadingEscrow || isLoadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Escrow Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading escrow...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No escrow found
  if (!escrowId || !escrowData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Escrow Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No escrow found for this product. Escrow is created when the product is purchased.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Escrow Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load escrow data: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const escrow = escrowData as unknown as EscrowData;
  const isBuyer = escrow.buyer.toLowerCase() === currentUserAddress.toLowerCase();
  const isSeller = escrow.seller.toLowerCase() === currentUserAddress.toLowerCase();
  const deadlinePassed = isDeadlinePassed(escrow.deadline);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Escrow Status</span>
          </CardTitle>
          {getStatusBadge(escrow)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Escrow ID */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Escrow ID
          </label>
          <p className="text-sm font-mono">#{escrowId.toString()}</p>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Escrow Amount
          </label>
          <p className="text-lg font-semibold">
            {formatEther(escrow.amount)} ETH
          </p>
        </div>

        {/* Participants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center">
              <User className="h-3 w-3 mr-1" />
              Buyer
            </label>
            <p className="text-sm font-mono">
              {formatAddress(escrow.buyer)}
              {isBuyer && (
                <Badge variant="outline" className="ml-2 text-xs">
                  You
                </Badge>
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center">
              <User className="h-3 w-3 mr-1" />
              Seller
            </label>
            <p className="text-sm font-mono">
              {formatAddress(escrow.seller)}
              {isSeller && (
                <Badge variant="outline" className="ml-2 text-xs">
                  You
                </Badge>
              )}
            </p>
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Deadline
          </label>
          <p className="text-sm">
            {formatDate(escrow.deadline)}
            {deadlinePassed && (
              <Badge variant="destructive" className="ml-2 text-xs">
                Expired
              </Badge>
            )}
          </p>
        </div>

        {/* Dispute Status */}
        {escrow.disputeStatus !== DISPUTE_STATUS.NONE && (
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Dispute Status
            </label>
            <p className="text-sm">
              {DISPUTE_STATUS_LABELS[escrow.disputeStatus]}
            </p>
          </div>
        )}

        {/* Info for buyer */}
        {isBuyer && !escrow.isReleased && !escrow.isRefunded && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              As the buyer, you can release payment to the seller once you receive the product.
            </AlertDescription>
          </Alert>
        )}

        {/* Info for seller */}
        {isSeller && !escrow.isReleased && !escrow.isRefunded && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment is held in escrow. The buyer will release it once they receive the product.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
