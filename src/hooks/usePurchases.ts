
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export type PurchaseStatus = "win" | "loss" | "pending";

export type Purchase = {
  id: string;
  ticketId: string;
  title: string;
  seller: string;
  purchaseDate: string;
  amount: number;
  status: PurchaseStatus;
  sport?: string;
};

export function usePurchases() {
  const { currentUser } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetchPurchases();
  }, [currentUser]);
  
  const fetchPurchases = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Use specific column hints for the profiles relationship
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id, 
          price, 
          purchase_date,
          is_winner,
          ticket_id,
          tickets:ticket_id (title),
          seller:profiles!seller_id (username)
        `)
        .eq('buyer_id', currentUser.id)
        .order('purchase_date', { ascending: false });
        
      if (error) {
        console.error("Error fetching purchases:", error);
        toast.error("Failed to fetch purchases");
        return;
      }
      
      if (!data) {
        setPurchases([]);
        return;
      }
      
      // Transform data to match our Purchase type
      const purchaseData: Purchase[] = data.map(item => ({
        id: item.id,
        ticketId: item.ticket_id,
        title: item.tickets?.title || "Unknown Ticket",
        seller: item.seller?.username || "Unknown Seller",
        purchaseDate: item.purchase_date,
        amount: parseFloat(String(item.price)),
        status: item.is_winner === null ? "pending" : item.is_winner ? "win" : "loss"
      }));
      
      setPurchases(purchaseData);
    } catch (error) {
      console.error("Exception fetching purchases:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  // Pagination logic
  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = purchases.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return { 
    purchases, 
    currentItems, 
    loading, 
    currentPage, 
    totalPages, 
    handlePageChange,
    fetchPurchases
  };
}
