
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Purchase as AppPurchase } from "@/types";
import { format } from "date-fns";

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  seller_id: string;
  created_at: string;
  sellerName: string;
}

// Define our local Purchase type that matches what we get from the database
interface DbPurchase {
  id: string;
  price: number;
  purchase_date: string;
  ticket_title: string;
}

export const useBuyerData = () => {
  const [buyer, setBuyer] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [purchases, setPurchases] = useState<AppPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBuyerData = async (buyerId: string) => {
    if (!buyerId) return;
    
    setLoading(true);
    
    try {
      // Fetch buyer profile
      const { data: buyerData, error: buyerError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", buyerId)
        .single();
        
      if (buyerError) throw buyerError;
      
      if (buyerData) {
        setBuyer({
          id: buyerData.id,
          email: buyerData.email,
          username: buyerData.username || "Anonymous",
          role: buyerData.role,
          createdAt: new Date(buyerData.created_at),
          approved: buyerData.approved || false,
          suspended: buyerData.suspended || false,
          lastActive: buyerData.updated_at ? new Date(buyerData.updated_at) : new Date(buyerData.created_at),
          loyaltyPoints: buyerData.loyalty_points || 0,
          credit_balance: buyerData.credit_balance || 0,
          // Add these aliases for backward compatibility
          creditBalance: buyerData.credit_balance || 0,
        });
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", buyerId)
        .order("created_at", { ascending: false });
        
      if (transactionsError) throw transactionsError;
      console.log("Transactions fetched:", transactionsData?.length || 0);
      setTransactions(transactionsData || []);

      // Fetch subscriptions with seller names using a join
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from("subscriptions")
        .select(`
          id,
          seller_id,
          buyer_id,
          created_at,
          profiles!seller_id(username)
        `)
        .eq("buyer_id", buyerId);
        
      if (subscriptionsError) throw subscriptionsError;
      console.log("Subscriptions fetched:", subscriptionsData?.length || 0);
      
      const mappedSubscriptions = (subscriptionsData || []).map((sub: any) => ({
        id: sub.id,
        seller_id: sub.seller_id,
        created_at: sub.created_at,
        sellerName: sub.profiles?.username || "Unknown Seller"
      }));
      
      setSubscriptions(mappedSubscriptions);

      // Fetch purchases with ticket titles
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("purchases")
        .select(`
          id, 
          price, 
          purchase_date,
          ticket_id,
          buyer_id,
          seller_id,
          tickets!ticket_id(title)
        `)
        .eq("buyer_id", buyerId)
        .order("purchase_date", { ascending: false });
        
      if (purchasesError) throw purchasesError;
      console.log("Purchases fetched:", purchasesData?.length || 0);
      
      // Transform the purchases data to match the AppPurchase type from the types/index.ts
      const mappedPurchases: AppPurchase[] = (purchasesData || []).map((purchase: any) => ({
        id: purchase.id,
        ticketId: purchase.ticket_id,
        buyerId: purchase.buyer_id,
        sellerId: purchase.seller_id,
        price: purchase.price,
        purchaseDate: purchase.purchase_date,
        // These fields are optional in the Purchase type from types/index.ts
        isWinner: null,
        isRated: false,
      }));
      
      setPurchases(mappedPurchases);
      
      return true;
    } catch (error) {
      console.error("Error fetching buyer data:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`;
  };

  return {
    buyer,
    transactions,
    subscriptions,
    purchases,
    loading,
    fetchBuyerData,
    formatDate,
    formatCurrency
  };
};
