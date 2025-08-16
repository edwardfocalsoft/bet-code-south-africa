
import React from "react";
import { Loader2 } from "lucide-react";

export const BuyersLoading = () => {
  return (
    <div className="flex justify-center items-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-betting-green mr-2" />
      <span>Loading punters...</span>
    </div>
  );
};
