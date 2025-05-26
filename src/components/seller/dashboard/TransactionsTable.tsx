
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { format } from "date-fns";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  reference_id?: string;
}

interface TransactionsTableProps {
  className?: string;
  limit?: number;
  showPagination?: boolean;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ 
  className = "", 
  limit,
  showPagination = true 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const pageSize = limit || 10; // Use limit prop or default to 10

  useEffect(() => {
    if (currentUser) {
      fetchTransactions();
    }
  }, [currentUser, currentPage, limit]);

  const fetchTransactions = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // If limit is provided, don't paginate, just get the limited results
      if (limit) {
        const { data, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', currentUser.id)
          .in('type', ['sale', 'tip'])
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setTransactions(data || []);
        setTotalPages(1);
      } else {
        // Get total count for pagination
        const { count, error: countError } = await supabase
          .from('wallet_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id)
          .in('type', ['sale', 'tip']);

        if (countError) throw countError;
        
        // Calculate total pages
        const totalRecords = count || 0;
        const calculatedTotalPages = Math.ceil(totalRecords / pageSize);
        setTotalPages(calculatedTotalPages || 1);
        
        // Fetch transactions with pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', currentUser.id)
          .in('type', ['sale', 'tip'])
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;
        
        setTransactions(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'sale':
        return <Badge className="bg-green-600">Sale</Badge>;
      case 'tip':
        return <Badge className="bg-purple-600">Tip</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  return (
    <div className={className}>
      <div className="betting-card overflow-x-auto">
        <Table>
          <TableCaption>Income from sales and tips</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  <TableCell>{getTransactionBadge(transaction.type)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right text-green-500 font-medium">
                    R {Number(transaction.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {showPagination && totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;
