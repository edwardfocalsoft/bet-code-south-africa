
import React from "react";
import Layout from "@/components/layout/Layout";
import { useSellerTransactions } from "@/hooks/seller/useSellerTransactions";
import SellerTransactionsCard from "@/components/seller/transactions/SellerTransactionsCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const SellerTransactions: React.FC = () => {
  const { 
    transactions, 
    currentTransactions,
    isLoading, 
    error, 
    currentPage, 
    totalPages, 
    setCurrentPage,
    downloadTransactions
  } = useSellerTransactions();

  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Transactions</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6">
          <SellerTransactionsCard 
            transactions={transactions}
            currentTransactions={currentTransactions}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onDownload={downloadTransactions}
          />
        </div>
      </div>
    </Layout>
  );
};

export default SellerTransactions;
