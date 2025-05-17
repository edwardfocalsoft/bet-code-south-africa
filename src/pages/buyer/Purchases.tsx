
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

type Purchase = {
  id: string;
  ticketId: string;
  title: string;
  seller: string;
  purchaseDate: string;
  amount: number;
  status: "win" | "loss" | "pending";
  sport?: string;
};

const BuyerPurchases = () => {
  const { currentUser } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
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
            profiles:seller_id (username)
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
          seller: item.profiles?.username || "Unknown Seller",
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
    
    fetchPurchases();
  }, [currentUser]);
  
  // Get current items
  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = purchases.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "win":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "loss":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Purchases</h1>
        
        <div className="bg-card rounded-md shadow">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't purchased any tickets yet</p>
              <Button className="bg-betting-green hover:bg-betting-green-dark" asChild>
                <Link to="/tickets">Browse Tickets</Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableCaption>Your purchase history</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.title}</TableCell>
                      <TableCell>{purchase.seller}</TableCell>
                      <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                      <TableCell>R{purchase.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={getStatusColor(purchase.status)}
                        >
                          {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link to={`/tickets/${purchase.ticketId}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Ticket
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center py-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BuyerPurchases;
