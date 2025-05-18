
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionsTable } from "./TransactionsTable";
import { PurchasesTable } from "./PurchasesTable";
import { SubscriptionsTable } from "./SubscriptionsTable";
import { Purchase } from "@/types";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

interface Subscription {
  id: string;
  seller_id: string;
  created_at: string;
  sellerName: string;
}

interface BuyerDataTabsProps {
  transactions: Transaction[];
  purchases: Purchase[];
  subscriptions: Subscription[];
  formatDate: (date: Date | string | undefined) => string;
  formatCurrency: (amount: number) => string;
}

export const BuyerDataTabs: React.FC<BuyerDataTabsProps> = ({
  transactions,
  purchases,
  subscriptions,
  formatDate,
  formatCurrency,
}) => {
  return (
    <Tabs defaultValue="transactions">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="purchases">Purchases</TabsTrigger>
        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="transactions">
        <TransactionsTable 
          transactions={transactions}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      </TabsContent>
      
      <TabsContent value="purchases">
        <PurchasesTable 
          purchases={purchases}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      </TabsContent>
      
      <TabsContent value="subscriptions">
        <SubscriptionsTable 
          subscriptions={subscriptions}
          formatDate={formatDate}
        />
      </TabsContent>
    </Tabs>
  );
};
