import { TransactionType } from '@/hooks/useTransactionHistory';
import {
  Package,
  DollarSign,
  Truck,
  CheckCircle,
  Scissors,
  Archive,
  ShoppingCart,
  Shield,
  AlertCircle,
  User,
} from 'lucide-react';

export function getTransactionTypeIcon(type: TransactionType) {
  switch (type) {
    case TransactionType.PRODUCE:
      return Package;
    case TransactionType.SELL:
      return DollarSign;
    case TransactionType.PURCHASE:
      return ShoppingCart;
    case TransactionType.SHIP:
      return Truck;
    case TransactionType.RECEIVE:
      return CheckCircle;
    case TransactionType.PROCESS:
      return Scissors;
    case TransactionType.PACKAGE:
      return Archive;
    case TransactionType.ESCROW_CREATED:
      return Shield;
    case TransactionType.ESCROW_RELEASE:
      return CheckCircle;
    case TransactionType.ESCROW_REFUND:
      return AlertCircle;
    case TransactionType.DISPUTE_OPENED:
      return AlertCircle;
    case TransactionType.DISPUTE_RESOLVED:
      return Shield;
    case TransactionType.USER_VERIFIED:
      return User;
    default:
      return Package;
  }
}

export function getTransactionTypeColor(type: TransactionType): string {
  switch (type) {
    case TransactionType.PRODUCE:
      return 'text-green-600 bg-green-100';
    case TransactionType.SELL:
      return 'text-blue-600 bg-blue-100';
    case TransactionType.PURCHASE:
      return 'text-purple-600 bg-purple-100';
    case TransactionType.SHIP:
      return 'text-orange-600 bg-orange-100';
    case TransactionType.RECEIVE:
      return 'text-green-600 bg-green-100';
    case TransactionType.PROCESS:
      return 'text-yellow-600 bg-yellow-100';
    case TransactionType.PACKAGE:
      return 'text-indigo-600 bg-indigo-100';
    case TransactionType.ESCROW_CREATED:
      return 'text-blue-600 bg-blue-100';
    case TransactionType.ESCROW_RELEASE:
      return 'text-green-600 bg-green-100';
    case TransactionType.ESCROW_REFUND:
      return 'text-red-600 bg-red-100';
    case TransactionType.DISPUTE_OPENED:
      return 'text-red-600 bg-red-100';
    case TransactionType.DISPUTE_RESOLVED:
      return 'text-purple-600 bg-purple-100';
    case TransactionType.USER_VERIFIED:
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function formatTransactionHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export function getRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function exportToCSV(transactions: any[]): void {
  const headers = ['Hash', 'Type', 'Timestamp', 'Product Code', 'Amount', 'Status'];
  const rows = transactions.map(tx => [
    tx.hash,
    tx.type,
    new Date(tx.timestamp * 1000).toISOString(),
    tx.productCode?.toString() || '',
    tx.amount?.toString() || '',
    tx.status,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transactions-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
