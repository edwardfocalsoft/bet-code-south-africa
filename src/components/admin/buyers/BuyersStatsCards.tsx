
import React from "react";
import { Users, TrendingUp, Clock } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { BuyerStats } from "@/hooks/buyers/types";

interface BuyersStatsCardsProps {
  stats: BuyerStats;
  loading: boolean;
}

export const BuyersStatsCards: React.FC<BuyersStatsCardsProps> = ({ stats, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
      <StatCard
        title="Total Buyers"
        value={stats.totalBuyers}
        icon={Users}
        loading={loading}
      />
      <StatCard
        title="Total Processed Amount"
        value={formatCurrency(stats.totalProcessedAmount)}
        icon={TrendingUp}
        loading={loading}
      />
      <StatCard
        title="New Buyers (Last 30 Days)"
        value={stats.newBuyersLast30Days}
        icon={Clock}
        loading={loading}
      />
    </div>
  );
};
