
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
import { Button } from "@/components/ui/button";
import { SellerTransaction } from "@/hooks/seller/useSellerTransactions";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface SellerTransactionsCardProps {
  transactions: SellerTransaction[];
  currentTransactions: SellerTransaction[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDownload: () => void;
  className?: string;
}

const SellerTransactionsCard: React.FC<SellerTransactionsCardProps> = ({
  transactions,
  currentTransactions,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onDownload,
  className
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (e) {
      return "Invalid date";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
      case 'tip':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'topup':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'purchase':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Your financial transaction history ({transactions.length} total transactions)
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload}
            disabled={transactions.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getTypeColor(transaction.type)}
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.description || "No description"}</TableCell>
                    <TableCell className={`text-right font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
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

export default SellerTransactionsCard;
