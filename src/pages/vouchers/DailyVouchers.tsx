
import React from "react";
import Layout from "@/components/layout/Layout";
import DailyVouchersSection from "@/components/vouchers/DailyVouchersSection";

const DailyVouchers = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <DailyVouchersSection />
      </div>
    </Layout>
  );
};

export default DailyVouchers;
