"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Package, DollarSign, AlertCircle } from "lucide-react";
import { useSupplyChain } from "@/hooks/useSupplyChain";

interface SliceSellModalProps {
  isOpen: boolean;
  onClose: () => void;
  productCode: bigint;
  slicesRemaining: bigint;
  onSuccess?: () => void;
}

export function SliceSellModal({
  isOpen,
  onClose,
  productCode,
  slicesRemaining,
  onSuccess,
}: SliceSellModalProps) {
  const { sellSlicesToRetailer, isPending } = useSupplyChain();
  const [slicesToSell, setSlicesToSell] = useState("");
  const [pricePerSlice, setPricePerSlice] = useState("");
  const [error, setError] = useState("");

  const maxSlices = Number(slicesRemaining);
  const slicesNum = parseInt(slicesToSell) || 0;
  const priceNum = parseFloat(pricePerSlice) || 0;
  const totalPrice = slicesNum * priceNum;

  const handleSubmit = () => {
    // Validation
    if (!slicesToSell || slicesNum <= 0) {
      setError("Please enter number of slices to sell");
      return;
    }

    if (slicesNum > maxSlices) {
      setError(`Cannot sell more than ${maxSlices} slices`);
      return;
    }

    if (!pricePerSlice || priceNum <= 0) {
      setError("Please enter price per slice");
      return;
    }

    setError("");
    sellSlicesToRetailer(productCode, BigInt(slicesNum), pricePerSlice);

    setTimeout(() => {
      onClose();
      setSlicesToSell("");
      setPricePerSlice("");
      if (onSuccess) onSuccess();
    }, 500);
  };

  const handleClose = () => {
    setSlicesToSell("");
    setPricePerSlice("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Sell Slices to Retailer
          </DialogTitle>
          <DialogDescription>
            Create a batch listing for retailers to purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="slices">Number of Slices</Label>
            <Input
              id="slices"
              type="number"
              placeholder="e.g., 5, 10, 20..."
              value={slicesToSell}
              onChange={(e) => setSlicesToSell(e.target.value)}
              min="1"
              max={maxSlices}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Available: {maxSlices} slices
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price per Slice (ETH)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.001"
                placeholder="e.g., 100, 150..."
                value={pricePerSlice}
                onChange={(e) => setPricePerSlice(e.target.value)}
                className="pl-10"
                disabled={isPending}
              />
            </div>
          </div>

          {slicesNum > 0 && priceNum > 0 && (
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold">Batch Summary:</div>
                <div className="mt-1 text-sm">
                  {slicesNum} slices × {priceNum} ETH = <span className="font-bold">{totalPrice.toFixed(3)} ETH</span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !slicesToSell || !pricePerSlice}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Create Listing
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
