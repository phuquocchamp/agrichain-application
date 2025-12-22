"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  RefreshCw,
  Search,
  Shield,
  AlertCircle,
  Eye,
  Loader2,
  Filter,
} from "lucide-react";
import { formatEther } from "viem";
import { useEscrowList, type EscrowStatus, type EscrowRole } from "@/hooks/useEscrowList";
import { DISPUTE_STATUS_LABELS } from "@/lib/contracts-wagmi";
import { EscrowDetailsModal } from "./EscrowDetailsModal";
import { ArbitratorDashboard } from "./ArbitratorDashboard";

export function EscrowManagement() {
  const {
    escrows,
    isLoading,
    error,
    isArbitrator,
    refetch,
    filterByStatus,
    filterByRole,
    searchEscrows,
    getStats,
  } = useEscrowList();

  const [statusFilter, setStatusFilter] = useState<EscrowStatus | "all">("all");
  const [roleFilter, setRoleFilter] = useState<EscrowRole>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEscrowId, setSelectedEscrowId] = useState<bigint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = getStats();

  // Apply filters
  let filteredEscrows = escrows;
  if (statusFilter !== "all") {
    filteredEscrows = filterByStatus(statusFilter);
  }
  if (roleFilter !== "all") {
    filteredEscrows = filterByRole(roleFilter);
  }
  if (searchQuery.trim()) {
    filteredEscrows = searchEscrows(searchQuery);
  }

  const getStatusBadge = (status: EscrowStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "disputed":
        return <Badge variant="destructive">Disputed</Badge>;
      case "settled":
        return <Badge variant="secondary">Settled</Badge>;
    }
  };

  const getRoleBadge = (role?: EscrowRole) => {
    if (!role) return null;

    const colors = {
      buyer: "bg-blue-500",
      seller: "bg-purple-500",
      arbitrator: "bg-orange-500",
      all: "bg-gray-500",
    };

    return (
      <Badge variant="outline" className={`${colors[role]} text-white`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const handleViewDetails = (escrowId: bigint) => {
    setSelectedEscrowId(escrowId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEscrowId(null);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading escrows: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Arbitrator Dashboard Widget */}
      <ArbitratorDashboard />

      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Escrows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disputed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.disputed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Settled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.settled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Escrow Management</CardTitle>
              <CardDescription>
                View and manage all escrows
                {isArbitrator && " (Arbitrator Mode)"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Escrow ID, Product Code, or Address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EscrowStatus | "all")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as EscrowRole)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Shield className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="buyer">As Buyer</SelectItem>
                <SelectItem value="seller">As Seller</SelectItem>
                {isArbitrator && <SelectItem value="arbitrator">As Arbitrator</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escrow ID</TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Loading escrows...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredEscrows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">
                        No escrows found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEscrows.map((escrow) => (
                    <TableRow key={escrow.escrowId.toString()}>
                      <TableCell className="font-mono">#{escrow.escrowId.toString()}</TableCell>
                      <TableCell className="font-mono">#{escrow.productCode.toString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatEther(escrow.amount)} ETH
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(escrow.status)}</TableCell>
                      <TableCell>{getRoleBadge(escrow.userRole)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(Number(escrow.deadline) * 1000).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(escrow.escrowId)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results count */}
          {!isLoading && filteredEscrows.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredEscrows.length} of {escrows.length} escrows
            </p>
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
    </div>
  );
}
