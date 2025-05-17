
import React from "react";
import { AlertCircle } from "lucide-react";

interface TicketTableEmptyProps {
  message: string;
}

const TicketTableEmpty: React.FC<TicketTableEmptyProps> = ({ message }) => {
  return (
    <div className="text-center py-12">
      <AlertCircle className="mx-auto h-12 w-12 text-betting-green opacity-50" />
      <p className="mt-4 text-betting-green text-lg">{message}</p>
    </div>
  );
};

export default TicketTableEmpty;
