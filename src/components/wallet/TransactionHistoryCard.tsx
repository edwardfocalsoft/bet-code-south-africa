
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WalletTransaction } from "@/hooks/useWallet";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

interface TransactionHistoryCardProps {
  transactions: WalletTransaction[];
  currentTransactions: WalletTransaction[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const TransactionHistoryCard: React.FC<TransactionHistoryCardProps> = ({
  transactions,
  currentTransactions,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  className
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Your recent wallet transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No transactions found.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          (() => {
                            const t = transaction.type as string;
                            if (t === 'topup' || t === 'sale') return 'bg-green-500/10 text-green-500 border-green-500/20';
                            if (t === 'refund') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
                            if (t === 'oracle') return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
                            if (t === 'bonus') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                            if (t === 'voucher') return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
                            return 'bg-red-500/10 text-red-500 border-red-500/20';
                          })()
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>{transaction.description || "No description"}</TableCell>
                    <TableCell className={`text-right ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.amount > 0 ? "+" : ""}
                      R{Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={onPageChange} 
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistoryCard;
