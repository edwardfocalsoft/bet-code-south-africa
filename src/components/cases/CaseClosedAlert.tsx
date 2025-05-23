
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CaseClosedAlertProps {
  status: string;
}

const CaseClosedAlert: React.FC<CaseClosedAlertProps> = ({ status }) => {
  const isResolved = status === 'resolved';
  
  return (
    <Alert className={`mb-6 ${isResolved ? 'bg-green-500/20 text-green-700' : 'bg-gray-500/20 text-gray-400'}`}>
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertTitle>{isResolved ? 'Case Resolved' : 'Case Closed'}</AlertTitle>
      <AlertDescription>
        {isResolved 
          ? 'This case has been marked as resolved. The issue has been addressed by our team.'
          : 'This case has been closed and is no longer active. Please create a new case if you need further assistance.'}
      </AlertDescription>
    </Alert>
  );
};

export default CaseClosedAlert;
