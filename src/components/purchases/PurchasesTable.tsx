
import React from "react";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Purchase, PurchaseStatus } from "@/hooks/usePurchases";
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
import { Button } from "@/components/ui/button";

interface PurchasesTableProps {
  purchases: Purchase[];
}

export const PurchasesTable: React.FC<PurchasesTableProps> = ({ purchases }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const getStatusColor = (status: PurchaseStatus) => {
    switch (status) {
      case "win":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "loss":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Table>
      <TableCaption>Your purchase history</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Seller</TableHead>
          <TableHead>Purchase Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((purchase) => (
          <TableRow key={purchase.id}>
            <TableCell className="font-medium">{purchase.title}</TableCell>
            <TableCell>{purchase.seller}</TableCell>
            <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
            <TableCell>R{purchase.amount.toFixed(2)}</TableCell>
            <TableCell>
              <Badge 
                variant="outline"
                className={getStatusColor(purchase.status)}
              >
                {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link to={`/tickets/${purchase.ticketId}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Ticket
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
