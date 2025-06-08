
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, ShieldCheck, Gift, ShoppingCart, LogIn } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BettingTicket } from "@/types";
import { useAuth } from "@/contexts/auth";

interface TicketCardProps {
  ticket: BettingTicket;
  showActions?: boolean;
  sellerVerified?: boolean;
  purchased?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  showActions = true,
  sellerVerified = false,
  purchased = false
}) => {
  const { currentUser } = useAuth();
  const isPastKickoff = new Date(ticket.kickoffTime) <= new Date();

  return (
    <Card className="betting-card h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link 
              to={`/tickets/${ticket.id}`}
              className="block hover:text-betting-green transition-colors"
            >
              <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                {ticket.title}
              </h3>
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <User className="h-4 w-4" />
              <Link 
                to={`/sellers/${ticket.sellerId}`}
                className="hover:text-betting-green transition-colors flex items-center gap-1"
              >
                <span>{ticket.sellerUsername}</span>
                {sellerVerified && (
                  <ShieldCheck className="h-3 w-3 text-blue-500" />
                )}
              </Link>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {isPastKickoff 
                  ? "Event started" 
                  : formatDistanceToNow(ticket.kickoffTime, { addSuffix: true })
                }
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Badge className="bg-betting-green hover:bg-betting-green text-white">
              {ticket.bettingSite}
            </Badge>
            
            {ticket.isFree && (
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                Free
              </Badge>
            )}
            
            {isPastKickoff && (
              <Badge variant="outline" className="text-gray-500 border-gray-500/30">
                Started
              </Badge>
            )}
            
            {purchased && (
              <Badge variant="outline" className="text-betting-green border-betting-green/30">
                Purchased
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
          {ticket.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-betting-green">
              {ticket.isFree ? "FREE" : `R${ticket.price.toFixed(2)}`}
            </div>
            {ticket.odds && (
              <div className="text-sm text-muted-foreground">
                Odds: {ticket.odds}
              </div>
            )}
          </div>
          
          {showActions && !isPastKickoff && !purchased && (
            <div className="flex gap-2">
              {currentUser ? (
                <Button 
                  size="sm" 
                  className="bg-betting-green hover:bg-betting-green/90"
                  asChild
                >
                  <Link to={`/tickets/${ticket.id}`}>
                    {ticket.isFree ? (
                      <>
                        <Gift className="h-4 w-4 mr-1" />
                        Get
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Buy
                      </>
                    )}
                  </Link>
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  className="bg-betting-green hover:bg-betting-green/90"
                  asChild
                >
                  <Link to="/auth/login">
                    <LogIn className="h-4 w-4 mr-1" />
                    {ticket.isFree ? "Get" : "Buy"}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
