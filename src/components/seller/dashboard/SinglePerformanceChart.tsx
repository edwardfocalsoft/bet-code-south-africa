
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface PerformanceData {
  period: string;
  sales: number;
  revenue: number;
  avgRating: number;
}

interface SinglePerformanceChartProps {
  data: PerformanceData[];
  isLoading: boolean;
}

const SinglePerformanceChart: React.FC<SinglePerformanceChartProps> = ({ 
  data, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Card className="betting-card w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-betting-green" />
            Sales Performance
          </CardTitle>
          <CardDescription>Your monthly sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading performance data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const avgRating = data.length > 0 ? data.reduce((sum, item) => sum + item.avgRating, 0) / data.length : 0;

  return (
    <Card className="betting-card w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-betting-green" />
          Sales Performance
        </CardTitle>
        <CardDescription>
          Total Sales: {totalSales} tickets | Avg Rating: {avgRating.toFixed(1)}⭐
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="period" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number) => [value, 'Sales']}
            />
            <Bar 
              dataKey="sales" 
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SinglePerformanceChart;
