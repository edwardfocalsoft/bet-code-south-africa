
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionsTable } from "./TransactionsTable";
import { PurchasesTable } from "./PurchasesTable";
import { SubscriptionsTable } from "./SubscriptionsTable";
import { Purchase } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [activeTab, setActiveTab] = useState("transactions");
  const isMobile = useIsMobile();

  const tabOptions = [
    { value: "transactions", label: "Transactions" },
    { value: "purchases", label: "Purchases" },
    { value: "subscriptions", label: "Subscriptions" }
  ];

  const currentTabLabel = tabOptions.find(tab => tab.value === activeTab)?.label || "Transactions";

  const renderTabContent = () => {
    switch (activeTab) {
      case "transactions":
        return (
          <TransactionsTable 
            transactions={transactions}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        );
      case "purchases":
        return (
          <PurchasesTable 
            purchases={purchases}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        );
      case "subscriptions":
        return (
          <SubscriptionsTable 
            subscriptions={subscriptions}
            formatDate={formatDate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {isMobile ? (
        <div className="space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between bg-betting-dark-gray border-betting-light-gray text-white hover:bg-betting-light-gray"
              >
                {currentTabLabel}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-full bg-betting-dark-gray border-betting-light-gray"
              align="start"
            >
              {tabOptions.map((tab) => (
                <DropdownMenuItem
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className="text-gray-300 hover:text-white hover:bg-betting-light-gray cursor-pointer"
                >
                  {tab.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div>
            {renderTabContent()}
          </div>
        </div>
      ) : (
        <Tabs defaultValue="transactions" value={activeTab} onValueChange={setActiveTab}>
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
      )}
    </>
  );
};
