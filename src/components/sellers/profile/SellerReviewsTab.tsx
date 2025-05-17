
import React from "react";
import { Card } from "@/components/ui/card";
import { User, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SellerReviewsTabProps {
  reviews: any[];
}

const SellerReviewsTab: React.FC<SellerReviewsTabProps> = ({ reviews }) => {
  return (
    <div className="betting-card p-6">
      <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          This seller has no reviews yet.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-betting-light-gray/20 p-4">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-betting-light-gray/30 flex items-center justify-center mr-3">
                  {review.profiles?.avatar_url ? (
                    <img 
                      src={review.profiles.avatar_url} 
                      alt={review.profiles.username} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-betting-green" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.profiles?.username || "Anonymous User"}</p>
                    <div className="flex items-center">
                      {Array.from({length: 5}).map((_, i) => (
                        <Star 
                          key={i}
                          className="h-4 w-4" 
                          fill={i < review.score ? "#eab308" : "transparent"}
                          stroke={i < review.score ? "#eab308" : "#6b7280"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </p>
                  {review.comment && (
                    <p className="mt-2">{review.comment}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerReviewsTab;
