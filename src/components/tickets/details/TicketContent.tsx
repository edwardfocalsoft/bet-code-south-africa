
import React from "react";
import { useAuth } from "@/contexts/auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ShareTicket from "../ShareTicket";

interface TicketContentProps {
  ticket: any;
  seller: any;
  isSeller: boolean;
  isPastKickoff: boolean;
  alreadyPurchased: boolean;
  currentUser: any;
  purchaseLoading: boolean;
  onPurchase: () => void;
}

const TicketContent: React.FC<TicketContentProps> = ({ 
  ticket, 
  seller, 
  isSeller, 
  isPastKickoff, 
  alreadyPurchased,
  currentUser, 
  purchaseLoading, 
  onPurchase 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  const showTicketCode = alreadyPurchased || isSeller;
  
  return (
    <Card className="betting-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{ticket.title}</CardTitle>
            <CardDescription>
              Posted by {seller?.username || "Unknown"} 
              • {formatDate(ticket.created_at)}
            </CardDescription>
          </div>
          
          <ShareTicket ticket={ticket} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Betting Site</p>
            <p className="font-medium">{ticket.betting_site}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Kickoff Time</p>
            <p className="font-medium">{formatDate(ticket.kickoff_time)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-medium">{ticket.is_free ? "Free" : `R${Number(ticket.price).toFixed(2)}`}</p>
          </div>
          
          {ticket.odds && (
            <div>
              <p className="text-sm text-muted-foreground">Odds</p>
              <p className="font-medium">{ticket.odds}</p>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-sm whitespace-pre-line">{ticket.description}</p>
        </div>
        
        {showTicketCode && (
          <div>
            <h3 className="font-medium mb-2">Ticket Code</h3>
            <div className="bg-betting-light-gray p-4 rounded-md">
              <pre className="text-sm whitespace-pre-wrap break-all">{ticket.ticket_code}</pre>
            </div>
          </div>
        )}
        
        {isPastKickoff && ticket.event_results && (
          <div>
            <h3 className="font-medium mb-2">Event Results</h3>
            <p className="text-sm">{ticket.event_results}</p>
          </div>
        )}
      </CardContent>
      
      {currentUser && !isSeller && !isPastKickoff && (
        <CardFooter>
          <Button
            className="w-full bg-betting-green hover:bg-betting-green-dark"
            disabled={purchaseLoading || alreadyPurchased}
            onClick={onPurchase}
          >
            {purchaseLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : alreadyPurchased ? (
              "Purchased ✓"
            ) : (
              `${ticket.is_free ? "Get for Free" : "Purchase for R" + Number(ticket.price).toFixed(2)}`
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TicketContent;
