
import React from "react";

interface ServerErrorProps {
  error: string;
}

const ServerError: React.FC<ServerErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="p-3 bg-destructive/15 border border-destructive rounded-md text-destructive text-sm">
      {error}
    </div>
  );
};

export default ServerError;
