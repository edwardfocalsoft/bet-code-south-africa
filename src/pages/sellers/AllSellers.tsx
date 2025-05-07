
import React from "react";
import Layout from "@/components/layout/Layout";
import SellerCard from "@/components/sellers/SellerCard";
import { AlertCircle } from "lucide-react";
import { useSellers } from "@/hooks/useSellers";

const AllSellers: React.FC = () => {
  const { sellers, loading } = useSellers();
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Verified Sellers</h1>
        
        <p className="text-muted-foreground mb-8">
          Browse our marketplace's verified sellers. These are experts who consistently provide high-quality betting tips and predictions.
        </p>
        
        {loading ? (
          <div className="text-center py-12">
            <p>Loading sellers...</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-betting-green opacity-50" />
            <p className="mt-4 text-betting-green text-lg">No verified sellers available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllSellers;
