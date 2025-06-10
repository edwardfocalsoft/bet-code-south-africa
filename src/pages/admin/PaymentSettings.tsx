
import React from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WithdrawalSettingsCard from "@/components/admin/settings/WithdrawalSettingsCard";
import DailyVouchersTab from "@/components/admin/vouchers/DailyVouchersTab";
import { Settings, Gift } from "lucide-react";

const PaymentSettings = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment & Voucher Settings</h1>
          <p className="text-muted-foreground">
            Manage payment configurations and daily voucher drops
          </p>
        </div>

        <Tabs defaultValue="withdrawals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Withdrawal Settings
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Daily Vouchers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="withdrawals">
            <WithdrawalSettingsCard />
          </TabsContent>

          <TabsContent value="vouchers">
            <DailyVouchersTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PaymentSettings;
