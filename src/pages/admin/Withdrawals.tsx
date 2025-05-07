
import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Withdrawal } from "@/types";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type WithdrawalStatus = "pending" | "approved" | "rejected" | "completed" | "all";

interface WithdrawalWithSeller extends Withdrawal {
  sellerUsername: string;
  sellerEmail: string;
}

const AdminWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithSeller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WithdrawalStatus>("pending");
  const { toast } = useToast();

  const fetchWithdrawals = async (status: WithdrawalStatus = "pending") => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from("withdrawals")
        .select(`
          *,
          profiles:seller_id (
            username,
            email
          )
        `);
        
      if (status !== "all") {
        query = query.eq("status", status);
      }
      
      // Order by most recent first
      query = query.order("request_date", { ascending: false });
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      const formattedWithdrawals = data.map((withdrawal: any) => ({
        id: withdrawal.id,
        sellerId: withdrawal.seller_id,
        amount: parseFloat(withdrawal.amount),
        status: withdrawal.status,
        requestDate: new Date(withdrawal.request_date),
        processedDate: withdrawal.processed_date ? new Date(withdrawal.processed_date) : undefined,
        sellerUsername: withdrawal.profiles.username || "Unnamed Seller",
        sellerEmail: withdrawal.profiles.email
      }));
      
      setWithdrawals(formattedWithdrawals);
    } catch (error: any) {
      console.error("Error fetching withdrawals:", error);
      setError(error.message || "Failed to fetch withdrawals");
      toast({
        title: "Error",
        description: "Failed to load withdrawals data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals(activeTab);
  }, [activeTab]);

  const updateWithdrawalStatus = async (withdrawalId: string, newStatus: WithdrawalStatus) => {
    try {
      const updateData: any = { 
        status: newStatus 
      };
      
      if (newStatus === "approved" || newStatus === "rejected") {
        updateData.processed_date = new Date().toISOString();
      }
      
      const { error: updateError } = await supabase
        .from("withdrawals")
        .update(updateData)
        .eq("id", withdrawalId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: `Withdrawal ${newStatus} successfully.`,
      });
      
      fetchWithdrawals(activeTab);
    } catch (error: any) {
      console.error("Error updating withdrawal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update withdrawal status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-amber-400 border-amber-400">Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderWithdrawalTable = () => {
    if (loading) {
      return Array(5).fill(0).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        </TableRow>
      ));
    }
    
    if (withdrawals.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
            No withdrawal requests found in this category.
          </TableCell>
        </TableRow>
      );
    }
    
    return withdrawals.map((withdrawal) => (
      <TableRow key={withdrawal.id}>
        <TableCell>{withdrawal.sellerUsername}</TableCell>
        <TableCell>{withdrawal.sellerEmail}</TableCell>
        <TableCell>R {withdrawal.amount.toFixed(2)}</TableCell>
        <TableCell>{withdrawal.requestDate.toLocaleDateString()}</TableCell>
        <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
        <TableCell>
          {withdrawal.status === "pending" && (
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => updateWithdrawalStatus(withdrawal.id, "approved")}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => updateWithdrawalStatus(withdrawal.id, "rejected")}
              >
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
            </div>
          )}
          {withdrawal.status === "approved" && (
            <Button 
              size="sm" 
              onClick={() => updateWithdrawalStatus(withdrawal.id, "completed")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Mark Completed
            </Button>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Withdrawals</h1>
        
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
          onValueChange={(value) => setActiveTab(value as WithdrawalStatus)}
          className="mb-6"
        >
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            <div className="betting-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderWithdrawalTable()}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminWithdrawals;
