
// Helper function to get status color for case badges
export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase() || '') {
    case "open":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "in_progress":
    case "in progress":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "resolved":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "refunded":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "closed":
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

// Debug function to log case data 
export const debugCases = (cases: any[] | null) => {
  if (!cases) {
    console.log("Cases is null or undefined");
    return;
  }
  
  console.log(`Number of cases: ${cases.length}`);
  if (cases.length > 0) {
    console.log("Sample case:", cases[0]);
  }
};
