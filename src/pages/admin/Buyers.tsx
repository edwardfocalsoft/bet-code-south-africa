
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Pagination } from "@/components/ui/pagination";
import { BuyersHeader } from "@/components/admin/buyers/BuyersHeader";
import { BuyersTable } from "@/components/admin/buyers/BuyersTable";
import { BuyersLoading } from "@/components/admin/buyers/BuyersLoading";
import { BuyersError } from "@/components/admin/buyers/BuyersError";
import { useBuyers } from "@/hooks/useBuyers";
import { useToast } from "@/hooks/use-toast";

const AdminBuyers = () => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const { 
    buyers, 
    loading, 
    error, 
    totalCount, 
    updateBuyerStatus,
    fetchBuyers
  } = useBuyers({ 
    page: currentPage, 
    pageSize,
    fetchOnMount: true // Ensure data is fetched when component mounts
  });

  // Force data refresh when component mounts
  useEffect(() => {
    fetchBuyers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryFetch = () => {
    fetchBuyers();
    toast({
      title: "Refreshing",
      description: "Attempting to reload buyers data...",
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container px-4 py-8 mx-auto">
        <BuyersHeader error={error} onRetry={retryFetch} />

        {error && <BuyersError error={error} onRetry={retryFetch} />}

        <div className="bg-card rounded-md shadow">
          {loading ? (
            <BuyersLoading />
          ) : (
            <BuyersTable 
              buyers={buyers} 
              updateBuyerStatus={updateBuyerStatus} 
            />
          )}
          
          <div className="flex items-center justify-center py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminBuyers;
