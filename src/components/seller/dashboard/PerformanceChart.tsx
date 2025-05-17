
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

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

  // Format the sales data for display in tooltips
  const formatSales = (value: number) => {
    return `$${value.toFixed(2)}`;
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
            <ChartContainer
              config={{
                sales: {
                  label: 'Monthly Sales',
                  color: '#10B981'
                }
              }}
            >
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
                  <XAxis 
                    dataKey="name" 
                    stroke="#888"
                    tickFormatter={(value) => value}
                  />
                  <YAxis 
                    stroke="#888"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Month
                                </span>
                                <span className="font-bold text-foreground">
                                  {payload[0].payload.name}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Sales
                                </span>
                                <span className="font-bold text-foreground">
                                  ${typeof payload[0].value === 'number' ? payload[0].value.toFixed(2) : parseFloat(String(payload[0].value)).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    name="Monthly Sales"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.2} 
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
