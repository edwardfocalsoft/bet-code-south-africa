
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";

// Mock data for purchases
const mockPurchases = [
  {
    id: "p1",
    ticketId: "t1",
    title: "Bayern Munich vs Real Madrid",
    seller: "TopPicks",
    purchaseDate: "2023-05-21T10:30:00Z",
    amount: 49.99,
    status: "win", // win, loss, pending
    sport: "Football",
  },
  {
    id: "p2",
    ticketId: "t2",
    title: "Tyson Fury vs Anthony Joshua",
    seller: "BoxingGuru",
    purchaseDate: "2023-05-19T14:20:00Z",
    amount: 29.99,
    status: "loss",
    sport: "Boxing",
  },
  {
    id: "p3",
    ticketId: "t3",
    title: "Lakers vs Celtics",
    seller: "NBAInsider",
    purchaseDate: "2023-05-17T08:45:00Z",
    amount: 19.99,
    status: "pending",
    sport: "Basketball",
  },
  // Add more mock data as needed
];

const BuyerPurchases = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(mockPurchases.length / itemsPerPage);
  
  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = mockPurchases.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "win":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "loss":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Purchases</h1>
        
        <div className="bg-card rounded-md shadow">
          <Table>
            <TableCaption>Your purchase history</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.title}</TableCell>
                  <TableCell>{purchase.seller}</TableCell>
                  <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                  <TableCell>${purchase.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={getStatusColor(purchase.status)}
                    >
                      {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link to={`/tickets/${purchase.ticketId}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Ticket
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-center py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerPurchases;
