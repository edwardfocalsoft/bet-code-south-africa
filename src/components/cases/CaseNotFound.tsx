
import React from 'react';
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CaseNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Case not found</h2>
          <p className="text-muted-foreground mb-4">
            The case you're looking for doesn't exist or has been removed.
          </p>
          <Button
            className="bg-betting-green hover:bg-betting-green-dark"
            onClick={() => navigate("/user/cases")}
          >
            Back to Cases
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseNotFound;
