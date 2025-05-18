
import React, { useState } from "react";
import { format } from "date-fns";
import { Purchase } from "@/hooks/usePurchases";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import RateTicketDialog from "@/components/tickets/RateTicketDialog";
import { useAuth } from "@/contexts/auth";

interface ExpiredTicketsSectionProps {
  purchases: Purchase[];
  emptyMessage?: string;
  onRateSuccess?: () => void;
}

const ExpiredTicketsSection: React.FC<ExpiredTicketsSectionProps> = ({
  purchases,
  emptyMessage = "No expired tickets found.",
  onRateSuccess
}) => {
  const { currentUser } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<{
    ticketId: string;
    sellerId: string;
    purchaseId: string;
  } | null>(null);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);

  // Filter for expired tickets that haven't been rated yet
  const expiredTickets = purchases.filter(purchase => 
    !purchase.isRated && 
    new Date(purchase.purchaseDate) < new Date()
  );

  const handleRateClick = (ticketId: string, sellerId: string, purchaseId: string) => {
    setSelectedTicket({ ticketId, sellerId, purchaseId });
    setRateDialogOpen(true);
  };

  const handleRateSuccess = () => {
    // Call the onRateSuccess callback if provided
    if (onRateSuccess) {
      onRateSuccess();
    }
  };

  if (expiredTickets.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Expired Tickets to Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Expired Tickets to Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expiredTickets.map((purchase) => (
            <div key={purchase.id} className="border border-border p-4 rounded-md flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{purchase.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Purchased on {format(new Date(purchase.purchaseDate), "PPP")}
                </p>
              </div>
              <Button 
                onClick={() => handleRateClick(purchase.ticketId, purchase.sellerId, purchase.id)} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4 text-yellow-500" />
                Rate Ticket
              </Button>
            </div>
          ))}
        </div>

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
      </CardContent>
    </Card>
  );
};

export default ExpiredTicketsSection;
