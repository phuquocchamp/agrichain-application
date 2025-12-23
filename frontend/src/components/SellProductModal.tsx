"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign } from "lucide-react";
import { useSupplyChain } from "@/hooks/useSupplyChain";
import { USER_ROLES } from "@/lib/contracts-wagmi";
import { formatEther } from "viem";

interface SellProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productCode: bigint;
  currentPrice: bigint;
  onSuccess?: () => void;
}

export function SellProductModal({
  isOpen,
  onClose,
  productCode,
  currentPrice,
  onSuccess,
}: SellProductModalProps) {
  const {
    role,
    sellItemByFarmer,
    sellItemByDistributor,
    sellItemByRetailer,
    isPending
  } = useSupplyChain();
  const [price, setPrice] = useState(formatEther(currentPrice));

  const handleSell = async () => {
    if (!price || parseFloat(price) <= 0) return;

    try {
      // Call appropriate sell function based on role
      if (role === USER_ROLES.FARMER) {
        await sellItemByFarmer(productCode, price);
      } else if (role === USER_ROLES.DISTRIBUTOR) {
        await sellItemByDistributor(productCode, price);
      } else if (role === USER_ROLES.RETAILER) {
        await sellItemByRetailer(productCode, price);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to sell product:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sell Product</DialogTitle>
          <DialogDescription>
            Set a price to list your product for sale on the marketplace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (ETH)
            </Label>
            <div className="col-span-3 relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.001"
                min="0.001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSell} disabled={isPending || !price}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Sell
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
