
import React from "react";
import Layout from "@/components/layout/Layout";
import { usePurchases } from "@/hooks/usePurchases";
import { PurchasesTable } from "@/components/purchases/PurchasesTable";
import { EmptyPurchasesState } from "@/components/purchases/EmptyPurchasesState";
import { LoadingState } from "@/components/purchases/LoadingState";
import { Pagination } from "@/components/ui/pagination";

const BuyerPurchases = () => {
  const { 
    currentItems, 
    loading, 
    currentPage, 
    totalPages, 
    handlePageChange 
  } = usePurchases();

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Purchases</h1>
        
        <div className="bg-card rounded-md shadow">
          {loading ? (
            <LoadingState />
          ) : currentItems.length === 0 ? (
            <EmptyPurchasesState />
          ) : (
            <>
              <PurchasesTable purchases={currentItems} />
              
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
