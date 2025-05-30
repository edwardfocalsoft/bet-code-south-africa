
import React from "react";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import SellerCard from "@/components/sellers/SellerCard";
import { Seller } from "@/types";

interface TopSellersSectionProps {
  sellers: Seller[];
  loading: boolean;
}

const TopSellersSection: React.FC<TopSellersSectionProps> = ({
  sellers,
  loading,
}) => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-betting-green" />
            <h2 className="text-2xl font-medium">Top Performing Sellers</h2>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="betting-card animate-pulse">
                <div className="h-40 bg-betting-light-gray rounded"></div>
              </div>
            ))}
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No top sellers available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.slice(0, 3).map((seller, index) => (
              <SellerCard 
                key={seller.id} 
                seller={{
                  ...seller,
                  ranking: index + 1
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopSellersSection;
