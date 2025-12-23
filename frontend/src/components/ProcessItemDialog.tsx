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
import { Scissors, Loader2, AlertCircle } from "lucide-react";
import { useSupplyChain } from "@/hooks/useSupplyChain";

interface ProcessItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productCode: bigint;
  onSuccess?: () => void;
}

export function ProcessItemDialog({
  isOpen,
  onClose,
  productCode,
  onSuccess,
}: ProcessItemDialogProps) {
  const { processedItemByDistributor, isPending } = useSupplyChain();
  const [slices, setSlices] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    // Validation
    const slicesNum = parseInt(slices);
    if (!slices || isNaN(slicesNum) || slicesNum <= 0) {
      setError("Please enter a valid number of slices (greater than 0)");
      return;
    }

    if (slicesNum > 1000) {
      setError("Number of slices cannot exceed 1000");
      return;
    }

    // Clear error and process
    setError("");
    processedItemByDistributor(productCode, BigInt(slicesNum));

    // Close dialog and reset
    setTimeout(() => {
      onClose();
      setSlices("");
      if (onSuccess) onSuccess();
    }, 500);
  };

  const handleClose = () => {
    setSlices("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-blue-600" />
            Process Item
          </DialogTitle>
          <DialogDescription>
            Enter the number of slices to process this product into smaller units.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="slices">Number of Slices</Label>
            <Input
              id="slices"
              type="number"
              placeholder="e.g., 10, 20, 50..."
              value={slices}
              onChange={(e) => setSlices(e.target.value)}
              min="1"
              max="1000"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              How many smaller units will this product be divided into?
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              After processing, you'll need to package the item before selling it.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !slices}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Scissors className="mr-2 h-4 w-4" />
                Process Item
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
