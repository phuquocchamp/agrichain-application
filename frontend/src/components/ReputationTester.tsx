"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Star,
  User,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Shield,
} from "lucide-react";
import { contractAddresses } from "@/lib/wagmi";
import { reputationAbi } from "@/lib/contracts-wagmi";
import { useSupplyChain } from "@/hooks/useSupplyChain";

export function ReputationTester() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: txHash, isPending, isSuccess, isError } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const { role } = useSupplyChain();

  const [reputationData, setReputationData] = useState({
    userAddress: "",
    partnerAddress: "",
    rating: "5",
    comment: "",
    reviewId: "1",
    authorizeAddress: "",
  });
  const [lookupAddress, setLookupAddress] = useState("");
  const [transactionMessage, setTransactionMessage] = useState<{ type: string; text: string } | null>(null);
  const [lastReviewId, setLastReviewId] = useState<number | null>(null);
  const [reviewedUserAddress, setReviewedUserAddress] = useState<string>("");
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [isVerifyingReview, setIsVerifyingReview] = useState(false);

  // Wait for transaction confirmation and refetch data
  useEffect(() => {
    if (isTxConfirmed) {
      // Handle AddReview confirmation
      if (isAddingReview) {
        setTransactionMessage({ type: "success", text: "✅ Review created! Now verify it to apply reputation points." });

        // Save the reviewed user address for later refetch
        setReviewedUserAddress(lookupAddress);

        // Auto-increment review ID for next verification
        const nextId = parseInt(reputationData.reviewId) + 1;
        setLastReviewId(nextId);
        setReputationData({
          ...reputationData,
          reviewId: nextId.toString(),
        });

        setIsAddingReview(false);
      }
      // Handle VerifyReview confirmation
      else if (isVerifyingReview) {
        setTransactionMessage({ type: "success", text: "✅ Review verified! Reputation points updated." });

        // Wait a moment for blockchain to update, then refetch
        if (reviewedUserAddress) {
          setTimeout(() => {
            // Force refetch by temporarily clearing lookupAddress then setting it back
            setLookupAddress("");
            setTimeout(() => {
              setLookupAddress(reviewedUserAddress);
            }, 100);
          }, 1000);
        }

        setIsVerifyingReview(false);
      }
      // Handle other transactions (RecordSuccess, RecordFailure)
      else {
        setTransactionMessage({ type: "success", text: "✅ Transaction confirmed! Updating reputation data..." });

        // Auto-switch to the user who was just evaluated
        if (reputationData.userAddress && reputationData.userAddress !== lookupAddress) {
          setLookupAddress(reputationData.userAddress);
        }

        // Refetch immediately after confirmation
        setTimeout(() => {
          refetchReputation();
          refetchReputationLevel();
        }, 500);
      }

      // Clear message after 4 seconds
      setTimeout(() => {
        setTransactionMessage(null);
      }, 4000);
    }
  }, [isTxConfirmed, isAddingReview, isVerifyingReview, reviewedUserAddress, reputationData, lookupAddress]);

  // Show pending message when confirming
  useEffect(() => {
    if (isTxConfirming && txHash) {
      setTransactionMessage({ type: "pending", text: "⏳ Confirming transaction on blockchain..." });
    }
  }, [isTxConfirming, txHash]);

  // Show error message
  useEffect(() => {
    if (isError) {
      setTransactionMessage({ type: "error", text: "❌ Transaction failed. Please check your inputs." });
      setTimeout(() => {
        setTransactionMessage(null);
      }, 5000);
    }
  }, [isError]);

  // Refetch reputation when reviewedUserAddress changes
  useEffect(() => {
    if (reviewedUserAddress) {
      setLookupAddress(reviewedUserAddress);
    }
  }, [reviewedUserAddress]);

  // Fetch user reputation
  const { data: userReputation, refetch: refetchReputation, isLoading: isLoadingReputation } = useReadContract({
    address: contractAddresses.reputation,
    abi: reputationAbi,
    functionName: "getUserReputation",
    args: lookupAddress ? [lookupAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!lookupAddress, // Enable when we have an address
    }
  });

  // Get reputation level
  const { data: reputationLevel, refetch: refetchReputationLevel } = useReadContract({
    address: contractAddresses.reputation,
    abi: reputationAbi,
    functionName: "calculateReputationLevel",
    args: lookupAddress ? [lookupAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!lookupAddress, // Enable when we have an address
    }
  });

  // Check if SupplyChain is authorized
  const { data: isSupplyChainAuthorized } = useReadContract({
    address: contractAddresses.reputation,
    abi: reputationAbi,
    functionName: "authorizedCallers",
    args: [contractAddresses.supplyChain],
  });

  // Check if current user (reviewer) is verified
  const { data: reviewerReputation } = useReadContract({
    address: contractAddresses.reputation,
    abi: reputationAbi,
    functionName: "getUserReputation",
    args: address ? [address as `0x${string}`] : undefined,
  });

  // Check if reviewee is verified
  const { data: revieweeReputation } = useReadContract({
    address: contractAddresses.reputation,
    abi: reputationAbi,
    functionName: "getUserReputation",
    args: lookupAddress ? [lookupAddress as `0x${string}`] : undefined,
  });

  // Handle lookup button click
  const handleLookup = async () => {
    if (!lookupAddress) {
      alert("Please provide a user address");
      return;
    }
    await refetchReputation();
    await refetchReputationLevel();
  };

  const handleRegisterUser = () => {
    if (!reputationData.userAddress) {
      alert("Please provide user address");
      return;
    }

    writeContract({
      address: contractAddresses.reputation,
      abi: reputationAbi,
      functionName: "registerUser",
      args: [reputationData.userAddress as `0x${string}`],
    });
  };

  const handleAddReview = () => {
    if (!lookupAddress || !reputationData.comment) {
      alert("Please fill all required fields");
      return;
    }

    setIsAddingReview(true);
    setTransactionMessage({ type: "pending", text: "Creating review..." });
    writeContract({
      address: contractAddresses.reputation,
      abi: reputationAbi,
      functionName: "addReview",
      args: [
        lookupAddress as `0x${string}`,
        BigInt(parseInt(reputationData.rating)),
        reputationData.comment,
      ],
    });
  };

  const handleVerifyReview = () => {
    if (!reputationData.reviewId) {
      alert("Please provide review ID");
      return;
    }

    setIsVerifyingReview(true);
    setTransactionMessage({ type: "pending", text: "Verifying review and updating reputation..." });
    writeContract({
      address: contractAddresses.reputation,
      abi: reputationAbi,
      functionName: "verifyReview",
      args: [BigInt(reputationData.reviewId)],
    });
  };

  const handleAuthorizeAddress = () => {
    if (!reputationData.authorizeAddress) {
      alert("Please provide address to authorize");
      return;
    }

    writeContract({
      address: contractAddresses.reputation,
      abi: reputationAbi,
      functionName: "setAuthorizedCaller",
      args: [reputationData.authorizeAddress as `0x${string}`, true],
    });
  };

  const handleRecordSuccess = () => {
    if (!reputationData.userAddress || !reputationData.partnerAddress) {
      alert("Please provide both user and partner addresses");
      return;
    }

    setTransactionMessage({ type: "pending", text: "Processing transaction..." });
    writeContract({
      address: contractAddresses.reputation,
      abi: reputationAbi,
      functionName: "recordTransactionSuccess",
      args: [reputationData.userAddress as `0x${string}`, reputationData.partnerAddress as `0x${string}`],
    });
  };

  const handleRecordFailure = () => {
    if (!reputationData.userAddress || !reputationData.partnerAddress) {
      alert("Please provide both user and partner addresses");
      return;
    }

    setTransactionMessage({ type: "pending", text: "Processing transaction..." });
    writeContract({
      address: contractAddresses.reputation,
      abi: reputationAbi,
      functionName: "recordTransactionFailure",
      args: [reputationData.userAddress as `0x${string}`, reputationData.partnerAddress as `0x${string}`],
    });
  };

  const getReputationLevelBadge = (level: string) => {
    const colors = {
      Excellent: "bg-green-100 text-green-800",
      Good: "bg-blue-100 text-blue-800",
      Fair: "bg-yellow-100 text-yellow-800",
      Poor: "bg-red-100 text-red-800",
      Unknown: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={colors[level as keyof typeof colors] || colors.Unknown}>
        {level}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
      />
    ));
  };

  if (!isConnected) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to test reputation features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Reputation Contract Tester</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Star className="h-3 w-3" />
            <span>Reputation System</span>
          </Badge>
          {role === "Owner" && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Admin</span>
            </Badge>
          )}
        </div>
      </div>

      {/* User Registration */}
      {/* Removed: User Registration is now handled automatically by SupplyChain.verifyUser() */}

      {/* Reputation Lookup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Reputation Lookup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lookupAddress">User Address</Label>
              <Input
                id="lookupAddress"
                value={lookupAddress}
                onChange={(e) => setLookupAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleLookup}
                className="w-full"
                disabled={isLoadingReputation}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {isLoadingReputation ? "Loading..." : "Lookup Reputation"}
              </Button>
            </div>
          </div>

          {/* Reputation Details */}
          {userReputation && userReputation.isActive && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Reputation Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Score: {userReputation.score?.toString()}</div>
                <div>Total Transactions: {userReputation.totalTransactions?.toString()}</div>
                <div>
                  Successful: {userReputation.successfulTransactions?.toString()}
                </div>
                <div>Failed: {userReputation.failedTransactions?.toString()}</div>
                <div>Active: {userReputation.isActive ? "Yes" : "No"}</div>
                <div>
                  Level:{" "}
                  {getReputationLevelBadge(
                    (reputationLevel as string) || "Unknown"
                  )}
                </div>
              </div>
            </div>
          )}

          {userReputation && !userReputation.isActive && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                User not registered. User must be verified in Admin Tools first.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Review System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Review System</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reviewUser">User to Review</Label>
              <Input
                id="reviewUser"
                value={lookupAddress}
                onChange={(e) => setLookupAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                value={reputationData.rating}
                onChange={(e) =>
                  setReputationData({
                    ...reputationData,
                    rating: e.target.value,
                  })
                }
                placeholder="5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Comment</Label>
            <Input
              id="comment"
              value={reputationData.comment}
              onChange={(e) =>
                setReputationData({
                  ...reputationData,
                  comment: e.target.value,
                })
              }
              placeholder="Great service, highly recommended!"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm">Rating Preview:</span>
            <div className="flex">
              {renderStars(parseInt(reputationData.rating))}
            </div>
          </div>

          <Button
            onClick={handleAddReview}
            className="w-full"
            disabled={!reviewerReputation?.isActive || !revieweeReputation?.isActive}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Review
          </Button>

          {/* Validation Alerts */}
          {!reviewerReputation?.isActive && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                ⚠️ <strong>You must be verified first!</strong> Go to Admin Tools → User Management → Verify User to activate your account.
              </AlertDescription>
            </Alert>
          )}

          {lookupAddress && !revieweeReputation?.isActive && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                ⚠️ <strong>User to review must be verified first!</strong> Make sure they are verified in Admin Tools before reviewing.
              </AlertDescription>
            </Alert>
          )}

          {reviewerReputation?.isActive && revieweeReputation?.isActive && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 space-y-2">
                <div><strong>✅ Ready to Review!</strong></div>
                <div className="text-sm">
                  <div>• You are verified ✓</div>
                  <div>• User to review is verified ✓</div>
                  <div>• Both must have transaction history together (automatic after product purchase)</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>How Review System Works:</strong>
              <div className="mt-2 space-y-1 text-sm">
                <div><strong>Requirements:</strong></div>
                <div>• Both reviewer and reviewee must be verified by Admin</div>
                <div>• Reviewer and reviewee must have transaction history (tracked automatically)</div>
                <div><strong>Steps:</strong></div>
                <div>1. Click <strong>Add Review</strong> to create a new review (Review ID auto-generated)</div>
                <div>2. Go to <strong>Admin Functions</strong> → <strong>Verify Review</strong></div>
                <div>3. Enter the <strong>Review ID</strong> and click <strong>Verify Review</strong></div>
                <div>4. Score will update based on rating: ⭐⭐⭐⭐⭐ = +20 points</div>
                <div><strong>Roles:</strong> Any verified role (Farmer, Distributor, Retailer, Consumer) can review each other</div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Admin Functions */}
      {role === "Owner" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Admin Functions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Authorize Caller Section */}
            <div className="border-b pb-4 space-y-3">
              <h4 className="font-semibold text-sm">Authorize Caller Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authorizeAddress">Address to Authorize</Label>
                  <Input
                    id="authorizeAddress"
                    value={reputationData.authorizeAddress}
                    onChange={(e) =>
                      setReputationData({
                        ...reputationData,
                        authorizeAddress: e.target.value,
                      })
                    }
                    placeholder="0x... (SupplyChain contract address)"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAuthorizeAddress} className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Authorize
                  </Button>
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Authorize SupplyChain contract to call recordTransactionSuccess/Failure
                </AlertDescription>
              </Alert>
            </div>

            {/* Verify Review Section */}
            <div className="border-b pb-4 space-y-3">
              <h4 className="font-semibold text-sm">Verify Review</h4>
              {lastReviewId && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    💡 Last review created: Review ID <strong>#{lastReviewId}</strong> - Click the field below to auto-fill
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reviewId">Review ID</Label>
                  <Input
                    id="reviewId"
                    value={reputationData.reviewId}
                    onChange={(e) =>
                      setReputationData({
                        ...reputationData,
                        reviewId: e.target.value,
                      })
                    }
                    onClick={() => {
                      if (lastReviewId) {
                        setReputationData({
                          ...reputationData,
                          reviewId: lastReviewId.toString(),
                        });
                      }
                    }}
                    placeholder="1"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleVerifyReview} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Review
                  </Button>
                </div>
              </div>
            </div>

            {/* Transaction Recording Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Transaction Recording</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recordUserAddress">User Address</Label>
                  <Input
                    id="recordUserAddress"
                    value={reputationData.userAddress}
                    onChange={(e) =>
                      setReputationData({
                        ...reputationData,
                        userAddress: e.target.value,
                      })
                    }
                    placeholder="0x..."
                    disabled={isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="recordPartnerAddress">Partner Address</Label>
                  <Input
                    id="recordPartnerAddress"
                    value={reputationData.partnerAddress}
                    onChange={(e) =>
                      setReputationData({
                        ...reputationData,
                        partnerAddress: e.target.value,
                      })
                    }
                    placeholder="0x..."
                    disabled={isPending}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button onClick={handleRecordSuccess} variant="outline" disabled={isPending}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isPending ? "Processing..." : "Record Success"}
                </Button>
                <Button onClick={handleRecordFailure} variant="outline" disabled={isPending}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {isPending ? "Processing..." : "Record Failure"}
                </Button>
              </div>

              {/* Transaction Status Message */}
              {transactionMessage && (
                <Alert className={
                  transactionMessage.type === "success" ? "bg-green-50 border-green-200" :
                    transactionMessage.type === "error" ? "bg-red-50 border-red-200" :
                      "bg-blue-50 border-blue-200"
                }>
                  {transactionMessage.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : transactionMessage.type === "error" ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  )}
                  <AlertDescription className={
                    transactionMessage.type === "success" ? "text-green-800" :
                      transactionMessage.type === "error" ? "text-red-800" :
                        "text-blue-800"
                  }>
                    {transactionMessage.text}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
