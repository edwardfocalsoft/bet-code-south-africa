
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { Purchase } from "@/hooks/usePurchases";
import { useAuth } from "@/contexts/auth";
import RateTicketDialog from "@/components/tickets/RateTicketDialog";

interface PurchasesTableProps {
  purchases: Purchase[];
}

export function PurchasesTable({ purchases }: PurchasesTableProps) {
  const { currentUser } = useAuth();
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<{
    ticketId: string;
    sellerId: string;
    purchaseId: string;
  } | null>(null);

  const getBadgeVariant = (status: Purchase["status"]) => {
    switch (status) {
      case "win":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "loss":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending":
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  const getStatusLabel = (status: Purchase["status"]) => {
    switch (status) {
      case "win":
        return "Win";
      case "loss":
        return "Loss";
      case "pending":
      default:
        return "Pending";
    }
  };

  const handleRateClick = (ticketId: string, sellerId: string, purchaseId: string) => {
    setSelectedTicket({ ticketId, sellerId, purchaseId });
    setRateDialogOpen(true);
  };

  const handleRateSuccess = () => {
    // You might add refresh logic here
  };

  const isPastPurchase = (date: string) => {
    return new Date(date) < new Date();
  };

  return (
    <>
      <Table>
        <TableCaption>Your purchased tickets</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No purchases found
              </TableCell>
            </TableRow>
          ) : (
            purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">
                  <Link to={`/tickets/${purchase.ticketId}`} className="hover:text-betting-green">
                    {purchase.title || "Unknown Ticket"}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/sellers/${purchase.sellerId}`} className="hover:text-betting-green">
                    {purchase.seller}
                  </Link>
                </TableCell>
                <TableCell>{format(new Date(purchase.purchaseDate), "PP")}</TableCell>
                <TableCell>R {purchase.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getBadgeVariant(purchase.status)}>
                    {getStatusLabel(purchase.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/tickets/${purchase.ticketId}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    {isPastPurchase(purchase.purchaseDate) && !purchase.isRated && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => handleRateClick(purchase.ticketId, purchase.sellerId, purchase.id)}
                      >
                        <Star className="h-3 w-3 text-yellow-500" />
                        Rate
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedTicket && currentUser && (
        <RateTicketDialog
          open={rateDialogOpen}
          onOpenChange={setRateDialogOpen}
          ticketId={selectedTicket.ticketId}
          sellerId={selectedTicket.sellerId}
          buyerId={currentUser.id}
          purchaseId={selectedTicket.purchaseId}
          onSuccess={handleRateSuccess}
        />
      )}
    </>
  );
}
