"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, Eye, DollarSign, Calendar } from "lucide-react";
import { formatEther } from "viem";
import { useEscrowList } from "@/hooks/useEscrowList";
import { useState } from "react";
import { EscrowDetailsModal } from "./EscrowDetailsModal";

export function ArbitratorDashboard() {
  const { getDisputedEscrows, isArbitrator } = useEscrowList();
  const [selectedEscrowId, setSelectedEscrowId] = useState<bigint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const disputedEscrows = getDisputedEscrows();

  if (!isArbitrator) {
    return null;
  }

  const handleViewDispute = (escrowId: bigint) => {
    setSelectedEscrowId(escrowId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEscrowId(null);
  };

  return (
    <>
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            Arbitrator Dashboard
          </CardTitle>
          <CardDescription>
            You have arbitrator privileges. Review and resolve disputes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="text-sm text-muted-foreground">Pending Disputes</p>
              <p className="text-3xl font-bold text-orange-600">{disputedEscrows.length}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-orange-600 opacity-20" />
          </div>

          {/* Dispute List */}
          {disputedEscrows.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Disputes</h4>
              {disputedEscrows.slice(0, 3).map((escrow) => (
                <div
                  key={escrow.escrowId.toString()}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-orange-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium">
                        Escrow #{escrow.escrowId.toString()}
                      </span>
                      <Badge variant="destructive" className="text-xs">Disputed</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatEther(escrow.amount)} ETH
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(Number(escrow.deadline) * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDispute(escrow.escrowId)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </div>
              ))}
              {disputedEscrows.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{disputedEscrows.length - 3} more disputes
                </p>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No pending disputes at the moment.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Escrow Details Modal */}
      {selectedEscrowId && (
        <EscrowDetailsModal
          escrowId={selectedEscrowId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
