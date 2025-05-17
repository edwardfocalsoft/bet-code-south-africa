
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PerformanceChartProps {
  loading: boolean;
  monthlyGrowth: number;
  data: Array<{
    name: string;
    sales: number;
  }>;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  loading, 
  monthlyGrowth, 
  data 
}) => {
  const GrowthIndicator = () => {
    if (monthlyGrowth > 0) {
      return (
        <div className="flex items-center text-sm font-normal text-green-500">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>{monthlyGrowth.toFixed(1)}% from last month</span>
        </div>
      );
    } else if (monthlyGrowth < 0) {
      return (
        <div className="flex items-center text-sm font-normal text-red-500">
          <TrendingDown className="h-4 w-4 mr-1" />
          <span>{Math.abs(monthlyGrowth).toFixed(1)}% from last month</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-sm font-normal text-muted-foreground">
          <Minus className="h-4 w-4 mr-1" />
          <span>No change from last month</span>
        </div>
      );
    }
  };

  return (
    <Card className="betting-card lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Performance Overview</span>
          <GrowthIndicator />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-betting-dark-gray/20 rounded-md">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center bg-betting-dark-gray/20 rounded-md">
              <p className="text-muted-foreground">No sales data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#333", 
                    border: "1px solid #555",
                    borderRadius: "4px"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
