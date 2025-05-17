
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { formatDate, getStatusColor, formatCurrency } from "@/utils/formatting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Purchase = {
  id: string;
  ticketId: string;
  ticketTitle: string;
  purchaseDate: string;
  price: number;
  status: 'active' | 'used' | 'expired';
};

const ITEMS_PER_PAGE = 10;

const BuyerPurchases: React.FC = () => {
  const { currentUser } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  // Mock data for demonstration purposes
  // In a real implementation, this would come from the database
  useEffect(() => {
    // Simulate fetching purchases data
    setLoading(true);
    
    const mockPurchases = [
      {
        id: "p1",
        ticketId: "t1",
        ticketTitle: "Football Match Prediction",
        purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        price: 50,
        status: 'active' as const
      },
      {
        id: "p2",
        ticketId: "t2",
        ticketTitle: "Basketball Expert Pick",
        purchaseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        price: 35,
        status: 'used' as const
      },
      {
        id: "p3", 
        ticketId: "t3",
        ticketTitle: "Tennis Grand Slam Prediction",
        purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        price: 60,
        status: 'expired' as const
      },
      // Add more mock data to demonstrate pagination
      {
        id: "p4",
        ticketId: "t4",
        ticketTitle: "Premier League Prediction",
        purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        price: 45,
        status: 'active' as const
      },
      {
        id: "p5",
        ticketId: "t5",
        ticketTitle: "Formula 1 Race Prediction",
        purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        price: 55,
        status: 'active' as const
      },
      {
        id: "p6",
        ticketId: "t6",
        ticketTitle: "Rugby Match Prediction",
        purchaseDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        price: 40,
        status: 'used' as const
      },
      {
        id: "p7",
        ticketId: "t7",
        ticketTitle: "Cricket Test Match Prediction",
        purchaseDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        price: 35,
        status: 'active' as const
      },
      {
        id: "p8",
        ticketId: "t8",
        ticketTitle: "Boxing Match Prediction",
        purchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        price: 70,
        status: 'expired' as const
      },
      {
        id: "p9",
        ticketId: "t9",
        ticketTitle: "Horse Racing Prediction",
        purchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        price: 25,
        status: 'used' as const
      },
      {
        id: "p10",
        ticketId: "t10",
        ticketTitle: "UFC Fight Prediction",
        purchaseDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        price: 65,
        status: 'active' as const
      },
      {
        id: "p11",
        ticketId: "t11",
        ticketTitle: "MLB Baseball Prediction",
        purchaseDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        price: 40,
        status: 'expired' as const
      },
      {
        id: "p12",
        ticketId: "t12",
        ticketTitle: "NHL Hockey Prediction",
        purchaseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        price: 45,
        status: 'used' as const
      }
    ];
    
    setTimeout(() => {
      setPurchases(mockPurchases);
      setLoading(false);
    }, 800);
    
    // In the future, this would be replaced with actual database query
    // const fetchPurchases = async () => {
    //   if (!currentUser) return;
    //   
    //   try {
    //     const { data, error } = await supabase
    //       .from('purchases')
    //       .select('*, tickets(title)')
    //       .eq('buyer_id', currentUser.id);
    //       
    //     if (error) throw error;
    //     setPurchases(data || []);
    //   } catch (error) {
    //     console.error('Error fetching purchases:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // 
    // fetchPurchases();
  }, [currentUser]);

  const filterPurchases = (status: string | null) => {
    if (!status) return purchases;
    return purchases.filter(purchase => purchase.status === status);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const filteredPurchases = filterPurchases(activeTab === "all" ? null : activeTab as any);
  const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE);
  
  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <Layout requireAuth={true} allowedRoles={["buyer", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">My Purchases</h1>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Purchases</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="used">Used</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
              <span className="ml-2 text-muted-foreground">Loading your purchases...</span>
            </div>
          ) : purchases.length === 0 ? (
            <Card className="betting-card">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't made any purchases yet.</p>
                <a href="/tickets" className="text-betting-green hover:underline">
                  Browse available tickets
                </a>
              </CardContent>
            </Card>
          ) : (
            <TabsContent value={activeTab}>
              <Card className="betting-card">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticket</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedPurchases.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              No purchases found in this category.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedPurchases.map((purchase) => (
                            <TableRow key={purchase.id}>
                              <TableCell className="font-medium">{purchase.ticketTitle}</TableCell>
                              <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                              <TableCell>R {purchase.price}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(purchase.status)}`}>
                                  {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <a 
                                  href={`/tickets/${purchase.ticketId}`} 
                                  className="text-betting-green hover:underline text-sm"
                                >
                                  View details
                                </a>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="py-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                              if (i === 4) pageNumber = totalPages;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }
                            
                            return (
                              <PaginationItem key={i}>
                                <PaginationLink 
                                  isActive={currentPage === pageNumber}
                                  onClick={() => handlePageChange(pageNumber)}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default BuyerPurchases;
