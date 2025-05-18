
import React from "react";
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

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  formatDate: (date: Date | string | undefined) => string;
  formatCurrency: (amount: number) => string;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  formatDate,
  formatCurrency,
}) => {
  return (
    <Table>
      <TableCaption>Recent transactions</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
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
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(transaction.created_at)}</TableCell>
              <TableCell>{transaction.description || "No description"}</TableCell>
              <TableCell className={`text-right ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {transaction.amount > 0 ? "+" : ""}
                {formatCurrency(transaction.amount)}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">
              No transactions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
