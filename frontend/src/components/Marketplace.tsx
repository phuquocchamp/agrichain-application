"use client";

import React, { useState, useEffect } from "react";
import { useSupplyChain } from "@/hooks/useSupplyChain";
import { USER_ROLES, supplyChainAbi } from "@/lib/contracts-wagmi";
import { contractAddresses } from "@/lib/wagmi";
import { usePublicClient } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Loader2 } from "lucide-react";
import { formatEther } from "viem";
import { ProductDetailsModal } from "./ProductDetailsModal";

// Define product states from the smart contract
enum ProductState {
  ProduceByFarmer = 0,
  ForSaleByFarmer = 1,
  PurchasedByDistributor = 2,
  ShippedByFarmer = 3,
  ReceivedByDistributor = 4,
  ProcessedByDistributor = 5,
  PackageByDistributor = 6,
  ForSaleByDistributor = 7,
  PurchasedByRetailer = 8,
  ShippedByDistributor = 9,
  ReceivedByRetailer = 10,
  ForSaleByRetailer = 11,
  PurchasedByConsumer = 12,
}

export function Marketplace() {
  const {
    role,
    totalProducts,
    fetchProductDetails,
    purchaseItemByDistributor,
    purchaseItemByRetailer,
    purchaseItemByConsumer,
    isPending,
  } = useSupplyChain();

  const publicClient = usePublicClient();
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<bigint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      if (!totalProducts || !publicClient) return;

      setIsLoading(true);
      const products = [];
      const count = Number(totalProducts);

      // Iterate through all products (reverse order to show newest first)
      for (let i = count; i >= 1; i--) {
        try {
          const product = await publicClient.readContract({
            address: contractAddresses.supplyChain,
            abi: supplyChainAbi,
            functionName: "fetchItem",
            args: [BigInt(i)],
          });

          console.log(product);
          if (product) {
            const p = product as any;

            // Normalize product data to handle both array and object returns
            const productObj = {
              stockUnit: p.stockUnit !== undefined ? p.stockUnit : p[0],
              productCode: p.productCode !== undefined ? p.productCode : p[1],
              ownerID: p.ownerID !== undefined ? p.ownerID : p[2],
              farmerID: p.farmerID !== undefined ? p.farmerID : p[3],
              productID: p.productID !== undefined ? p.productID : p[4],
              productDate: p.productDate !== undefined ? p.productDate : p[5],
              productPrice: p.productPrice !== undefined ? p.productPrice : p[6],
              productSliced: p.productSliced !== undefined ? p.productSliced : p[7],
              itemState: p.itemState !== undefined ? p.itemState : p[8],
              distributorID: p.distributorID !== undefined ? p.distributorID : p[9],
              retailerID: p.retailerID !== undefined ? p.retailerID : p[10],
              consumerID: p.consumerID !== undefined ? p.consumerID : p[11],
              shippingDeadline: p.shippingDeadline !== undefined ? p.shippingDeadline : p[12],
              receivingDeadline: p.receivingDeadline !== undefined ? p.receivingDeadline : p[13],
              isExpired: p.isExpired !== undefined ? p.isExpired : p[14],
              ipfsHash: p.ipfsHash !== undefined ? p.ipfsHash : p[15],
            };

            // Filter based on role and state
            let isAvailable = false;
            const itemState = Number(productObj.itemState);

            if (role === USER_ROLES.DISTRIBUTOR) {
              isAvailable = itemState === ProductState.ForSaleByFarmer;
            } else if (role === USER_ROLES.RETAILER) {
              isAvailable = itemState === ProductState.ForSaleByDistributor;
            } else if (role === USER_ROLES.CONSUMER) {
              isAvailable = itemState === ProductState.ForSaleByRetailer;
            }

            if (isAvailable) {
              products.push(productObj);
            }
          }
        } catch (err) {
          console.error(`Error fetching product ${i}:`, err);
        }
      }

      setAvailableProducts(products);
      setIsLoading(false);
    };

    loadProducts();
  }, [totalProducts, role, publicClient]);

  const handleBuy = (product: any) => {
    if (role === USER_ROLES.DISTRIBUTOR) {
      purchaseItemByDistributor(product.productCode, formatEther(product.productPrice));
    } else if (role === USER_ROLES.RETAILER) {
      purchaseItemByRetailer(product.productCode, formatEther(product.productPrice));
    } else if (role === USER_ROLES.CONSUMER) {
      purchaseItemByConsumer(product.productCode, formatEther(product.productPrice));
    }
  };

  const handleViewDetails = (productId: bigint) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading marketplace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Marketplace</h2>
        <Badge variant="secondary" className="text-sm">
          {availableProducts.length} Items Available
        </Badge>
      </div>

      {availableProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Products Available</h3>
            <p className="text-muted-foreground">
              There are currently no products available for purchase for your role.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProducts.map((product) => (
            <Card key={product.productCode.toString()} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Product #{product.productCode.toString()}
                  </CardTitle>
                  <Badge variant="outline" className="bg-background">
                    {formatEther(product.productPrice)} ETH
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Package className="h-4 w-4 mr-2" />
                    <span>Seller: {product.ownerID.slice(0, 6)}...{product.ownerID.slice(-4)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(product.productCode)}
                      className="w-full"
                    >
                      Details
                    </Button>
                    <Button
                      onClick={() => handleBuy(product)}
                      disabled={isPending}
                      className="w-full"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedProductId && (
        <ProductDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productId={selectedProductId}
          fetchProductDetails={fetchProductDetails}
        />
      )}
    </div>
  );
}
