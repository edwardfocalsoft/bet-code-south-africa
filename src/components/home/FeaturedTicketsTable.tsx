import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Eye, ShoppingCart, Gift, LogIn } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BettingTicket } from "@/types";
import { useAuth } from "@/contexts/auth";
interface FeaturedTicketsTableProps {
  tickets: BettingTicket[];
  loading: boolean;
}
const FeaturedTicketsTable: React.FC<FeaturedTicketsTableProps> = ({
  tickets,
  loading
}) => {
  const {
    currentUser
  } = useAuth();
  if (loading) {
    return <div className="bg-betting-dark-gray rounded-lg p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>)}
        </div>
      </div>;
  }
  if (tickets.length === 0) {
    return <div className="bg-betting-dark-gray rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No featured tickets available at the moment.</p>
      </div>;
  }
  return <div className="bg-betting-dark-gray rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-betting-light-gray/20">
            <tr>
              <th className="text-left p-4 font-medium">Ticket</th>
              <th className="text-left p-4 font-medium">Tipster</th>
              <th className="text-left p-4 font-medium">Bookie</th>
              <th className="text-left p-4 font-medium">Price</th>
              <th className="text-left p-4 font-medium">Kickoff</th>
              <th className="text-left p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => <tr key={ticket.id} className={`border-t border-betting-light-gray/10 hover:bg-betting-light-gray/5 ${index === tickets.length - 1 ? '' : 'border-b'}`}>
                <td className="p-4">
                  <Link to={`/tickets/${ticket.id}`} className="hover:text-betting-green transition-colors">
                    <div className="font-medium">{ticket.title}</div>
                    
                  </Link>
                </td>
                <td className="p-4">
                  <Link to={`/sellers/${ticket.sellerId}`} className="hover:text-betting-green transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{ticket.sellerUsername}</span>
                      {/* Add verified checkmark here when we have seller data */}
                    </div>
                  </Link>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className="text-betting-green border-betting-green">
                    {ticket.bettingSite}
                  </Badge>
                </td>
                <td className="p-4">
                  {ticket.isFree ? <Badge className="bg-purple-600 hover:bg-purple-700">
                      Free
                    </Badge> : <span className="font-medium text-betting-green">
                      R{ticket.price.toFixed(2)}
                    </span>}
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    {formatDistanceToNow(ticket.kickoffTime, {
                  addSuffix: true
                })}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/tickets/${ticket.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    
                    {currentUser ? <Button size="sm" className="bg-betting-green hover:bg-betting-green/90" asChild>
                        <Link to={`/tickets/${ticket.id}`}>
                          {ticket.isFree ? <>
                              <Gift className="h-4 w-4 mr-1" />
                              Get
                            </> : <>
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Buy
                            </>}
                        </Link>
                      </Button> : <Button size="sm" className="bg-betting-green hover:bg-betting-green/90" asChild>
                        <Link to="/auth/login">
                          <LogIn className="h-4 w-4 mr-1" />
                          {ticket.isFree ? "Get" : "Buy"}
                        </Link>
                      </Button>}
                  </div>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
};
export default FeaturedTicketsTable;