
// Utility functions for Excel export
export const downloadExcel = (data: any[], filename: string) => {
  // Convert data to CSV format
  const csvContent = convertToCSV(data);
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const convertToCSV = (data: any[]): string => {
  if (!data.length) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeaders = headers.join(',');
  
  // Create CSV data rows
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

export const formatBuyersForExport = (buyers: any[]) => {
  return buyers.map(buyer => ({
    'Username': buyer.username || 'Anonymous',
    'Email': buyer.email,
    'Joined Date': buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : '',
    'Purchases': buyer.purchasesCount || 0,
    'Last Active': buyer.lastActive ? new Date(buyer.lastActive).toLocaleDateString() : '',
    'Status': buyer.suspended ? 'Suspended' : 'Verified',
    'Credit Balance': buyer.creditBalance || 0,
    'Loyalty Points': buyer.loyaltyPoints || 0
  }));
};
