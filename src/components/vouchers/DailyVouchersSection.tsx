
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gift, Clock, CheckCircle, User } from "lucide-react";
import { useDailyVouchers } from "@/hooks/useDailyVouchers";
import { useAuth } from "@/contexts/auth";
import { formatDistanceToNow } from "date-fns";

const DailyVouchersSection: React.FC = () => {
  const { user } = useAuth();
  const { vouchers, loading, claiming, claimVoucher } = useDailyVouchers();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!user || user.role !== 'buyer') {
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const dropTime = new Date(`${today}T12:00:00`);
  const isDropTime = currentTime >= dropTime;
  const timeUntilDrop = dropTime.getTime() - currentTime.getTime();

  if (loading) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Card className="betting-card">
            <CardContent className="p-6">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (vouchers.length === 0) {
    return null;
  }

  const formatTimeUntilDrop = () => {
    if (timeUntilDrop <= 0) return "Drop is live!";
    
    const hours = Math.floor(timeUntilDrop / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilDrop % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilDrop % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-8 px-4 bg-gradient-to-br from-betting-dark-gray to-betting-black">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Gift className="h-8 w-8 text-betting-green" />
            Daily Voucher Drop
          </h2>
          <p className="text-muted-foreground mb-4">
            5 x R50 vouchers drop daily at 12:00 PM - First come, first served!
          </p>
          
          {!isDropTime ? (
            <div className="flex items-center justify-center gap-2 text-lg font-mono">
              <Clock className="h-5 w-5 text-betting-green" />
              <span>Next drop in: {formatTimeUntilDrop()}</span>
            </div>
          ) : (
            <Badge variant="default" className="bg-betting-green text-white px-4 py-2 text-lg">
              Drop is LIVE! 🔥
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {vouchers.map((voucher, index) => (
            <Card key={voucher.id} className="betting-card relative overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-lg">
                  Voucher #{index + 1}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-betting-green">
                    R{voucher.value}
                  </div>
                </div>

                {voucher.is_claimed ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Claimed</span>
                    </div>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <User className="h-4 w-4" />
                        <span>{voucher.claim?.claimer_username}</span>
                      </div>
                      <div>
                        {voucher.claim?.claimed_at && 
                          formatDistanceToNow(new Date(voucher.claim.claimed_at), { addSuffix: true })
                        }
                      </div>
                    </div>

                    {voucher.claimed_by_current_user && (
                      <div className="text-center">
                        <Badge variant="default" className="bg-betting-green text-white">
                          Your Voucher
                        </Badge>
                        <div className="mt-2 p-2 bg-betting-black rounded text-xs font-mono">
                          Code: {voucher.code}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={() => claimVoucher(voucher.id)}
                      disabled={!isDropTime || claiming === voucher.id}
                      className="w-full bg-betting-green hover:bg-betting-green-dark"
                    >
                      {claiming === voucher.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Claiming...
                        </>
                      ) : !isDropTime ? (
                        'Available at 12:00 PM'
                      ) : (
                        'Claim Now!'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>• One voucher per user per day</p>
          <p>• Vouchers add R50 credits to your account instantly</p>
          <p>• New vouchers drop every day at 12:00 PM</p>
        </div>
      </div>
    </section>
  );
};

export default DailyVouchersSection;
