
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CaseManagementHeaderProps {
  filterUserId: string | null;
  userCases: any[];
}

const CaseManagementHeader: React.FC<CaseManagementHeaderProps> = ({ 
  filterUserId, 
  userCases 
}) => {
  const navigate = useNavigate();
  
  // Helper function to safely get profile name
  const getProfileName = (profile: any): string => {
    if (!profile) return 'Unknown User';
    if (profile.error) return 'Unknown User';
    return profile.username || profile.email || 'Unknown User';
  };

  if (!filterUserId || !userCases || userCases.length === 0) {
    return <h1 className="text-3xl font-bold mb-6">Case Management</h1>;
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Case Management</h1>
      <div className="mb-4 p-4 bg-betting-dark-gray rounded-md">
        <h2 className="text-xl font-semibold">
          Viewing cases for: {userCases[0]?.profiles ? getProfileName(userCases[0].profiles) : 'Unknown User'}
        </h2>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => navigate('/admin/cases')}
        >
          View All Cases
        </Button>
      </div>
    </>
  );
};

export default CaseManagementHeader;
