
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Add any payment verification logic here if needed
  }, []);
  
  return (
    <Layout>
      <div className="container mx-auto py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="rounded-full bg-green-900/20 p-3 w-16 h-16 mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
          
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. You can now access your ticket content.
          </p>
          
          <div className="space-y-4">
            <Button 
              className="bg-betting-green hover:bg-betting-green-dark w-full"
              onClick={() => navigate("/buyer/purchases")}
            >
              View My Purchases
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate("/tickets")}
            >
              Browse More Tickets
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
