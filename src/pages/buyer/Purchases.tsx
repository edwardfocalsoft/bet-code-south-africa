
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { usePurchases } from "@/hooks/usePurchases";
import { PurchasesTable } from "@/components/purchases/PurchasesTable";
import { EmptyPurchasesState } from "@/components/purchases/EmptyPurchasesState";
import { LoadingState } from "@/components/purchases/LoadingState";
import { Pagination } from "@/components/ui/pagination";
import ExpiredTicketsSection from "@/components/purchases/ExpiredTicketsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isTicketExpired } from "@/utils/ticketUtils";

const BuyerPurchases = () => {
  const { 
    purchases,
    currentItems, 
    loading, 
    currentPage, 
    totalPages, 
    handlePageChange,
    fetchPurchases
  } = usePurchases();
  
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const handleRateSuccess = () => {
    // Refresh purchases data when a ticket is rated
    fetchPurchases();
  };
  
  // Filter for expired tickets that haven't been rated yet
  const expiredTicketsToRate = purchases.filter(purchase => 
    !purchase.isRated && 
    isTicketExpired(purchase.kickoffTime)
  );
  
  // Filter functions for each tab
  const getFilteredPurchases = (tab: string) => {
    switch (tab) {
      case "expired":
        return currentItems.filter(item => isTicketExpired(item.kickoffTime));
      case "active":
        return currentItems.filter(item => !isTicketExpired(item.kickoffTime));
      case "all":
      default:
        return currentItems;
    }
  };
  
  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Purchases</h1>
        
        {/* Display expired tickets section first if there are any to rate */}
        {!loading && expiredTicketsToRate.length > 0 && (
          <ExpiredTicketsSection 
            purchases={expiredTicketsToRate} 
            onRateSuccess={handleRateSuccess}
          />
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="all">All Tickets</TabsTrigger>
                <TabsTrigger value="active">Active Tickets</TabsTrigger>
                <TabsTrigger value="expired">Expired Tickets</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {renderContent(currentItems, loading, purchases.length === 0)}
              </TabsContent>
              
              <TabsContent value="active">
                {renderContent(
                  getFilteredPurchases("active"),
                  loading,
                  getFilteredPurchases("active").length === 0
                )}
              </TabsContent>
              
              <TabsContent value="expired">
                {renderContent(
                  getFilteredPurchases("expired"),
                  loading,
                  getFilteredPurchases("expired").length === 0
                )}
              </TabsContent>
            </Tabs>
            
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
  
  function renderContent(items, isLoading, isEmpty) {
    if (isLoading) {
      return <LoadingState />;
    }
    
    if (isEmpty) {
      return <EmptyPurchasesState />;
    }
    
    return <PurchasesTable purchases={items} onRateSuccess={handleRateSuccess} />;
  }
};

export default BuyerPurchases;
