
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { User, Ban, Check, MoreHorizontal, Activity, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useBuyers } from "@/hooks/useBuyers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AdminBuyers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const { 
    buyers, 
    loading, 
    error, 
    totalCount, 
    updateBuyerStatus,
    fetchBuyers
  } = useBuyers({ 
    page: currentPage, 
    pageSize 
  });

  const retryFetch = () => {
    fetchBuyers();
    toast({
      title: "Refreshing",
      description: "Attempting to reload buyers data...",
    });
  };

  // Add a useEffect to refetch buyers if there's an error
  useEffect(() => {
    if (error) {
      // Retry loading after a short delay
      const timer = setTimeout(() => {
        fetchBuyers();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [error, fetchBuyers]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSuspendToggle = async (userId: string, currentStatus: boolean) => {
    const success = await updateBuyerStatus(userId, { suspended: !currentStatus });
    
    if (success) {
      toast({
        title: `User ${currentStatus ? "unsuspended" : "suspended"} successfully`,
        description: `User ID: ${userId}`,
      });
    }
  };

  const handleApproveToggle = async (userId: string, currentStatus: boolean) => {
    const success = await updateBuyerStatus(userId, { approved: !currentStatus });
    
    if (success) {
      toast({
        title: `User ${!currentStatus ? "approved" : "unapproved"} successfully`,
        description: `User ID: ${userId}`,
      });
    }
  };

  const viewUserActivity = (userId: string) => {
    navigate(`/admin/cases?userId=${userId}`);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return format(date, "MMM d, yyyy");
  };

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Buyers</h1>
          {error && (
            <Button onClick={retryFetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-card rounded-md shadow">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-betting-green mr-2" />
              <span>Loading buyers...</span>
            </div>
          ) : (
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
                {buyers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No buyers found
                    </TableCell>
                  </TableRow>
                ) : (
                  buyers.map((buyer) => (
                    <TableRow key={buyer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <span>{buyer.username || buyer.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{buyer.email}</TableCell>
                      <TableCell>{formatDate(buyer.createdAt)}</TableCell>
                      <TableCell>{buyer.purchasesCount || 0}</TableCell>
                      <TableCell>{buyer.lastActive ? formatDate(buyer.lastActive) : formatDate(buyer.createdAt)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleApproveToggle(buyer.id, buyer.approved || false)}>
                              <Check className="mr-2 h-4 w-4" />
                              {buyer.approved ? "Remove Verification" : "Verify Account"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSuspendToggle(buyer.id, buyer.suspended || false)}>
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
                  ))
                )}
              </TableBody>
            </Table>
          )}
          
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
