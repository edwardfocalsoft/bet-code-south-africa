
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useBuyers } from "@/hooks/buyers/useBuyers";
import { BuyersHeader } from "@/components/admin/buyers/BuyersHeader";
import { BuyersStatsCards } from "@/components/admin/buyers/BuyersStatsCards";
import { BuyersFilter } from "@/components/admin/buyers/BuyersFilter";
import { BuyersTable } from "@/components/admin/buyers/BuyersTable";
import { BuyersLoading } from "@/components/admin/buyers/BuyersLoading";
import { BuyersError } from "@/components/admin/buyers/BuyersError";
import { BuyerProfileModal } from "@/components/admin/buyers/BuyerProfileModal";
import { Pagination } from "@/components/ui/pagination";
import { UseBuyersOptions } from "@/hooks/buyers/types";

const Buyers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseBuyersOptions["filters"]>({
    joinDateRange: { start: null, end: null },
    minPurchases: undefined,
    maxPurchases: undefined,
    status: "all"
  });

  const {
    buyers,
    loading,
    error,
    totalCount,
    stats,
    fetchBuyers,
    updateBuyerStatus,
    resendVerificationEmail,
  } = useBuyers({
    fetchOnMount: true,
    page: currentPage,
    pageSize,
    filters,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = (newFilters: UseBuyersOptions["filters"]) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Layout requireAuth={true} allowedRoles={["admin"]}>
        <div className="container mx-auto py-8 px-4">
          <BuyersLoading />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout requireAuth={true} allowedRoles={["admin"]}>
        <div className="container mx-auto py-8 px-4">
          <BuyersError error={error} onRetry={fetchBuyers} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto py-8 px-4">
        <BuyersHeader 
          error={error} 
          onRetry={fetchBuyers}
          buyers={buyers}
          loading={loading}
        />
        
        <BuyersStatsCards stats={stats} loading={loading} />
        
        <BuyersFilter 
          onFilterChange={handleFiltersChange}
        />
        
        <BuyersTable 
          buyers={buyers}
          updateBuyerStatus={updateBuyerStatus}
          resendVerificationEmail={resendVerificationEmail}
        />
        
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        <BuyerProfileModal
          isOpen={!!selectedBuyerId}
          onClose={() => setSelectedBuyerId(null)}
          buyerId={selectedBuyerId}
        />
      </div>
    </Layout>
  );
};

export default Buyers;
