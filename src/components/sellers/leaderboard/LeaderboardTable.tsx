
import React from 'react';
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import SellerRankBadge from './SellerRankBadge';
import { formatCurrency } from '@/utils/formatting';

export interface SellerStats {
  id: string;
  username: string;
  email?: string;
  total_sales?: number;
  sales_count: number;
  average_rating?: number;
  rank: number;
  avatar_url?: string | null;
}

interface LeaderboardTableProps {
  sellers: SellerStats[];
  dataSource?: 'week' | 'month';
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ 
  sellers,
  dataSource = 'week'
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Total Sales</TableHead>
            <TableHead className="text-center">Number of Sales</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <p className="text-muted-foreground">
                  No sales data found for this period.
                </p>
              </TableCell>
            </TableRow>
          ) : (
            sellers.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell className="w-16">
                  <SellerRankBadge rank={seller.rank} />
                </TableCell>
                <TableCell className="font-medium">
                  {seller.username}
                </TableCell>
                <TableCell>
                  {seller.email || 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-betting-green font-semibold">
                    {seller.total_sales !== undefined 
                      ? formatCurrency(seller.total_sales) 
                      : 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-semibold">{seller.sales_count}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    to={`/sellers/${seller.id}`}
                    className="text-betting-green hover:underline"
                  >
                    View Profile
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;
