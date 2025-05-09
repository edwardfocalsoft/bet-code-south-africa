
import React from "react";

interface ServiceDownMessageProps {
  isServiceDown: boolean;
}

const ServiceDownMessage: React.FC<ServiceDownMessageProps> = ({ isServiceDown }) => {
  if (!isServiceDown) return null;
  
  return (
    <p className="text-center text-sm text-amber-500">
      Our authentication service is currently experiencing issues. 
      You can try again later or contact support if the problem persists.
    </p>
  );
};

export default ServiceDownMessage;
