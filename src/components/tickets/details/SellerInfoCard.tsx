
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { format, isValid } from "date-fns";
import { useSellerStats } from "@/hooks/sellers/useSellerStats";

interface SellerInfoCardProps {
  seller: any;
  ticket: any;
}

const SellerInfoCard: React.FC<SellerInfoCardProps> = ({ seller, ticket }) => {
  // Using the dedicated hook for seller stats that works regardless of auth state
  const { stats, loading } = useSellerStats(ticket?.seller_id);
  
  // Helper function to safely format dates
  const safeFormat = (date: string | Date | null | undefined, formatStr: string, fallback: string = 'N/A') => {
    if (!date) return fallback;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isValid(dateObj)) return fallback;
    
    try {
      return format(dateObj, formatStr);
    } catch (error) {
      console.error("Date formatting error:", error, date);
      return fallback;
    }
  };

  // Calculate member since date
  const memberSince = ticket.profiles?.created_at
    ? safeFormat(ticket.profiles.created_at, 'MMMM yyyy')
    : 'Unknown';

  return (
    <Card className="betting-card mb-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Seller Information</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-betting-light-gray flex items-center justify-center text-xl font-bold">
            {ticket.profiles?.username?.charAt(0).toUpperCase() || "?"}
          </div>
          
          <div>
            <h4 className="font-medium">
              <Link 
                to={`/sellers/${ticket.seller_id}`} 
                className="hover:text-betting-green"
              >
                {ticket.profiles?.username || "Unknown Seller"}
              </Link>
            </h4>
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>
                {stats?.averageRating > 0 
                  ? `${stats.averageRating} Rating (${stats.totalRatings} reviews)` 
                  : "No ratings yet"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Win Rate</p>
            <p className="font-medium">{loading ? '...' : `${stats?.winRate || 0}%`}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground">Tickets Sold</p>
            <p className="font-medium">{loading ? '...' : stats?.ticketsSold || 0}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground">Member Since</p>
            <p className="font-medium">{memberSince}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full" asChild>
            <Link to={`/sellers/${ticket.seller_id}`}>
              View Seller Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerInfoCard;
