import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle, UserCheck, UserX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SellerStatus = "pending" | "approved" | "suspended" | "all";

const AdminSellers: React.FC = () => {
  const [sellers, setSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SellerStatus>("pending");
  const { toast } = useToast();

  const fetchSellers = async (status: SellerStatus = "pending") => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("role", "seller");
        
      if (status === "pending") {
        query = query.eq("approved", false).eq("suspended", false);
      } else if (status === "approved") {
        query = query.eq("approved", true).eq("suspended", false);
      } else if (status === "suspended") {
        query = query.eq("suspended", true);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      const formattedSellers = data.map((seller: any) => ({
        id: seller.id,
        email: seller.email,
        role: seller.role,
        username: seller.username || "Unnamed Seller",
        createdAt: new Date(seller.created_at),
        approved: seller.approved,
        suspended: seller.suspended,
        loyaltyPoints: seller.loyalty_points || 0
      }));
      
      setSellers(formattedSellers);
    } catch (error: any) {
      console.error("Error fetching sellers:", error);
      setError(error.message || "Failed to fetch sellers");
      toast({
        title: "Error",
        description: "Failed to load sellers data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers(activeTab);
  }, [activeTab]);

  const handleApproval = async (sellerId: string, approve: boolean) => {
    try {
      console.log(`Setting seller ${sellerId} approval status to: ${approve}`);
      
      // Update the seller's approval status
      const { error: updateError, data } = await supabase
        .from("profiles")
        .update({ approved: approve })
        .eq("id", sellerId)
        .select();
        
      if (updateError) {
        console.error("Error in Supabase update:", updateError);
        throw updateError;
      }
      
      console.log("Update response:", data);
      
      toast({
        title: "Success",
        description: `Seller ${approve ? "approved" : "rejected"} successfully.`,
      });
      
      // Immediately refresh the list to reflect the changes
      fetchSellers(activeTab);
    } catch (error: any) {
      console.error("Error updating seller:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update seller status.",
        variant: "destructive",
      });
    }
  };

  const handleSuspend = async (sellerId: string, suspend: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ suspended: suspend })
        .eq("id", sellerId)
        .select();
        
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: `Seller ${suspend ? "suspended" : "reinstated"} successfully.`,
        variant: suspend ? "destructive" : "default",
      });
      
      // Immediately refresh the list
      fetchSellers(activeTab);
    } catch (error: any) {
      console.error("Error updating seller:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update seller status.",
        variant: "destructive",
      });
    }
  };

  const renderSellerTable = () => {
    if (loading) {
      return Array(5).fill(0).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        </TableRow>
      ));
    }
    
    if (sellers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
            No sellers found in this category.
          </TableCell>
        </TableRow>
      );
    }
    
    return sellers.map((seller) => (
      <TableRow key={seller.id}>
        <TableCell>{seller.username}</TableCell>
        <TableCell>{seller.email}</TableCell>
        <TableCell>{seller.createdAt.toLocaleDateString()}</TableCell>
        <TableCell>
          {seller.approved ? (
            <Badge className="bg-green-600">Approved</Badge>
          ) : seller.suspended ? (
            <Badge className="bg-red-600">Suspended</Badge>
          ) : (
            <Badge variant="outline" className="text-amber-400 border-amber-400">
              Pending
            </Badge>
          )}
        </TableCell>
        <TableCell>
          {activeTab === "pending" && (
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => handleApproval(seller.id, true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleApproval(seller.id, false)}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
            </div>
          )}
          {activeTab === "approved" && (
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleSuspend(seller.id, true)}
            >
              <UserX className="h-4 w-4 mr-1" /> Suspend
            </Button>
          )}
          {activeTab === "suspended" && (
            <Button 
              size="sm"
              onClick={() => handleSuspend(seller.id, false)} 
              className="bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4 mr-1" /> Reinstate
            </Button>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Sellers</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs 
          defaultValue="pending" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as SellerStatus)}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            <div className="betting-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Sign Up Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderSellerTable()}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminSellers;
