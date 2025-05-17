
import React, { useState } from "react";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import { useWallet } from "@/hooks/useWallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Minus, TrendingUp, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const UserWallet: React.FC = () => {
  const { creditBalance, transactions, isLoading, topUpWallet } = useWallet();
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const handleTopUp = async () => {
    setProcessing(true);
    const amount = parseFloat(topUpAmount);
    if (!isNaN(amount) && amount > 0) {
      await topUpWallet(amount);
      setTopUpAmount("");
    }
    setProcessing(false);
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (type === "topup") return "text-green-500";
    if (type === "refund" && amount > 0) return "text-green-500";
    return "text-red-500";
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "topup":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "purchase":
        return <Minus className="h-4 w-4 text-red-500" />;
      case "refund":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTransactionStatus = (type: string, amount: number) => {
    if (type === "topup") return "Credit Added";
    if (type === "refund" && amount > 0) return "Refund Received";
    if (type === "refund" && amount < 0) return "Refund Issued";
    return "Purchase";
  };

  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="betting-card">
              <CardHeader>
                <CardTitle>Credit Balance</CardTitle>
                <CardDescription>Your current available credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-betting-green/10 p-4 rounded-full">
                    <TrendingUp className="h-8 w-8 text-betting-green" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <h3 className="text-3xl font-bold">
                      R {creditBalance !== null ? creditBalance.toFixed(2) : "0.00"}
                    </h3>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <p className="text-sm text-muted-foreground mb-4">
                  Add credits to your account to purchase tickets
                </p>
                <div className="flex items-center gap-2 w-full">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="bg-betting-light-gray border-betting-light-gray"
                  />
                  <Button 
                    onClick={handleTopUp} 
                    disabled={isLoading || processing || !topUpAmount || parseFloat(topUpAmount) <= 0}
                    className="bg-betting-green hover:bg-betting-green-dark"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      "Add Credits"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="betting-card">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Your recent wallet transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <Table>
                    <TableCaption>
                      Your wallet transaction history
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
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
                              {getTransactionStatus(transaction.type, transaction.amount)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(transaction.created_at), "PPP")}
                          </TableCell>
                          <TableCell>
                            {transaction.description || "No description"}
                          </TableCell>
                          <TableCell className={`text-right ${getTransactionColor(transaction.type, transaction.amount)}`}>
                            {transaction.amount > 0 ? "+" : ""}R {Math.abs(transaction.amount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-betting-green mb-4" />
                    ) : (
                      <>
                        <p className="text-lg font-medium">No transactions yet</p>
                        <p className="text-muted-foreground mt-1">
                          Add credits to your account to start using the platform
                        </p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserWallet;
