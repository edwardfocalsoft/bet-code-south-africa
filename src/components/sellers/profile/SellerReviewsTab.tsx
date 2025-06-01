
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { User, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Pagination } from "@/components/ui/pagination";

interface SellerReviewsTabProps {
  reviews: any[];
}

const SellerReviewsTab: React.FC<SellerReviewsTabProps> = ({ reviews }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Calculate pagination
  const { paginatedReviews, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const paginatedReviews = reviews.slice(startIndex, endIndex);
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);
    
    return { paginatedReviews, totalPages };
  }, [reviews, currentPage, reviewsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of reviews section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="betting-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {Math.min(reviewsPerPage, reviews.length)} of {reviews.length} reviews
          </div>
        )}
      </div>
      
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          This seller has no reviews yet.
        </p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {paginatedReviews.map((review) => (
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-4"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SellerReviewsTab;
