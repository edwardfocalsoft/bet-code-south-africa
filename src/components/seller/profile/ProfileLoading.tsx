
import React from "react";
import { Loader2 } from "lucide-react";

const ProfileLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
    </div>
  );
};

export default ProfileLoading;
