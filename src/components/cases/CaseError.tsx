
import React from 'react';
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CaseErrorProps {
  errorMessage: string;
}

const CaseError: React.FC<CaseErrorProps> = ({ errorMessage }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">{errorMessage}</h2>
          <Button
            className="mt-4 bg-betting-green hover:bg-betting-green-dark"
            onClick={() => navigate("/user/cases")}
          >
            Back to Cases
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseError;
