
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export interface SellerTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  reference_id?: string;
}

export const useSellerTransactions = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<SellerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const fetchTransactions = async () => {
    if (!currentUser?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setTransactions(data || []);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to fetch transactions");
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchTransactions();
    }
  }, [currentUser?.id]);

  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const currentTransactions = transactions.slice(startIndex, startIndex + transactionsPerPage);

  const downloadTransactions = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to download");
      return;
    }

    try {
      // Create CSV content
      const headers = ["Date", "Type", "Description", "Amount", "Reference ID"];
      const csvContent = [
        headers.join(","),
        ...transactions.map(transaction => [
          new Date(transaction.created_at).toLocaleDateString(),
          transaction.type,
          `"${transaction.description || ''}"`,
          transaction.amount,
          transaction.reference_id || ''
        ].join(","))
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Transactions downloaded successfully");
    } catch (err) {
      console.error("Error downloading transactions:", err);
      toast.error("Failed to download transactions");
    }
  };

  return {
    transactions,
    currentTransactions,
    isLoading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
    downloadTransactions,
    refetch: fetchTransactions
  };
};
