
import React from "react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface UserSummaryProps {
  createdAt?: Date;
  lastActive?: Date;
  subscriptionsCount: number;
  formatDate: (date: Date | string | undefined) => string;
}

export const UserSummary: React.FC<UserSummaryProps> = ({
  createdAt,
  lastActive,
  subscriptionsCount,
  formatDate,
}) => {
  return (
    <>
      <Separator className="my-4" />
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Member since</span>
          <span className="font-medium">{formatDate(createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Last active</span>
          <span className="font-medium">{formatDate(lastActive)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Subscriptions</span>
          <span className="font-medium">{subscriptionsCount} sellers</span>
        </div>
      </div>
    </>
  );
};
