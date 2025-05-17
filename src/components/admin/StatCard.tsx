
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  subtitle?: React.ReactNode; // Changed from string to React.ReactNode to support both strings and JSX elements
  loading?: boolean;
  action?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  loading = false,
  action,
  className = "",
  valueClassName = ""
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
              <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
              {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
            </div>
            <div className="flex items-center gap-2">
              {action}
              <Icon className="h-8 w-8 text-betting-green opacity-50" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
