
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  subtitle?: string;
  loading?: boolean;
  action?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  loading = false,
  action,
  className = "",
  iconClassName = "text-betting-green opacity-50"
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
