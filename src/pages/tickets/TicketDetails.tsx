
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2,
  AlertCircle,
  Calendar,
  User,
  Clock,
  TrendingUp,
  Star,
  Share2 
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import ShareTicket from "@/components/tickets/ShareTicket";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTicket } from "@/hooks/useSupabase";

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { ticket, loading, error } = useTicket(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase tickets.",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(true);
    
    try {
      // In production, this would be an actual Supabase insert
      // await supabase.from("purchases").insert({
      //   ticket_id: ticket?.id,
      //   buyer_id: user.id,
      //   seller_id: ticket?.sellerId,
      //   price: ticket?.price || 0,
      // });

      toast({
        title: "Purchase Successful",
        description: "You now have access to this ticket.",
      });

      // Simulate success for now
      setTimeout(() => {
        setPurchasing(false);
      }, 1500);
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-betting-green" />
          <p className="mt-4 text-lg text-muted-foreground">Loading ticket details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !ticket) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-betting-accent" />
          <h2 className="text-xl font-medium mt-4">Ticket Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The ticket you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-6 bg-betting-green hover:bg-betting-green-dark" asChild>
            <Link to="/tickets">Browse Tickets</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const isSeller = user?.id === ticket.sellerId;
  const isPastKickoff = new Date() > new Date(ticket.kickoffTime);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-4">
          <Link to="/tickets" className="text-betting-green hover:underline flex items-center gap-1 text-sm">
            &larr; Back to tickets
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="betting-card mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{ticket.title}</h1>
                      {ticket.isFree && (
                        <Badge className="bg-green-900/30 text-green-400 border-green-500">
                          Free
                        </Badge>
                      )}
                      
                      {isPastKickoff && (
                        <Badge variant="destructive">
                          Expired
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(ticket.kickoffTime), "PPP")}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(ticket.kickoffTime), "p")}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <Link 
                          to={`/sellers/${ticket.sellerId}`} 
                          className="text-betting-green hover:underline"
                        >
                          {ticket.sellerUsername}
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-8">
                      <Badge className="bg-betting-dark-gray text-white">
                        {ticket.bettingSite}
                      </Badge>
                      
                      {ticket.odds && (
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="h-4 w-4 text-betting-green" />
                          <span>Odds: {ticket.odds.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(isSeller || user?.role === "admin") && (
                    <ShareTicket ticketId={ticket.id} ticketTitle={ticket.title} />
                  )}
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <h3>Description</h3>
                  <p>{ticket.description}</p>
                  
                  {/* This content would only be visible to buyers */}
                  <div className="bg-betting-light-gray p-4 rounded-lg mt-6 mb-6">
                    <h3 className="mt-0">Ticket Content</h3>
                    <p className="mb-0">
                      {user ? (
                        "Content will be visible after purchase."
                      ) : (
                        "Please log in and purchase this ticket to view its content."
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t border-betting-light-gray pt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold">
                    {ticket.isFree ? (
                      <span className="text-green-400">Free</span>
                    ) : (
                      <>R {ticket.price.toFixed(2)}</>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    className="bg-betting-green hover:bg-betting-green-dark"
                    disabled={isPastKickoff || purchasing || isSeller}
                    onClick={handlePurchase}
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : ticket.isFree ? (
                      "Get for Free"
                    ) : (
                      "Purchase Ticket"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card className="betting-card mb-6">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Seller Information</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-betting-light-gray flex items-center justify-center text-xl font-bold">
                    {ticket.sellerUsername?.charAt(0).toUpperCase() || "?"}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">
                      <Link 
                        to={`/sellers/${ticket.sellerId}`} 
                        className="hover:text-betting-green"
                      >
                        {ticket.sellerUsername}
                      </Link>
                    </h4>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>4.8 Rating</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Win Rate</p>
                    <p className="font-medium">78%</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Tickets Sold</p>
                    <p className="font-medium">156</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Member Since</p>
                    <p className="font-medium">June 2023</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/sellers/${ticket.sellerId}`}>
                      View Seller Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="betting-card">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Similar Tickets</h3>
                <p className="text-muted-foreground text-center py-4">
                  This feature will be implemented soon.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetails;
