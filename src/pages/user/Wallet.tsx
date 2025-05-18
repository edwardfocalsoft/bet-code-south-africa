
import React from "react";
import Layout from "@/components/layout/Layout";
import { useWallet } from "@/hooks/useWallet";
import CreditBalanceCard from "@/components/wallet/CreditBalanceCard";
import TransactionHistoryCard from "@/components/wallet/TransactionHistoryCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const UserWallet: React.FC = () => {
  const { creditBalance, transactions, isLoading, topUpWallet, error } = useWallet();

  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CreditBalanceCard 
              creditBalance={creditBalance}
              isLoading={isLoading}
              onTopUp={topUpWallet}
              error={error}
            />
          </div>

          <div className="lg:col-span-2">
            <TransactionHistoryCard 
              transactions={transactions}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserWallet;
