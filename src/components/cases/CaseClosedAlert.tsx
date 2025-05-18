
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const CaseClosedAlert: React.FC = () => {
  return (
    <Alert className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        This case is closed. No further replies can be added.
      </AlertDescription>
    </Alert>
  );
};

export default CaseClosedAlert;
