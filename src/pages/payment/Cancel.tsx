
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cancelTransaction } = useWallet();
  
  useEffect(() => {
    const handleCancelledPayment = async () => {
      // Get transaction ID from URL or session storage
      const transactionId = searchParams.get('transactionId') || sessionStorage.getItem('pendingTopUpId');
      
      if (transactionId) {
        // Mark transaction as cancelled in database
        await cancelTransaction(transactionId);
        // Clear pending transaction ID from session storage
        sessionStorage.removeItem('pendingTopUpId');
      }
    };
    
    handleCancelledPayment();
  }, [searchParams, cancelTransaction]);
  
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
              onClick={() => navigate("/user/wallet")}
            >
              Go to Wallet
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCancel;
