
import React from "react";
import Layout from "@/components/layout/Layout";
import SellerCard from "@/components/sellers/SellerCard";
import { AlertCircle, Award } from "lucide-react";
import { useSellers } from "@/hooks/useSellers";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AllSellers: React.FC = () => {
  const { sellers, loading } = useSellers();
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Verified Tipsters</h1>
          <Button className="bg-betting-green hover:bg-betting-green-dark" asChild>
            <Link to="/sellers/leaderboard">
              <Award className="mr-2 h-4 w-4" />
              Weekly Leaderboard
            </Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Browse our marketplace's verified tipsters. These are experts who consistently provide high-quality betting tips and predictions.
        </p>
        
        {loading ? (
          <div className="text-center py-12">
            <p>Loading tipsters...</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-betting-green opacity-50" />
            <p className="mt-4 text-betting-green text-lg">No verified tipsters available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller, index) => (
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
    </Layout>
  );
};

export default AllSellers;
