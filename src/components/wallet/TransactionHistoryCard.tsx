
import React from "react";
import { format } from "date-fns";
import { Loader2, Plus, Minus, TrendingUp, RefreshCw } from "lucide-react";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type WalletTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: "topup" | "purchase" | "refund";
  description?: string;
  created_at: string;
};

interface TransactionHistoryCardProps {
  transactions: WalletTransaction[];
  isLoading: boolean;
}

const TransactionHistoryCard: React.FC<TransactionHistoryCardProps> = ({
  transactions,
  isLoading,
}) => {
  const getTransactionColor = (type: string, amount: number) => {
    if (type === "topup") return "text-green-500";
    if (type === "refund" && amount > 0) return "text-green-500";
    return "text-red-500";
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "topup":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "purchase":
        return <Minus className="h-4 w-4 text-red-500" />;
      case "refund":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTransactionStatus = (type: string, amount: number) => {
    if (type === "topup") return "Credit Added";
    if (type === "refund" && amount > 0) return "Refund Received";
    if (type === "refund" && amount < 0) return "Refund Issued";
    return "Purchase";
  };

  return (
    <Card className="betting-card">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your recent wallet transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions && transactions.length > 0 ? (
          <Table>
            <TableCaption>Your wallet transaction history</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    <Badge 
                      variant="outline" 
                      className={
                        transaction.type === 'topup' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : transaction.type === 'refund'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }
                    >
                      {getTransactionStatus(transaction.type, transaction.amount)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.created_at), "PPP")}
                  </TableCell>
                  <TableCell>
                    {transaction.description || "No description"}
                  </TableCell>
                  <TableCell className={`text-right ${getTransactionColor(transaction.type, transaction.amount)}`}>
                    {transaction.amount > 0 ? "+" : ""}R {Math.abs(transaction.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-betting-green mb-4" />
            ) : (
              <>
                <p className="text-lg font-medium">No transactions yet</p>
                <p className="text-muted-foreground mt-1">
                  Add credits to your account to start using the platform
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistoryCard;
