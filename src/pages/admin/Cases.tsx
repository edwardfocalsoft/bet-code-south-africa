
import React, { useState, useEffect } from "react";
import { useCases } from "@/hooks/useCases";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Import our refactored components
import CaseManagementHeader from "@/components/admin/cases/CaseManagementHeader";
import CaseFilters from "@/components/admin/cases/CaseFilters";
import CasesTable from "@/components/admin/cases/CasesTable";
import { getStatusColor, debugCases } from "@/components/admin/cases/utils";

const AdminCasesPage: React.FC = () => {
  const { userCases, isLoading, isCasesLoading, updateCaseStatus, refetchCases } = useCases();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Get userId from query params if it exists
  const urlParams = new URLSearchParams(window.location.search);
  const filterUserId = urlParams.get('userId');

  // Fetch cases on component mount and log them for debugging
  useEffect(() => {
    console.log("AdminCasesPage mounted, fetching cases...");
    refetchCases().then(() => {
      console.log("Cases refetched, current cases:", userCases);
      debugCases(userCases);
    });
  }, [refetchCases]);

  // Debug when cases data changes
  useEffect(() => {
    console.log("Cases data changed:", userCases);
    debugCases(userCases);
  }, [userCases]);

  // Filter cases based on search query and status filter
  const filteredCases = userCases?.filter((caseItem: any) => {
    if (!caseItem) return false;
    
    // Debug individual case
    console.log("Filtering case:", caseItem.id, caseItem.title, caseItem.status);
    
    const matchesSearch = searchQuery
      ? ((caseItem.case_number && caseItem.case_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
         (caseItem.title && caseItem.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
         (caseItem.profiles && getProfileName(caseItem.profiles)?.toLowerCase().includes(searchQuery.toLowerCase())))
      : true;
    
    const matchesStatus = statusFilter === "all" 
      ? true 
      : (caseItem.status && caseItem.status.toLowerCase() === statusFilter.toLowerCase());
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Helper function to safely get profile name
  const getProfileName = (profile: any): string => {
    if (!profile) return 'Unknown User';
    if (profile.error) return 'Unknown User';
    return profile.username || profile.email || 'Unknown User';
  };

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    if (!caseId || !newStatus) return;
    const success = await updateCaseStatus(caseId, newStatus);
    if (success) {
      toast.success(`Case status updated to ${newStatus}`);
    }
  };

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto py-8 px-4">
        <CaseManagementHeader 
          filterUserId={filterUserId} 
          userCases={userCases || []} 
        />
        
        <CaseFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          refetchCases={refetchCases}
        />

        <Card className="betting-card">
          <CardHeader>
            <CardTitle>Support Cases</CardTitle>
            <CardDescription>
              View and manage user reported issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CasesTable
              filteredCases={filteredCases}
              userCases={userCases}
              isLoading={isLoading}
              isCasesLoading={isCasesLoading}
              handleStatusChange={handleStatusChange}
              getStatusColor={getStatusColor}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminCasesPage;
