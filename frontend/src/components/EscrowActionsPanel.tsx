"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
} from "lucide-react";
import { formatEther } from "viem";
import { useEscrow } from "@/hooks/useEscrow";
import {
  DISPUTE_STATUS,
  RESOLUTION,
  RESOLUTION_LABELS,
  type EscrowData,
} from "@/lib/contracts-wagmi";

interface EscrowActionsPanelProps {
  productCode: bigint;
  escrowId: bigint;
  escrowData: EscrowData;
  currentUserAddress: `0x${string}`;
  isArbitrator: boolean;
}

export function EscrowActionsPanel({
  productCode,
  escrowId,
  escrowData,
  currentUserAddress,
  isArbitrator,
}: EscrowActionsPanelProps) {
  const {
    releasePayment,
    refundPayment,
    openDispute,
    resolveDispute,
    arbitrationFee,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useEscrow();

  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [selectedResolution, setSelectedResolution] = useState<number>(RESOLUTION.SELLER);

  const isBuyer = escrowData.buyer.toLowerCase() === currentUserAddress.toLowerCase();
  const isSeller = escrowData.seller.toLowerCase() === currentUserAddress.toLowerCase();
  const isSettled = escrowData.isReleased || escrowData.isRefunded;
  const hasActiveDispute = escrowData.disputeStatus === DISPUTE_STATUS.OPEN;
  const deadlinePassed = BigInt(Math.floor(Date.now() / 1000)) > escrowData.deadline;

  // Reset dialogs on transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      setShowReleaseDialog(false);
      setShowRefundDialog(false);
      setShowDisputeDialog(false);
      setShowResolveDialog(false);
      setDisputeReason("");
    }
  }, [isConfirmed]);

  const handleReleasePayment = () => {
    releasePayment(escrowId);
  };

  const handleRefundPayment = () => {
    refundPayment(escrowId);
  };

  const handleOpenDispute = () => {
    if (!disputeReason.trim()) {
      return;
    }
    openDispute(escrowId, disputeReason);
  };

  const handleResolveDispute = () => {
    resolveDispute(escrowId, selectedResolution);
  };

  // If escrow is already settled, show nothing
  if (isSettled) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Success message */}
      {isConfirmed && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Transaction confirmed! Escrow status updated.
          </AlertDescription>
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Transaction failed: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Buyer Actions */}
      {isBuyer && !hasActiveDispute && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowReleaseDialog(true)}
            disabled={isPending || isConfirming}
            className="flex-1"
          >
            {isPending || isConfirming ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <DollarSign className="h-4 w-4 mr-2" />
            )}
            Release Payment
          </Button>
          <Button
            onClick={() => setShowRefundDialog(true)}
            variant="outline"
            disabled={isPending || isConfirming || !deadlinePassed}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Request Refund
          </Button>
          <Button
            onClick={() => setShowDisputeDialog(true)}
            variant="destructive"
            disabled={isPending || isConfirming}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Open Dispute
          </Button>
        </div>
      )}

      {/* Seller Actions */}
      {isSeller && !hasActiveDispute && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowRefundDialog(true)}
            variant="outline"
            disabled={isPending || isConfirming}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Request Refund
          </Button>
          <Button
            onClick={() => setShowDisputeDialog(true)}
            variant="destructive"
            disabled={isPending || isConfirming}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Open Dispute
          </Button>
        </div>
      )}

      {/* Arbitrator Actions */}
      {isArbitrator && hasActiveDispute && (
        <div className="flex gap-2">
          <Button
            onClick={() => setShowResolveDialog(true)}
            disabled={isPending || isConfirming}
            className="flex-1"
          >
            <Shield className="h-4 w-4 mr-2" />
            Resolve Dispute
          </Button>
        </div>
      )}

      {/* Release Payment Dialog */}
      <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Payment</DialogTitle>
            <DialogDescription>
              Confirm that you want to release the payment to the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                You are about to release <strong>{formatEther(escrowData.amount)} ETH</strong> to the seller.
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReleasePayment} disabled={isPending || isConfirming}>
              {isPending || isConfirming ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Payment Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>
              Request a refund of the escrowed payment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <RefreshCw className="h-4 w-4" />
              <AlertDescription>
                {deadlinePassed
                  ? "The deadline has passed. You can request a refund."
                  : "Refunds can only be requested after the deadline or with mutual agreement."}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefundPayment} disabled={isPending || isConfirming}>
              {isPending || isConfirming ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Open Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open Dispute</DialogTitle>
            <DialogDescription>
              Open a dispute for this escrow. An arbitrator will review and resolve it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Opening a dispute requires an arbitration fee of{" "}
                <strong>{formatEther(arbitrationFee)} ETH</strong>.
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="reason">Reason for Dispute</Label>
              <Textarea
                id="reason"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain why you are opening this dispute..."
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleOpenDispute}
              disabled={isPending || isConfirming || !disputeReason.trim()}
              variant="destructive"
            >
              {isPending || isConfirming ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Open Dispute (Pay {formatEther(arbitrationFee)} ETH)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dispute Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              As an arbitrator, choose how to resolve this dispute.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Resolution</Label>
              <div className="space-y-2 mt-2">
                {Object.entries(RESOLUTION).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`resolution-${key}`}
                      name="resolution"
                      value={value}
                      checked={selectedResolution === value}
                      onChange={() => setSelectedResolution(value)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`resolution-${key}`} className="text-sm">
                      {RESOLUTION_LABELS[value]}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {selectedResolution === RESOLUTION.SELLER &&
                  "Payment will be released to the seller."}
                {selectedResolution === RESOLUTION.BUYER &&
                  "Payment will be refunded to the buyer."}
                {selectedResolution === RESOLUTION.SPLIT &&
                  "Payment will be split 50/50 between buyer and seller."}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolveDispute} disabled={isPending || isConfirming}>
              {isPending || isConfirming ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Resolve Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
