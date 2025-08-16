
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types";
import SellersTable from "@/components/admin/sellers/SellersTable";
import { Loader2 } from "lucide-react";

const AdminSellers = () => {
  const [sellers, setSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "seller")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedSellers = data.map((seller: any) => ({
        id: seller.id,
        email: seller.email,
        role: seller.role,
        username: seller.username || "No username",
        createdAt: new Date(seller.created_at),
        approved: seller.approved,
        suspended: seller.suspended,
        verified: seller.verified || false,
        loyaltyPoints: seller.loyalty_points || 0,
        avatar_url: seller.avatar_url,
        credit_balance: seller.credit_balance,
      }));

      setSellers(mappedSellers);
    } catch (error: any) {
      console.error("Error fetching tipsters:", error);
      toast.error("Failed to load tipsters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleApprove = async (sellerId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approved: true })
        .eq("id", sellerId);

      if (error) throw error;

      setSellers(sellers.map(seller => 
        seller.id === sellerId ? { ...seller, approved: true } : seller
      ));
      
      toast.success("Tipster approved successfully");
    } catch (error: any) {
      console.error("Error approving tipster:", error);
      toast.error("Failed to approve tipster");
    }
  };

  const handleSuspend = async (sellerId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ suspended: true })
        .eq("id", sellerId);

      if (error) throw error;

      setSellers(sellers.map(seller => 
        seller.id === sellerId ? { ...seller, suspended: true } : seller
      ));
      
      toast.success("Tipster suspended successfully");
    } catch (error: any) {
      console.error("Error suspending tipster:", error);
      toast.error("Failed to suspend tipster");
    }
  };

  const handleUnsuspend = async (sellerId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ suspended: false })
        .eq("id", sellerId);

      if (error) throw error;

      setSellers(sellers.map(seller => 
        seller.id === sellerId ? { ...seller, suspended: false } : seller
      ));
      
      toast.success("Tipster unsuspended successfully");
    } catch (error: any) {
      console.error("Error unsuspending tipster:", error);
      toast.error("Failed to unsuspend tipster");
    }
  };

  const handleVerify = async (sellerId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ verified: true })
        .eq("id", sellerId);

      if (error) throw error;

      setSellers(sellers.map(seller => 
        seller.id === sellerId ? { ...seller, verified: true } : seller
      ));
      
      toast.success("Tipster verified successfully");
    } catch (error: any) {
      console.error("Error verifying tipster:", error);
      toast.error("Failed to verify tipster");
    }
  };

  const handleUnverify = async (sellerId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ verified: false })
        .eq("id", sellerId);

      if (error) throw error;

      setSellers(sellers.map(seller => 
        seller.id === sellerId ? { ...seller, verified: false } : seller
      ));
      
      toast.success("Tipster unverified successfully");
    } catch (error: any) {
      console.error("Error unverifying tipster:", error);
      toast.error("Failed to unverify tipster");
    }
  };

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tipsters Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage and approve tipster accounts
            </p>
          </div>
        </div>

        <div className="bg-card rounded-md shadow">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading tipsters...</span>
            </div>
          ) : (
            <SellersTable
              sellers={sellers}
              onApprove={handleApprove}
              onSuspend={handleSuspend}
              onUnsuspend={handleUnsuspend}
              onVerify={handleVerify}
              onUnverify={handleUnverify}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminSellers;
