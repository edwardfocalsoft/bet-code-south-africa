
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { downloadExcel, formatBuyersForExport } from "@/utils/excelExport";
import { fetchBuyersData } from "@/hooks/buyers/fetchBuyers";

interface BuyersHeaderProps {
  error: string | null;
  onRetry: () => void;
  buyers?: any[];
  loading?: boolean;
}

export const BuyersHeader = ({ error, onRetry, buyers = [], loading = false }: BuyersHeaderProps) => {
  const handleDownloadExcel = async () => {
    try {
      // Fetch ALL buyers without pagination for export
      const allBuyers = await fetchBuyersData({ 
        page: 1, 
        pageSize: 10000, // Large number to get all buyers
        fetchOnMount: false 
      });
      
      const formattedData = formatBuyersForExport(allBuyers);
      const filename = `buyers-list-${new Date().toISOString().split('T')[0]}`;
      downloadExcel(formattedData, filename);
    } catch (error) {
      console.error('Error downloading buyers data:', error);
    }
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
          disabled={loading}
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
