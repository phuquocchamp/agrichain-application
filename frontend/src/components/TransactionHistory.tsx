"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  History,
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useTransactionHistory, TransactionType } from "@/hooks/useTransactionHistory";
import {
  getTransactionTypeIcon,
  getTransactionTypeColor,
  formatTransactionHash,
  getRelativeTime,
  formatAddress,
  exportToCSV,
} from "@/lib/transactionUtils";

export function TransactionHistory() {
  const { address } = useAccount();
  const { transactions, isLoading, error, refetch } = useTransactionHistory(address);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "type">("date");

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(tx => {
      // Filter by type
      if (filterType !== "all" && tx.type !== filterType) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          tx.hash.toLowerCase().includes(query) ||
          tx.productCode?.toString().includes(query) ||
          tx.type.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return b.timestamp - a.timestamp;
      }
      return a.type.localeCompare(b.type);
    });

  const handleExport = () => {
    exportToCSV(filteredTransactions);
  };

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Transaction History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to view transaction history.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Transaction History</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={filteredTransactions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by hash, product code, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(TransactionType).map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "type")}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="type">Sort by Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading transactions...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load transactions. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredTransactions.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {searchQuery || filterType !== "all"
                  ? "No transactions found matching your filters."
                  : "No transactions found. Start by creating or purchasing products."}
              </AlertDescription>
            </Alert>
          )}

          {/* Transactions Table */}
          {!isLoading && !error && filteredTransactions.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx, index) => {
                    const Icon = getTransactionTypeIcon(tx.type);
                    const colorClass = getTransactionTypeColor(tx.type);

                    return (
                      <TableRow key={`${tx.hash}-${index}`}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-lg ${colorClass}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{tx.type}</div>
                              {tx.productCode && (
                                <div className="text-xs text-muted-foreground">
                                  Product #{tx.productCode.toString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-mono text-xs text-muted-foreground">
                              {formatTransactionHash(tx.hash)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Block #{tx.blockNumber.toString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{getRelativeTime(tx.timestamp)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.timestamp * 1000).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tx.amount ? (
                            <span className="font-semibold">
                              {formatEther(tx.amount)} ETH
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={tx.status === 'success' ? 'default' : 'destructive'}
                            className="capitalize"
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `https://amoy.polygonscan.com/tx/${tx.hash}`,
                                '_blank'
                              )
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          {!isLoading && filteredTransactions.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
