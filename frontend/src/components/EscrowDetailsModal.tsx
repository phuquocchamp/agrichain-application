"use client";

import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  User,
  Calendar,
  AlertCircle,
  Shield,
  Loader2,
  Package,
} from "lucide-react";
import { formatEther } from "viem";
import { useEscrowData, useDisputeData } from "@/hooks/useEscrowData";
import { useEscrow } from "@/hooks/useEscrow";
import { DISPUTE_STATUS, DISPUTE_STATUS_LABELS } from "@/lib/contracts-wagmi";
import { EscrowActionsPanel } from "./EscrowActionsPanel";
import { Separator } from "@radix-ui/react-separator";

interface EscrowDetailsModalProps {
  escrowId: bigint;
  isOpen: boolean;
  onClose: () => void;
}

export function EscrowDetailsModal({
  escrowId,
  isOpen,
  onClose,
}: EscrowDetailsModalProps) {
  const { address } = useAccount();
  const { isArbitrator } = useEscrow();
  const { escrowData, isLoading: isLoadingEscrow, error: escrowError, refetch } = useEscrowData(escrowId);
  const { disputeData, isLoading: isLoadingDispute } = useDisputeData(escrowId);
  const isLoading = isLoadingEscrow || isLoadingDispute;
  const error = escrowError;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-3 text-muted-foreground">Loading escrow details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !escrowData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading escrow details: {error?.message || "Unknown error"}
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  const hasDispute = escrowData.disputeStatus !== DISPUTE_STATUS.NONE;
  const isSettled = escrowData.isReleased || escrowData.isRefunded;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Escrow #{escrowId.toString()}
          </DialogTitle>
          <DialogDescription>
            Detailed information about this escrow transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Escrow Status:</span>
                {isSettled ? (
                  <Badge variant="secondary">
                    {escrowData.isReleased ? "Payment Released" : "Payment Refunded"}
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dispute Status:</span>
                <Badge variant={hasDispute ? "destructive" : "outline"}>
                  {DISPUTE_STATUS_LABELS[escrowData.disputeStatus]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Escrow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Product Code:</span>
                </div>
                <span className="font-mono">#{escrowData.productCode.toString()}</span>
              </div>

              <div className="border-t my-2" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Amount:</span>
                </div>
                <span className="font-semibold">{formatEther(escrowData.amount)} ETH</span>
              </div>

              <div className="border-t my-2" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Buyer:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {escrowData.buyer.slice(0, 6)}...{escrowData.buyer.slice(-4)}
                  </span>
                  {address && escrowData.buyer.toLowerCase() === address.toLowerCase() && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Seller:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {escrowData.seller.slice(0, 6)}...{escrowData.seller.slice(-4)}
                  </span>
                  {address && escrowData.seller.toLowerCase() === address.toLowerCase() && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
              </div>

              <div className="border-t my-2" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Deadline:</span>
                </div>
                <span className="text-sm">
                  {new Date(Number(escrowData.deadline) * 1000).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Dispute Information */}
          {hasDispute && disputeData && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Dispute Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Complainant:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {disputeData.complainant.slice(0, 6)}...{disputeData.complainant.slice(-4)}
                    </span>
                    {address && disputeData.complainant.toLowerCase() === address.toLowerCase() && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-sm text-muted-foreground">Reason:</span>
                  <p className="mt-1 text-sm bg-white p-3 rounded border">
                    {disputeData.reason}
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Opened:</span>
                  <span className="text-sm">
                    {new Date(Number(disputeData.timestamp) * 1000).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Resolved:</span>
                  <Badge variant={disputeData.isResolved ? "default" : "secondary"}>
                    {disputeData.isResolved ? "Yes" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions Panel */}
          {address && !isSettled && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <EscrowActionsPanel
                  productCode={escrowData.productCode}
                  escrowId={escrowId}
                  escrowData={escrowData}
                  currentUserAddress={address}
                  isArbitrator={isArbitrator}
                />
              </CardContent>
            </Card>
          )}

          {/* Arbitrator Badge */}
          {isArbitrator && hasDispute && !isSettled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You are an arbitrator. You can resolve this dispute using the actions above.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
