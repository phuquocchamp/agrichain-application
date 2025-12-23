"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, ArrowUpDown } from "lucide-react";

export type SortOption = "newest" | "oldest" | "price-low" | "price-high";

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: number | null;
  onStatusFilter: (status: number | null) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalProducts: number;
  filteredCount: number;
}

export function ProductFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilter,
  sortOption,
  onSortChange,
  totalProducts,
  filteredCount,
}: ProductFiltersProps) {
  const hasActiveFilters = searchQuery !== "" || statusFilter !== null;
  const activeFilterCount =
    (searchQuery ? 1 : 0) + (statusFilter !== null ? 1 : 0);

  const handleClearFilters = () => {
    onSearchChange("");
    onStatusFilter(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search products
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-64">
          <Label htmlFor="status-filter" className="sr-only">
            Filter by status
          </Label>
          <Select
            value={statusFilter?.toString() ?? "all"}
            onValueChange={(value) =>
              onStatusFilter(value === "all" ? null : parseInt(value))
            }
          >
            <SelectTrigger id="status-filter">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="0">Produced</SelectItem>
              <SelectItem value="1">For Sale</SelectItem>
              <SelectItem value="2">Sold</SelectItem>
              <SelectItem value="3">Shipped</SelectItem>
              <SelectItem value="4">Received</SelectItem>
              <SelectItem value="5">Processed</SelectItem>
              <SelectItem value="6">Packed</SelectItem>
              <SelectItem value="7">For Sale (Retailer)</SelectItem>
              <SelectItem value="8">Purchased</SelectItem>
              <SelectItem value="9">Shipped (Retailer)</SelectItem>
              <SelectItem value="10">Received (Consumer)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="w-full md:w-64">
          <Label htmlFor="sort" className="sr-only">
            Sort by
          </Label>
          <Select
            value={sortOption}
            onValueChange={(value) => onSortChange(value as SortOption)}
          >
            <SelectTrigger id="sort">
              <div className="flex items-center">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            Showing {filteredCount} of {totalProducts} products
          </span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            </Badge>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
