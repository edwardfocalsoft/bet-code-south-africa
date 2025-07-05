
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { downloadExcel, formatBuyersForExport } from "@/utils/excelExport";

interface BuyersHeaderProps {
  error: string | null;
  onRetry: () => void;
  buyers?: any[];
  loading?: boolean;
}

export const BuyersHeader = ({ error, onRetry, buyers = [], loading = false }: BuyersHeaderProps) => {
  const handleDownloadExcel = () => {
    const formattedData = formatBuyersForExport(buyers);
    const filename = `buyers-list-${new Date().toISOString().split('T')[0]}`;
    downloadExcel(formattedData, filename);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold">Buyers Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage and monitor all buyer accounts
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleDownloadExcel}
          disabled={loading || buyers.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Excel
        </Button>
        
        {error && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};
