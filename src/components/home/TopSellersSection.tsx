
import React from "react";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import SellerCard from "@/components/sellers/SellerCard";
import { User } from "@/types";

interface TopSellersSectionProps {
  sellers: User[];
  loading: boolean;
}

const TopSellersSection: React.FC<TopSellersSectionProps> = ({
  sellers,
  loading,
}) => {
  return (
    <section className="py-16 px-4 bg-betting-black">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-medium flex items-center">
            <Award className="h-5 w-5 mr-2 text-betting-green" />
            Top Sellers
          </h2>
          <Link to="/sellers" className="text-betting-green hover:underline">
            View all sellers
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading sellers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sellers.length > 0 ? (
              sellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">No sellers available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopSellersSection;
