
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
import { Purchase } from "@/types";

interface PurchasesTableProps {
  purchases: Purchase[];
  formatDate: (date: Date | string | undefined) => string;
  formatCurrency: (amount: number) => string;
}

export const PurchasesTable: React.FC<PurchasesTableProps> = ({
  purchases,
  formatDate,
  formatCurrency,
}) => {
  return (
    <Table>
      <TableCaption>Recent purchases</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.length > 0 ? (
          purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{purchase.id.substring(0, 8)}...</TableCell>
              <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
              <TableCell className="text-right">{formatCurrency(purchase.price)}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-4">
              No purchases found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
