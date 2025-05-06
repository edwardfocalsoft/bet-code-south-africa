
import React from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  CalendarDays, 
  Star, 
  Trophy, 
  Ticket,
  Loader2, 
  AlertCircle 
} from "lucide-react";
import TicketsTable from "@/components/tickets/TicketsTable";
import { mockUsers, mockTickets } from "@/data/mockData";

const SellerPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const seller = mockUsers.find(user => user.id === id && user.role === "seller");
  const sellerTickets = mockTickets.filter(ticket => ticket.sellerId === id);
  
  if (!seller) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-betting-accent" />
          <h2 className="text-xl font-medium mt-4">Seller Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The seller profile you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-6 bg-betting-green hover:bg-betting-green-dark" asChild>
            <Link to="/sellers">View All Sellers</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-4">
          <Link to="/sellers" className="text-betting-green hover:underline flex items-center gap-1 text-sm">
            &larr; Back to all sellers
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Seller Profile Card */}
          <Card className="betting-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-20 w-20 rounded-full bg-betting-light-gray flex items-center justify-center text-3xl font-bold mb-4">
                  {seller.username?.charAt(0).toUpperCase() || "?"}
                </div>
                
                <h2 className="text-2xl font-bold">{seller.username}</h2>
                
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">4.8</span>
                  <span className="text-muted-foreground text-sm">(42 ratings)</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  <Badge variant="outline" className="bg-betting-dark-gray">
                    Verified Seller
                  </Badge>
                  <Badge variant="outline" className="bg-betting-dark-gray">
                    Premier Predictor
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="betting-card text-center p-4">
                  <p className="text-muted-foreground text-sm mb-1">Win Rate</p>
                  <p className="text-xl font-bold">78%</p>
                </div>
                <div className="betting-card text-center p-4">
                  <p className="text-muted-foreground text-sm mb-1">Tickets Sold</p>
                  <p className="text-xl font-bold">156</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">About</p>
                    <p className="text-muted-foreground">
                      Professional sports analyst with over 5 years of experience in South African football leagues.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Trophy className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Specialties</p>
                    <p className="text-muted-foreground">
                      PSL Predictions, Rugby, Cricket
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Ticket className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Tickets</p>
                    <p className="text-muted-foreground">
                      {sellerTickets.length} active tickets
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-muted-foreground">
                      {seller.createdAt.toLocaleDateString('en-ZA', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Seller Content Area */}
          <div className="md:col-span-2">
            <Card className="betting-card">
              <CardHeader>
                <CardTitle>Seller Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="active">
                  <TabsList className="bg-betting-black grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active Tickets</TabsTrigger>
                    <TabsTrigger value="completed">Past Tickets</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="active" className="pt-4">
                    <TicketsTable 
                      tickets={sellerTickets.filter(ticket => !ticket.isExpired)} 
                      emptyMessage="This seller has no active tickets."
                    />
                  </TabsContent>
                  
                  <TabsContent value="completed" className="pt-4">
                    <TicketsTable 
                      tickets={sellerTickets.filter(ticket => ticket.isExpired)} 
                      emptyMessage="This seller has no past tickets."
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="betting-card mt-6">
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-6 text-muted-foreground">
                  Review functionality will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerPublicProfile;
