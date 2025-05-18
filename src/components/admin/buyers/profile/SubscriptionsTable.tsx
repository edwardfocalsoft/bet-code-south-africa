
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Subscription {
  id: string;
  seller_id: string;
  created_at: string;
  sellerName: string;
}

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  formatDate: (date: Date | string | undefined) => string;
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({
  subscriptions,
  formatDate,
}) => {
  return (
    <Table>
      <TableCaption>Seller subscriptions</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Seller</TableHead>
          <TableHead>Subscribed on</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.length > 0 ? (
          subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell>{subscription.sellerName}</TableCell>
              <TableCell>{formatDate(subscription.created_at)}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={2} className="text-center py-4">
              No subscriptions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
