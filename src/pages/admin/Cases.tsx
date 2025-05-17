import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import { useCases } from "@/hooks/useCases";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, ExternalLink, RefreshCw } from "lucide-react";

const AdminCasesPage: React.FC = () => {
  const { userCases, isLoading, updateCaseStatus } = useCases();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // Get userId from query params if it exists
  const urlParams = new URLSearchParams(window.location.search);
  const filterUserId = urlParams.get('userId');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "in_progress":
      case "in progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "refunded":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "closed":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  // Helper function to safely get profile name
  const getProfileName = (profiles: any): string => {
    if (!profiles) return 'Unknown User';
    if ('error' in profiles) return 'Unknown User';
    return profiles.username || profiles.email || 'Unknown User';
  };

  // Filter cases based on search query and status filter
  const filteredCases = userCases?.filter((caseItem: any) => {
    const matchesSearch = searchQuery
      ? (caseItem.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         getProfileName(caseItem.profiles)?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    const matchesStatus = statusFilter
      ? caseItem.status.toLowerCase() === statusFilter.toLowerCase()
      : true;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    await updateCaseStatus(caseId, newStatus);
  };

  // A heading to show when filtering by user ID
  const userFilterHeading = filterUserId ? (
    userCases && userCases[0] && userCases[0].profiles ? (
      <div className="mb-4 p-4 bg-betting-dark-gray rounded-md">
        <h2 className="text-xl font-semibold">
          Viewing cases for: {getProfileName(userCases[0].profiles)}
        </h2>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => navigate('/admin/cases')}
        >
          View All Cases
        </Button>
      </div>
    ) : null
  ) : null;

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Case Management</h1>
        
        {userFilterHeading}

        <Card className="betting-card mb-6">
          <CardHeader>
            <CardTitle>Filter Cases</CardTitle>
            <CardDescription>
              Search and filter support cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by case number, title, or user..."
                  className="bg-betting-light-gray border-betting-light-gray pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-betting-light-gray border-betting-light-gray">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="betting-card">
          <CardHeader>
            <CardTitle>Support Cases</CardTitle>
            <CardDescription>
              View and manage user reported issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
              </div>
            ) : filteredCases && filteredCases.length > 0 ? (
              <Table>
                <TableCaption>
                  Support case list {filteredCases.length < userCases?.length ? `(${filteredCases.length} of ${userCases?.length})` : ''}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem: any) => (
                    <TableRow key={caseItem.id} className="cursor-pointer hover:bg-betting-light-gray/10" onClick={() => navigate(`/user/cases/${caseItem.id}`)}>
                      <TableCell className="font-medium">{caseItem.case_number}</TableCell>
                      <TableCell>{caseItem.title}</TableCell>
                      <TableCell>{getProfileName(caseItem.profiles)}</TableCell>
                      <TableCell>{format(new Date(caseItem.created_at), "PPP")}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(caseItem.status)}
                        >
                          {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {caseItem.status === "open" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(caseItem.id, "in_progress");
                              }}
                            >
                              Process
                            </Button>
                          )}
                          
                          {(caseItem.status === "open" || caseItem.status === "in_progress") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/user/cases/${caseItem.id}?refund=true`);
                              }}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Refund
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/cases/${caseItem.id}`);
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg font-medium mb-2">No cases found</p>
                <p className="text-muted-foreground">
                  {(searchQuery || statusFilter || filterUserId)
                    ? "No cases match your search criteria. Try adjusting your filters."
                    : "There are no support cases in the system."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminCasesPage;
