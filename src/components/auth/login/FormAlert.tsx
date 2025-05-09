
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormAlertProps {
  isServiceDown: boolean;
  errorMessage: string;
}

const FormAlert: React.FC<FormAlertProps> = ({ isServiceDown, errorMessage }) => {
  if (!isServiceDown && !errorMessage) return null;
  
  if (isServiceDown) {
    return (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center gap-2">
          Authentication service is temporarily unavailable.
          Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (errorMessage) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-sm text-red-500 animate-fade-in">
        {errorMessage}
      </div>
    );
  }
  
  return null;
};

export default FormAlert;
