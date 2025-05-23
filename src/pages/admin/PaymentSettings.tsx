
import React from "react";
import Layout from "@/components/layout/Layout";
import WithdrawalSettingsCard from "@/components/admin/settings/WithdrawalSettingsCard";
import SEOSettingsCard from "@/components/admin/settings/SEOSettingsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PaymentSettings = () => {
  return (
    <Layout 
      requireAuth={true} 
      allowedRoles={["admin"]}
      seo={{
        title: "Admin Settings | BetCode",
        description: "Manage payment and SEO settings for BetCode."
      }}
    >
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="payment" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="payment">Payment Settings</TabsTrigger>
            <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payment">
            <div className="grid gap-6 md:grid-cols-2">
              <WithdrawalSettingsCard />
            </div>
          </TabsContent>
          
          <TabsContent value="seo">
            <div className="grid gap-6 md:grid-cols-1">
              <SEOSettingsCard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PaymentSettings;
