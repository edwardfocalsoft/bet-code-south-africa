
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { User, Ban, Check, MoreHorizontal, Activity } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";

const AdminBuyers = () => {
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5); // This would be dynamic based on total users
  const [buyers, setBuyers] = useState([
    {
      id: "1",
      username: "JohnBuyer",
      email: "john@example.com",
      approved: true,
      suspended: false,
      createdAt: "2023-05-12T10:30:00Z",
      purchasesCount: 15,
      lastActive: "2023-06-01T14:22:00Z",
    },
    {
      id: "2",
      username: "AliceSports",
      email: "alice@example.com",
      approved: true,
      suspended: false,
      createdAt: "2023-04-22T09:15:00Z",
      purchasesCount: 8,
      lastActive: "2023-05-28T11:45:00Z",
    },
    {
      id: "3",
      username: "BobBets",
      email: "bob@example.com",
      approved: false,
      suspended: true,
      createdAt: "2023-03-18T16:40:00Z",
      purchasesCount: 3,
      lastActive: "2023-03-25T08:30:00Z",
    },
    // More mock data can be added here
  ]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Here you would fetch data for the new page
  };

  const handleSuspendToggle = async (userId, currentStatus) => {
    try {
      // In a real app, this would be an API call to update the user's suspended status
      // await supabase.from("profiles").update({ suspended: !currentStatus }).eq("id", userId);
      
      setBuyers(buyers.map(buyer => 
        buyer.id === userId ? {...buyer, suspended: !currentStatus} : buyer
      ));
      
      toast({
        title: `User ${currentStatus ? "unsuspended" : "suspended"} successfully`,
        description: `User ID: ${userId}`,
      });
    } catch (error) {
      console.error("Error toggling suspend status:", error);
      toast({
        title: "Error",
        description: "Could not update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveToggle = async (userId, currentStatus) => {
    try {
      // In a real app, this would be an API call to update the user's approved status
      // await supabase.from("profiles").update({ approved: !currentStatus }).eq("id", userId);
      
      setBuyers(buyers.map(buyer => 
        buyer.id === userId ? {...buyer, approved: !currentStatus} : buyer
      ));
      
      toast({
        title: `User ${!currentStatus ? "approved" : "unapproved"} successfully`,
        description: `User ID: ${userId}`,
      });
    } catch (error) {
      console.error("Error toggling approve status:", error);
      toast({
        title: "Error",
        description: "Could not update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const viewUserActivity = (userId) => {
    // In a real app, this would navigate to user activity detail page
    toast({
      title: "View Activity",
      description: `Viewing activity for User ID: ${userId}`,
    });
  };

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Buyers</h1>
        </div>

        <div className="bg-card rounded-md shadow">
          <Table>
            <TableCaption>List of platform buyers</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Purchases</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyers.map((buyer) => (
                <TableRow key={buyer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <span>{buyer.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>{buyer.email}</TableCell>
                  <TableCell>{formatDate(buyer.createdAt)}</TableCell>
                  <TableCell>{buyer.purchasesCount}</TableCell>
                  <TableCell>{formatDate(buyer.lastActive)}</TableCell>
                  <TableCell>
                    {buyer.suspended ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : buyer.approved ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleApproveToggle(buyer.id, buyer.approved)}>
                          <Check className="mr-2 h-4 w-4" />
                          {buyer.approved ? "Remove Verification" : "Verify Account"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspendToggle(buyer.id, buyer.suspended)}>
                          <Ban className="mr-2 h-4 w-4" />
                          {buyer.suspended ? "Unsuspend Account" : "Suspend Account"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => viewUserActivity(buyer.id)}>
                          <Activity className="mr-2 h-4 w-4" />
                          View Activity
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default AdminBuyers;
