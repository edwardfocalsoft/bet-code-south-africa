
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isValid } from "date-fns";
import { getPublicSellerStats } from "@/utils/sqlFunctions";

interface SellerInfoCardProps {
  seller: any;
  ticket: any;
}

// Define an interface for the seller stats returned by the function
interface PublicSellerStats {
  sales_count: number;
  total_sales: number;
  average_rating: number;
  win_rate: number;
  total_ratings: number;
}

const SellerInfoCard: React.FC<SellerInfoCardProps> = ({ seller, ticket }) => {
  const [sellerStats, setSellerStats] = useState({
    winRate: 0,
    ticketsSold: 0,
    memberSince: '',
    ratingScore: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);

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

  // Fetch seller stats
  useEffect(() => {
    const fetchSellerStats = async () => {
      if (!ticket?.seller_id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        console.log(`Fetching public stats for seller: ${ticket.seller_id}`);
        const statsData = await getPublicSellerStats(ticket.seller_id);
        
        console.log("Received seller stats:", statsData);
        
        if (statsData) {
          // Check if the stats data has the expected structure before using it
          const isValidStatsObject = typeof statsData === 'object' && 
            statsData !== null && 
            !Array.isArray(statsData) &&
            'win_rate' in statsData &&
            'sales_count' in statsData &&
            'average_rating' in statsData &&
            'total_ratings' in statsData;
            
          if (isValidStatsObject) {
            // Now it's safe to type assert
            const typedStats = statsData as unknown as PublicSellerStats;
            
            // Get seller profile for member since date
            const { data: sellerProfile } = await supabase
              .from("profiles")
              .select("created_at")
              .eq("id", ticket.seller_id)
              .single();
            
            setSellerStats({
              winRate: typedStats.win_rate || 0,
              ticketsSold: typedStats.sales_count || 0,
              memberSince: sellerProfile?.created_at 
                ? safeFormat(sellerProfile.created_at, 'MMMM yyyy', 'Unknown')
                : 'Unknown',
              ratingScore: typedStats.average_rating || 0,
              totalRatings: typedStats.total_ratings || 0
            });
          } else {
            console.error("Invalid stats data format:", statsData);
            // Set default values if the format is unexpected
            setSellerStats({
              winRate: 0,
              ticketsSold: 0,
              memberSince: 'Unknown',
              ratingScore: 0,
              totalRatings: 0
            });
          }
        }
      } catch (err) {
        console.error("Error fetching seller stats:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSellerStats();
  }, [ticket?.seller_id]);

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
                {sellerStats.ratingScore > 0 
                  ? `${sellerStats.ratingScore} Rating (${sellerStats.totalRatings} reviews)` 
                  : "No ratings yet"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Win Rate</p>
            <p className="font-medium">{sellerStats.winRate}%</p>
          </div>
          
          <div>
            <p className="text-muted-foreground">Tickets Sold</p>
            <p className="font-medium">{sellerStats.ticketsSold}</p>
          </div>
          
          <div>
            <p className="text-muted-foreground">Member Since</p>
            <p className="font-medium">{sellerStats.memberSince}</p>
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
