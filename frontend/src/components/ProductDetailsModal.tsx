"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Calendar,
  DollarSign,
  User,
  Clock,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { formatEther } from "viem";
import { PRODUCT_STATES, USER_ROLES, type Product, type EscrowData } from "@/lib/contracts-wagmi";
import { useSupplyChain } from "@/hooks/useSupplyChain";
import { useEscrow } from "@/hooks/useEscrow";
import { useIPFS } from "@/hooks/useIPFS";
import { useEscrowData } from "@/hooks/useEscrowData";
import { SellProductModal } from "./SellProductModal";
import { ProcessItemDialog } from "./ProcessItemDialog";
import { SliceSellModal } from "./SliceSellModal";
import { EscrowStatusCard } from "./EscrowStatusCard";
import { EscrowActionsPanel } from "./EscrowActionsPanel";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: bigint;
  fetchProductDetails: (productCode: bigint) => any;
}

export function ProductDetailsModal({
  isOpen,
  onClose,
  productId,
  fetchProductDetails,
}: ProductDetailsModalProps) {
  const {
    data: productData,
    isLoading,
    error,
  } = fetchProductDetails(productId);

  const {
    address,
    role,
    shippedItemByFarmer,
    receivedItemByDistributor,
    processedItemByDistributor,
    packageItemByDistributor,
    sellItemByDistributor,
    shippedItemByDistributor,
    receivedItemByRetailer,
    sellItemByRetailer,
    shippedItemByRetailer,
  } = useSupplyChain();
  const { isArbitrator, findEscrowByProductCode } = useEscrow();
  const { getMetadata } = useIPFS();
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [isSliceSellModalOpen, setIsSliceSellModalOpen] = useState(false);
  const [escrowId, setEscrowId] = useState<bigint | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Fetch metadata from IPFS
  useEffect(() => {
    const loadMetadata = async () => {
      if (!productData) return;

      const product = productData as unknown as Product;
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
  }, [productData]); // Removed getMetadata from dependencies

  // Find escrow ID for this product
  useEffect(() => {
    const loadEscrow = async () => {
      if (!productData) return;

      const product = productData as unknown as Product;
      const state = Number(product.itemState);

      // Check if product has been purchased (states 2, 3, 4-7, 8, 9, 10+)
      const hasPurchase = state === 2 || state === 3 ||
        (state >= 4 && state <= 7) ||
        state === 8 || state === 9 || state >= 10;

      if (!hasPurchase) {
        setEscrowId(null);
        return;
      }

      // Find escrow ID for this product
      const id = await findEscrowByProductCode(product.productCode);
      setEscrowId(id);
    };

    loadEscrow();
  }, [productData, findEscrowByProductCode]);

  // Fetch escrow data using the new hook
  const { escrowData, isLoading: isLoadingEscrow } = useEscrowData(escrowId);

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

  const getStateBadgeClass = (state: number) => {
    switch (state) {
      case 0:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case 1:
        return "bg-green-100 text-green-800 border-green-200";
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 3:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 4:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 5:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStateText = (state: number) => {
    return PRODUCT_STATES[state] || "Unknown";
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Loading product information...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Error loading product information
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load product details: {error.message}
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  if (!productData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Product not found</DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This product does not exist or has been removed.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  // Parse the product data - it's returned as an object from the contract
  const {
    stockUnit,
    productCode,
    ownerID,
    farmerID,
    productID,
    productDate,
    productPrice,
    productSliced,
    slicesRemaining,
    slicesSold,
    parentProduct,
    itemState,
    distributorID,
    retailerID,
    consumerID,
    shippingDeadline,
    receivingDeadline,
    isExpired,
    ipfsHash,
  } = productData as unknown as Product;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>{metadata?.name || `Product #${productCode.toString()}`}</span>
          </DialogTitle>
          <DialogDescription>
            {metadata?.description || "Detailed information about this agricultural product"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          {metadata?.image && (
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={`https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${metadata.image}`}
                alt={metadata.name || "Product image"}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Loading Metadata */}
          {isLoadingMetadata && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading product details...</span>
            </div>
          )}

          {/* Status and State */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={getStateBadgeClass(Number(itemState))}
              >
                {getStateText(Number(itemState))}
              </Badge>
              {isExpired && <Badge variant="destructive">Expired</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              Stock Units: {stockUnit.toString()}
            </div>
          </div>

          {/* Metadata Attributes */}
          {metadata?.attributes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Product Attributes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {metadata.attributes.category && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-sm">{metadata.attributes.category}</p>
                  </div>
                )}
                {metadata.attributes.origin && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Origin</label>
                    <p className="text-sm">{metadata.attributes.origin}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Product Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Product Code
                  </label>
                  <p className="text-sm">{productCode.toString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Product ID
                  </label>
                  <p className="text-sm">{productID.toString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Price
                  </label>
                  <p className="text-sm font-semibold">
                    {formatEther(productPrice)} ETH
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Sliced Units
                  </label>
                  <p className="text-sm">{productSliced.toString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created Date
                  </label>
                  <p className="text-sm">{formatDate(productDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    IPFS Hash
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-mono truncate">{ipfsHash}</p>
                    {ipfsHash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://ipfs.io/ipfs/${ipfsHash}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supply Chain Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Supply Chain Participants</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Owner
                  </label>
                  <p className="text-sm font-mono">{formatAddress(ownerID)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Farmer
                  </label>
                  <p className="text-sm font-mono">{formatAddress(farmerID)}</p>
                </div>
                {distributorID !==
                  "0x0000000000000000000000000000000000000000" && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Distributor
                      </label>
                      <p className="text-sm font-mono">
                        {formatAddress(distributorID)}
                      </p>
                    </div>
                  )}
                {retailerID !==
                  "0x0000000000000000000000000000000000000000" && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Retailer
                      </label>
                      <p className="text-sm font-mono">
                        {formatAddress(retailerID)}
                      </p>
                    </div>
                  )}
                {consumerID !==
                  "0x0000000000000000000000000000000000000000" && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Consumer
                      </label>
                      <p className="text-sm font-mono">
                        {formatAddress(consumerID)}
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Deadlines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Shipping Deadline
                  </label>
                  <p className="text-sm">{formatDate(shippingDeadline)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Receiving Deadline
                  </label>
                  <p className="text-sm">{formatDate(receivingDeadline)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Section - Show for purchased products */}
          {(Number(itemState) === 2 || // PurchasedByDistributor
            Number(itemState) === 3 || // ShippedByFarmer
            Number(itemState) >= 4 && Number(itemState) <= 7 || // Distributor processing
            Number(itemState) === 8 || // PurchasedByRetailer
            Number(itemState) === 9 || // ShippedByDistributor
            Number(itemState) >= 10) && ( // Retailer and Consumer
              <>
                <EscrowStatusCard
                  productCode={productCode}
                  currentUserAddress={address!}
                />
                {escrowId && escrowData && (
                  <EscrowActionsPanel
                    productCode={productCode}
                    escrowId={escrowId}
                    escrowData={escrowData}
                    currentUserAddress={address!}
                    isArbitrator={isArbitrator}
                  />
                )}
              </>
            )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 flex-wrap gap-2">
            {/* Sell Product - State 0 (ProducedByFarmer) */}
            {role === USER_ROLES.FARMER &&
              address === ownerID &&
              Number(itemState) === 0 && (
                <Button onClick={() => setIsSellModalOpen(true)}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Sell Product
                </Button>
              )}

            {/* Ship Item - State 2 (PurchasedByDistributor) */}
            {role === USER_ROLES.FARMER &&
              address === farmerID &&
              Number(itemState) === 2 && (
                <Button
                  onClick={() => {
                    if (confirm("Ship this item to the distributor?")) {
                      shippedItemByFarmer(productCode);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Ship Item
                </Button>
              )}

            {/* Receive Item - State 3 (ShippedByFarmer) */}
            {role === USER_ROLES.DISTRIBUTOR &&
              address === ownerID &&
              Number(itemState) === 3 && (
                <Button
                  onClick={() => {
                    if (confirm("Confirm that you have received this item?")) {
                      receivedItemByDistributor(productCode);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Receive Item
                </Button>
              )}

            {/* Process Item - State 4 (ReceivedByDistributor) */}
            {role === USER_ROLES.DISTRIBUTOR &&
              address === ownerID &&
              Number(itemState) === 4 && (
                <Button
                  onClick={() => setIsProcessDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Process Item
                </Button>
              )}

            {/* Package Item - State 5 (ProcessedByDistributor) */}
            {role === USER_ROLES.DISTRIBUTOR &&
              address === ownerID &&
              Number(itemState) === 5 && (
                <Button
                  onClick={() => {
                    if (confirm("Package this processed item?")) {
                      packageItemByDistributor(productCode);
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Package Item
                </Button>
              )}

            {/* Sell to Retailer - State 6 (PackageByDistributor) */}
            {role === USER_ROLES.DISTRIBUTOR &&
              address === ownerID &&
              Number(itemState) === 6 && (
                Number(productSliced) > 0 ? (
                  <Button
                    onClick={() => setIsSliceSellModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Sell Slices to Retailer
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsSellModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Sell to Retailer
                  </Button>
                )
              )}

            {/* Ship to Retailer - State 8 (PurchasedByRetailer) */}
            {role === USER_ROLES.DISTRIBUTOR &&
              address === distributorID &&
              Number(itemState) === 8 && (
                <Button
                  onClick={() => {
                    if (confirm("Ship this item to the retailer?")) {
                      shippedItemByDistributor(productCode);
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Ship to Retailer
                </Button>
              )}

            {/* Receive Item - State 9 (ShippedByDistributor) - Retailer */}
            {role === USER_ROLES.RETAILER &&
              address === ownerID &&
              Number(itemState) === 9 && (
                <Button
                  onClick={() => {
                    if (confirm("Confirm that you have received this item?")) {
                      receivedItemByRetailer(productCode);
                    }
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Receive Item
                </Button>
              )}

            {/* Sell to Consumer - State 10 (ReceivedByRetailer) */}
            {role === USER_ROLES.RETAILER &&
              address === ownerID &&
              Number(itemState) === 10 && (
                <Button
                  onClick={() => setIsSellModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Sell to Consumer
                </Button>
              )}

            {/* Ship to Consumer - State 12 (PurchasedByConsumer) */}
            {role === USER_ROLES.RETAILER &&
              address === retailerID &&
              Number(itemState) === 12 && (
                <Button
                  onClick={() => {
                    if (confirm("Ship this item to the consumer?")) {
                      shippedItemByRetailer(productCode);
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Ship to Consumer
                </Button>
              )}

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      <SellProductModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        productCode={productCode}
        currentPrice={productPrice}
        onSuccess={() => {
          // Ideally refresh data here
          onClose();
        }}
      />

      <ProcessItemDialog
        isOpen={isProcessDialogOpen}
        onClose={() => setIsProcessDialogOpen(false)}
        productCode={productCode}
        onSuccess={() => {
          // Refresh data
          onClose();
        }}
      />

      <SliceSellModal
        isOpen={isSliceSellModalOpen}
        onClose={() => setIsSliceSellModalOpen(false)}
        productCode={productCode}
        slicesRemaining={slicesRemaining || 0n}
        onSuccess={() => onClose()}
      />
    </Dialog>
  );
}
