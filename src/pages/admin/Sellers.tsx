
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, UserCheck, UserX, ShieldCheck } from "lucide-react";
import { useSellers } from "@/hooks/useSellers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SellersTable from "@/components/admin/sellers/SellersTable";

const AdminSellers = () => {
  const { sellers, loading, error, fetchSellers } = useSellers({ 
    fetchOnMount: true, 
    limit: 100, 
    sortBy: "created_at" 
  });
  
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Force refresh when component mounts
  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const updateSellerStatus = async (sellerId: string, updates: any, action: string) => {
    setUpdatingStatus(sellerId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', sellerId);

      if (error) throw error;

      toast.success(`Tipster ${action} successfully`);
      fetchSellers(); // Refresh the list
    } catch (error: any) {
      console.error(`Error ${action} tipster:`, error);
      toast.error(`Failed to ${action} tipster: ${error.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleApprove = (sellerId: string) => {
    updateSellerStatus(sellerId, { approved: true }, 'approved');
  };

  const handleSuspend = (sellerId: string) => {
    updateSellerStatus(sellerId, { suspended: true }, 'suspended');
  };

  const handleUnsuspend = (sellerId: string) => {
    updateSellerStatus(sellerId, { suspended: false }, 'unsuspended');
  };

  const handleVerify = (sellerId: string) => {
    updateSellerStatus(sellerId, { verified: true }, 'verified');
  };

  const handleUnverify = (sellerId: string) => {
    updateSellerStatus(sellerId, { verified: false }, 'unverified');
  };

  const pendingSellers = sellers.filter(seller => !seller.approved);
  const approvedSellers = sellers.filter(seller => seller.approved && !seller.suspended);
  const suspendedSellers = sellers.filter(seller => seller.suspended);
  const verifiedSellers = sellers.filter(seller => seller.verified);

  if (error) {
    return (
      <Layout requireAuth={true} allowedRoles={["admin"]}>
        <div className="container mx-auto py-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-red-500 mb-4">Error loading tipsters: {error}</p>
              <Button onClick={fetchSellers}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tipster Management</h1>
          <Button onClick={fetchSellers} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Total Tipsters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <UserCheck className="mr-2 h-4 w-4" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedSellers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{verifiedSellers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <UserX className="mr-2 h-4 w-4" />
                Suspended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suspendedSellers.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tipsters</CardTitle>
            <CardDescription>
              Manage tipster accounts, approvals, verification status, and suspensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">
                  Pending ({pendingSellers.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedSellers.length})
                </TabsTrigger>
                <TabsTrigger value="verified">
                  Verified ({verifiedSellers.length})
                </TabsTrigger>
                <TabsTrigger value="suspended">
                  Suspended ({suspendedSellers.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-4">
                <SellersTable
                  sellers={pendingSellers}
                  onApprove={handleApprove}
                  onSuspend={handleSuspend}
                  onUnsuspend={handleUnsuspend}
                  onVerify={handleVerify}
                  onUnverify={handleUnverify}
                />
              </TabsContent>
              
              <TabsContent value="approved" className="mt-4">
                <SellersTable
                  sellers={approvedSellers}
                  onApprove={handleApprove}
                  onSuspend={handleSuspend}
                  onUnsuspend={handleUnsuspend}
                  onVerify={handleVerify}
                  onUnverify={handleUnverify}
                />
              </TabsContent>

              <TabsContent value="verified" className="mt-4">
                <SellersTable
                  sellers={verifiedSellers}
                  onApprove={handleApprove}
                  onSuspend={handleSuspend}
                  onUnsuspend={handleUnsuspend}
                  onVerify={handleVerify}
                  onUnverify={handleUnverify}
                />
              </TabsContent>
              
              <TabsContent value="suspended" className="mt-4">
                <SellersTable
                  sellers={suspendedSellers}
                  onApprove={handleApprove}
                  onSuspend={handleSuspend}
                  onUnsuspend={handleUnsuspend}
                  onVerify={handleVerify}
                  onUnverify={handleUnverify}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminSellers;
