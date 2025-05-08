
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-betting-green",
  trend,
  loading = false,
  onClick,
  className = "",
}) => {
  return (
    <Card 
      className={`betting-card ${onClick ? "cursor-pointer hover:border-betting-accent transition-colors" : ""} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="font-medium text-lg flex items-center justify-between">
          <span>{title}</span>
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
        
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            <span className={trend.positive ? "text-green-500" : "text-red-500"}>
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
