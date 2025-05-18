
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { usePurchases, Purchase } from "@/hooks/usePurchases";
import { PurchasesTable } from "@/components/purchases/PurchasesTable";
import { EmptyPurchasesState } from "@/components/purchases/EmptyPurchasesState";
import { LoadingState } from "@/components/purchases/LoadingState";
import { Pagination } from "@/components/ui/pagination";
import ExpiredTicketsSection from "@/components/purchases/ExpiredTicketsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BuyerPurchases = () => {
  const { 
    purchases,
    currentItems, 
    loading, 
    currentPage, 
    totalPages, 
    handlePageChange 
  } = usePurchases();
  
  const [activeTab, setActiveTab] = useState<string>("all");
  
  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Purchases</h1>
        
        {/* Display expired tickets section first if there are any to rate */}
        {!loading && purchases.length > 0 && (
          <ExpiredTicketsSection purchases={purchases} />
        )}
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="bg-card rounded-md shadow"
        >
          <TabsList className="border-b w-full justify-start rounded-b-none px-4 pt-2">
            <TabsTrigger value="all">All Purchases</TabsTrigger>
            <TabsTrigger value="pending">Pending Result</TabsTrigger>
            <TabsTrigger value="wins">Wins</TabsTrigger>
            <TabsTrigger value="losses">Losses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {renderContent(currentItems, loading, purchases.length === 0)}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            {renderContent(
              currentItems.filter(item => item.status === "pending"),
              loading,
              purchases.filter(p => p.status === "pending").length === 0
            )}
          </TabsContent>
          
          <TabsContent value="wins" className="mt-0">
            {renderContent(
              currentItems.filter(item => item.status === "win"),
              loading,
              purchases.filter(p => p.status === "win").length === 0
            )}
          </TabsContent>
          
          <TabsContent value="losses" className="mt-0">
            {renderContent(
              currentItems.filter(item => item.status === "loss"),
              loading,
              purchases.filter(p => p.status === "loss").length === 0
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
      </div>
    </Layout>
  );
  
  function renderContent(items: Purchase[], isLoading: boolean, isEmpty: boolean) {
    if (isLoading) {
      return <LoadingState />;
    }
    
    if (isEmpty) {
      return <EmptyPurchasesState />;
    }
    
    return <PurchasesTable purchases={items} />;
  }
};

export default BuyerPurchases;
