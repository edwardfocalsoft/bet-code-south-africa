
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="container mx-auto py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="rounded-full bg-red-900/20 p-3 w-16 h-16 mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
          
          <p className="text-muted-foreground mb-8">
            Your payment was cancelled. No charges have been made.
          </p>
          
          <div className="space-y-4">
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate(-1)}
            >
              Return to Previous Page
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate("/tickets")}
            >
              Browse Tickets
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCancel;
