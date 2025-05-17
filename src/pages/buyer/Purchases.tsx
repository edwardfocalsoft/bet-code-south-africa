
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type Purchase = {
  id: string;
  ticketId: string;
  ticketTitle: string;
  purchaseDate: string;
  price: number;
  status: 'active' | 'used' | 'expired';
};

const BuyerPurchases: React.FC = () => {
  const { currentUser } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration purposes
  // In a real implementation, this would come from the database
  useEffect(() => {
    // Simulate fetching purchases data
    setLoading(true);
    
    const mockPurchases = [
      {
        id: "p1",
        ticketId: "t1",
        ticketTitle: "Football Match Prediction",
        purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        price: 50,
        status: 'active' as const
      },
      {
        id: "p2",
        ticketId: "t2",
        ticketTitle: "Basketball Expert Pick",
        purchaseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        price: 35,
        status: 'used' as const
      },
      {
        id: "p3", 
        ticketId: "t3",
        ticketTitle: "Tennis Grand Slam Prediction",
        purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        price: 60,
        status: 'expired' as const
      }
    ];
    
    setTimeout(() => {
      setPurchases(mockPurchases);
      setLoading(false);
    }, 800);
    
    // In the future, this would be replaced with actual database query
    // const fetchPurchases = async () => {
    //   if (!currentUser) return;
    //   
    //   try {
    //     const { data, error } = await supabase
    //       .from('purchases')
    //       .select('*, tickets(title)')
    //       .eq('buyer_id', currentUser.id);
    //       
    //     if (error) throw error;
    //     setPurchases(data || []);
    //   } catch (error) {
    //     console.error('Error fetching purchases:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // 
    // fetchPurchases();
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'used':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filterPurchases = (status: string | null) => {
    if (!status) return purchases;
    return purchases.filter(purchase => purchase.status === status);
  };

  return (
    <Layout requireAuth={true} allowedRoles={["buyer", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">My Purchases</h1>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Purchases</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="used">Used</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
              <span className="ml-2 text-muted-foreground">Loading your purchases...</span>
            </div>
          ) : purchases.length === 0 ? (
            <Card className="betting-card">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't made any purchases yet.</p>
                <a href="/tickets" className="text-betting-green hover:underline">
                  Browse available tickets
                </a>
              </CardContent>
            </Card>
          ) : (
            <>
              <TabsContent value="all" className="space-y-4">
                {filterPurchases(null).map(purchase => (
                  <PurchaseCard key={purchase.id} purchase={purchase} />
                ))}
              </TabsContent>
              
              <TabsContent value="active" className="space-y-4">
                {filterPurchases('active').map(purchase => (
                  <PurchaseCard key={purchase.id} purchase={purchase} />
                ))}
              </TabsContent>
              
              <TabsContent value="used" className="space-y-4">
                {filterPurchases('used').map(purchase => (
                  <PurchaseCard key={purchase.id} purchase={purchase} />
                ))}
              </TabsContent>
              
              <TabsContent value="expired" className="space-y-4">
                {filterPurchases('expired').map(purchase => (
                  <PurchaseCard key={purchase.id} purchase={purchase} />
                ))}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

interface PurchaseCardProps {
  purchase: Purchase;
}

const PurchaseCard: React.FC<PurchaseCardProps> = ({ purchase }) => {
  return (
    <Card className="betting-card">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">{purchase.ticketTitle}</h3>
            <p className="text-muted-foreground text-sm">
              Purchased on {formatDate(purchase.purchaseDate)}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end mt-4 md:mt-0">
            <span className="font-bold text-lg">R {purchase.price}</span>
            <span className={`text-xs px-2 py-1 rounded-full mt-2 ${getStatusColor(purchase.status)}`}>
              {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <a 
            href={`/tickets/${purchase.ticketId}`} 
            className="text-betting-green hover:underline text-sm"
          >
            View ticket details
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerPurchases;
