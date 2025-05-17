
import React, { ReactNode } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number | null | undefined;
  icon: ReactNode;
  loading: boolean;
  link?: {
    text: string;
    to: string;
  };
  subtitle?: ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  loading,
  link,
  subtitle,
}) => {
  return (
    <Card className="betting-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-10 w-16" />
        ) : (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{value !== null ? value : "0"}</p>
              {link && (
                <Link to={link.to} className="text-xs hover:underline text-betting-green">
                  {link.text}
                </Link>
              )}
              {subtitle && subtitle}
            </div>
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
