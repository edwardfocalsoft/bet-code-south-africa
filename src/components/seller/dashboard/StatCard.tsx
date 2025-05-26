
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface TrendData {
  value: number;
  isPositive: boolean;
}

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  subtitle?: string;
  loading?: boolean;
  action?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  trend?: TrendData;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  loading = false,
  action,
  className = "",
  iconClassName = "text-betting-green opacity-50",
  trend
}) => {
  return (
    <Card className={`betting-card ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-10 w-24" />
        ) : (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              {trend && (
                <p className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {action}
              <Icon className={`h-8 w-8 ${iconClassName}`} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
