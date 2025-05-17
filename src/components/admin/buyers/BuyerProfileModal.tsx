
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, User, CreditCard, Calendar, ShoppingBag, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BuyerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerId: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

interface Subscription {
  id: string;
  seller_id: string;
  created_at: string;
  sellerName: string;
}

interface Purchase {
  id: string;
  price: number;
  purchase_date: string;
  ticket_title: string;
}

export const BuyerProfileModal = ({ isOpen, onClose, buyerId }: BuyerProfileModalProps) => {
  const [buyer, setBuyer] = useState<UserType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerData = async () => {
      if (!buyerId) return;
      
      setLoading(true);
      
      try {
        // Fetch buyer profile
        const { data: buyerData, error: buyerError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", buyerId)
          .single();
          
        if (buyerError) throw buyerError;
        
        if (buyerData) {
          setBuyer({
            id: buyerData.id,
            email: buyerData.email,
            username: buyerData.username || "Anonymous",
            role: buyerData.role,
            createdAt: new Date(buyerData.created_at),
            approved: buyerData.approved || false,
            suspended: buyerData.suspended || false,
            lastActive: buyerData.updated_at ? new Date(buyerData.updated_at) : new Date(buyerData.created_at),
            loyaltyPoints: buyerData.loyalty_points || 0,
            creditBalance: buyerData.credit_balance || 0,
          });
        }

        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("user_id", buyerId)
          .order("created_at", { ascending: false })
          .limit(10);
          
        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);

        // Fetch subscriptions with seller names
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from("subscriptions")
          .select("*, seller:seller_id(username)")
          .eq("buyer_id", buyerId);
          
        if (subscriptionsError) throw subscriptionsError;
        
        const mappedSubscriptions = (subscriptionsData || []).map(sub => ({
          id: sub.id,
          seller_id: sub.seller_id,
          created_at: sub.created_at,
          sellerName: sub.seller?.username || "Unknown Seller"
        }));
        
        setSubscriptions(mappedSubscriptions);

        // Fetch purchases with ticket titles
        const { data: purchasesData, error: purchasesError } = await supabase
          .from("purchases")
          .select("*, ticket:ticket_id(title)")
          .eq("buyer_id", buyerId)
          .order("purchase_date", { ascending: false })
          .limit(10);
          
        if (purchasesError) throw purchasesError;
        
        const mappedPurchases = (purchasesData || []).map(purchase => ({
          id: purchase.id,
          price: purchase.price,
          purchase_date: purchase.purchase_date,
          ticket_title: purchase.ticket?.title || "Unknown Ticket"
        }));
        
        setPurchases(mappedPurchases);
      } catch (error) {
        console.error("Error fetching buyer data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && buyerId) {
      fetchBuyerData();
    }
  }, [isOpen, buyerId]);

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green mr-2" />
            <span>Loading buyer data...</span>
          </div>
        ) : buyer ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span>{buyer.username || buyer.email}</span>
                {buyer.suspended ? (
                  <Badge variant="destructive">Suspended</Badge>
                ) : buyer.approved ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                    Pending
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>{buyer.email}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{formatCurrency(buyer.creditBalance || 0)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{buyer.loyaltyPoints || 0} points</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{purchases.length} tickets</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="font-medium">{formatDate(buyer.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last active</span>
                <span className="font-medium">{formatDate(buyer.lastActive)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Subscriptions</span>
                <span className="font-medium">{subscriptions.length} sellers</span>
              </div>
            </div>

            <Tabs defaultValue="transactions">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="purchases">Purchases</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions">
                <Table>
                  <TableCaption>Recent transactions</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                transaction.type === 'topup' 
                                  ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                  : transaction.type === 'refund'
                                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                              }
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(transaction.created_at)}</TableCell>
                          <TableCell>{transaction.description || "No description"}</TableCell>
                          <TableCell className={`text-right ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.amount > 0 ? "+" : ""}
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="purchases">
                <Table>
                  <TableCaption>Recent purchases</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.length > 0 ? (
                      purchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>{purchase.ticket_title}</TableCell>
                          <TableCell>{formatDate(purchase.purchase_date)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(purchase.price)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          No purchases found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="subscriptions">
                <Table>
                  <TableCaption>Seller subscriptions</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Subscribed on</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.length > 0 ? (
                      subscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>{subscription.sellerName}</TableCell>
                          <TableCell>{formatDate(subscription.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-8">
            <p>Buyer not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
