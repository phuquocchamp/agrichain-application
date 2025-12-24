"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Package, Upload, X, CheckCircle } from "lucide-react";
import { useSupplyChain } from "@/hooks/useSupplyChain";
import { useIPFS } from "@/hooks/useIPFS";
import type { ProductMetadata } from "@/types/metadata";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { contractAddresses } from "@/lib/wagmi";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateProductModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProductModalProps) {
  const { produceItemByFarmer, isPending, isConfirmed, isConfirming } = useSupplyChain();
  const { uploadMetadata, uploadFile, isUploading, uploadError } = useIPFS();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    category: "",
    origin: "",
    price: "",
    shippingDeadline: "",
  });

  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Watch for transaction confirmation to close modal
  useEffect(() => {
    if (isConfirmed && isSubmitting) {
      setShowSuccess(true);
      setUploadStatus("Product created successfully!");

      // Refresh data
      queryClient.invalidateQueries({
        queryKey: ["readContract", contractAddresses.supplyChain],
      });

      // Close modal after showing success message
      const timer = setTimeout(() => {
        resetForm();
        onSuccess?.();
        onClose();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isConfirmed, isSubmitting, queryClient, onSuccess, onClose]);

  const resetForm = () => {
    setFormData({
      productName: "",
      description: "",
      category: "",
      origin: "",
      price: "",
      shippingDeadline: "",
    });
    setProductImage(null);
    setImagePreview(null);
    setUploadStatus("");
    setIsSubmitting(false);
    setShowSuccess(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProductImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productName || !formData.description || !formData.price || !formData.shippingDeadline) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageCID: string | undefined;

      // Step 1: Upload image to IPFS (if provided)
      if (productImage) {
        setUploadStatus("Uploading image to IPFS...");
        imageCID = await uploadFile(productImage);
        console.log("Image uploaded to IPFS:", imageCID);
      }

      // Step 2: Create and upload metadata to IPFS
      setUploadStatus("Uploading metadata to IPFS...");
      const metadata: ProductMetadata = {
        name: formData.productName,
        description: formData.description,
        image: imageCID,
        attributes: {
          category: formData.category || undefined,
          origin: formData.origin || undefined,
        },
        createdAt: Math.floor(Date.now() / 1000),
        version: "1.0",
      };

      const metadataCID = await uploadMetadata(metadata);
      console.log("Metadata uploaded to IPFS:", metadataCID);

      // Step 3: Create product on blockchain
      setUploadStatus("Creating product on blockchain... Please confirm in your wallet.");
      const productCode = BigInt(0);
      const shippingDeadlineBigInt = BigInt(
        Math.floor(new Date(formData.shippingDeadline).getTime() / 1000)
      );

      produceItemByFarmer(
        productCode,
        metadataCID,
        formData.price,
        shippingDeadlineBigInt
      );

      // The useEffect above will handle the rest when isConfirmed becomes true
    } catch (error) {
      console.error("Failed to create product:", error);
      setUploadStatus("");
      setIsSubmitting(false);
      alert(
        `Failed to create product: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isPending && !isConfirming) {
      resetForm();
      onClose();
    }
  };

  const isFormDisabled = isPending || isUploading || isSubmitting || isConfirming;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new agricultural product to your inventory. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-lg font-semibold text-green-700">Product Created Successfully!</p>
            <p className="text-sm text-muted-foreground">Closing modal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g. Organic Tomatoes"
                  disabled={isFormDisabled}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Name of the agricultural product
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (ETH) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0.001"
                  max="1000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.05"
                  disabled={isFormDisabled}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Range: 0.001 - 1000 ETH
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the product..."
                  className="h-20"
                  disabled={isFormDisabled}
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="productImage">Product Image (Optional)</Label>
                <div className="space-y-2">
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        id="productImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isFormDisabled}
                        className="hidden"
                      />
                      <label
                        htmlFor="productImage"
                        className={`cursor-pointer flex flex-col items-center space-y-2 ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to upload product image
                        </span>
                        <span className="text-xs text-gray-500">
                          Max 5MB • JPG, PNG, WebP
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative border rounded-lg p-2">
                      <div className="relative w-full h-48">
                        <Image
                          src={imagePreview}
                          alt="Product preview"
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        disabled={isFormDisabled}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Vegetables, Fruits"
                  disabled={isFormDisabled}
                />
              </div>

              {/* Origin */}
              <div className="space-y-2">
                <Label htmlFor="origin">Origin (Optional)</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="e.g. California, USA"
                  disabled={isFormDisabled}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shippingDeadline">Shipping Deadline *</Label>
                <Input
                  id="shippingDeadline"
                  type="datetime-local"
                  value={formData.shippingDeadline}
                  onChange={(e) => setFormData({ ...formData, shippingDeadline: e.target.value })}
                  disabled={isFormDisabled}
                  required
                />
              </div>
            </div>

            {/* Upload Status */}
            {uploadStatus && (
              <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                {!showSuccess && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* Confirming Status */}
            {isConfirming && (
              <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Waiting for transaction confirmation...</span>
              </div>
            )}

            {/* Upload Error */}
            {uploadError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                Error: {uploadError.message}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isFormDisabled}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isFormDisabled}>
                {isFormDisabled ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Package className="mr-2 h-4 w-4" />
                )}
                {isFormDisabled ? "Processing..." : "Create Product"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
