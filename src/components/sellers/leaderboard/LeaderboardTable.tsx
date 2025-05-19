
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
import RatingDisplay from './RatingDisplay';

export interface SellerStats {
  id: string;
  username: string;
  sales_count: number;
  total_sales: number; // Now a required field directly from the SQL function
  average_rating: number;
  rank: number;
  avatar_url?: string;
}

interface LeaderboardTableProps {
  sellers: SellerStats[];
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ sellers }) => {
  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('ZAR', 'R');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead className="text-center">Total Sales</TableHead>
            <TableHead className="text-center">Number of Sales</TableHead>
            <TableHead className="text-center">Rating</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.map((seller) => (
            <TableRow key={seller.id}>
              <TableCell className="w-16">
                <SellerRankBadge rank={seller.rank} />
              </TableCell>
              <TableCell className="font-medium">
                {seller.username}
              </TableCell>
              <TableCell className="text-center">
                <span className="text-betting-green font-semibold">
                  {formatCurrency(seller.total_sales)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className="font-semibold">{seller.sales_count}</span>
              </TableCell>
              <TableCell className="text-center">
                <RatingDisplay rating={seller.average_rating} />
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;
