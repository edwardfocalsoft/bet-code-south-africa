
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gift, Clock, CheckCircle, User, LogIn, Copy, Star, Zap } from "lucide-react";
import { useDailyVouchers } from "@/hooks/useDailyVouchers";
import { useAuth } from "@/contexts/auth";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const DailyVouchersSection: React.FC = () => {
  const { currentUser } = useAuth();
  const { vouchers, loading, claiming, claimVoucher } = useDailyVouchers();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const dropTime = new Date(`${today}T12:00:00`);
  const isDropTime = currentTime >= dropTime;
  const timeUntilDrop = dropTime.getTime() - currentTime.getTime();

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Voucher code copied to clipboard!');
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-betting-black via-betting-dark-gray to-betting-black py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-betting-green mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">Loading vouchers...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (vouchers.length === 0) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-betting-black via-betting-dark-gray to-betting-black py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-betting-green/20 to-betting-accent/20 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
              <Gift className="h-16 w-16 text-betting-green" />
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-betting-green to-betting-accent bg-clip-text text-transparent">
              Daily Voucher Drop
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              No vouchers available at the moment. Check back later for amazing deals!
            </p>
            <div className="bg-betting-dark-gray/50 backdrop-blur-sm rounded-lg p-6 border border-betting-light-gray/30">
              <p className="text-sm text-muted-foreground">
                💡 New vouchers drop every day at 12:00 PM - Don't miss out!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const formatTimeUntilDrop = () => {
    if (timeUntilDrop <= 0) return "Drop is live!";
    
    const hours = Math.floor(timeUntilDrop / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilDrop % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilDrop % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const canClaim = currentUser && (currentUser.role === 'buyer' || currentUser.role === 'seller');

  return (
    <section className="min-h-screen bg-gradient-to-br from-betting-black via-betting-dark-gray to-betting-black py-12 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-betting-green/5 via-transparent to-betting-accent/5 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-betting-green/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-betting-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-betting-green/20 to-betting-accent/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-betting-green/30">
            <Gift className="h-6 w-6 text-betting-green animate-pulse" />
            <span className="text-sm font-medium text-betting-green">Daily Voucher Drop</span>
            <Star className="h-4 w-4 text-betting-accent" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-betting-green via-white to-betting-accent bg-clip-text text-transparent">
            Free Vouchers
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            5 x R50 vouchers drop daily at 12:00 PM
            <br />
            <span className="text-betting-green font-semibold">First come, first served!</span>
          </p>
          
          {!currentUser && (
            <div className="mb-8 p-6 bg-gradient-to-r from-betting-dark-gray/80 to-betting-light-gray/80 backdrop-blur-sm rounded-2xl border border-betting-light-gray/30 max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-betting-green/20 rounded-full flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-betting-green" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">Login Required</p>
                  <p className="text-sm text-muted-foreground">Claim your free vouchers</p>
                </div>
              </div>
              <Link to="/auth/login">
                <Button className="w-full bg-gradient-to-r from-betting-green to-betting-green-dark hover:from-betting-green-dark hover:to-betting-green text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <LogIn className="h-5 w-5 mr-2" />
                  Login to Claim Vouchers
                </Button>
              </Link>
            </div>
          )}
          
          {/* Countdown Timer */}
          <div className="mb-10">
            {!isDropTime ? (
              <div className="bg-gradient-to-r from-betting-dark-gray/90 to-betting-light-gray/90 backdrop-blur-sm rounded-2xl p-6 border border-betting-light-gray/30 max-w-sm mx-auto">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Clock className="h-6 w-6 text-betting-green animate-pulse" />
                  <span className="text-lg font-semibold text-white">Next Drop In</span>
                </div>
                <div className="text-3xl font-mono font-bold text-betting-green">
                  {formatTimeUntilDrop()}
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-betting-green to-betting-accent rounded-2xl px-8 py-4 shadow-lg animate-pulse">
                <Zap className="h-6 w-6 text-white" />
                <span className="text-xl font-bold text-white">Drop is LIVE! 🔥</span>
                <Zap className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Vouchers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto mb-12">
          {vouchers.map((voucher, index) => (
            <Card key={voucher.id} className="group relative overflow-hidden bg-gradient-to-br from-betting-dark-gray/90 to-betting-light-gray/90 backdrop-blur-sm border border-betting-light-gray/30 hover:border-betting-green/50 transition-all duration-500 hover:shadow-2xl hover:shadow-betting-green/20 hover:scale-105">
              {/* Card decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-betting-green/5 to-betting-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={`text-xs font-bold ${voucher.is_claimed ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-betting-green/20 text-betting-green border-betting-green/30'}`}>
                    #{index + 1}
                  </Badge>
                  {!voucher.is_claimed && (
                    <div className="w-3 h-3 bg-betting-green rounded-full animate-pulse" />
                  )}
                </div>
                <CardTitle className="text-center text-lg text-white">
                  Voucher #{index + 1}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4 relative z-10">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-betting-green to-betting-accent bg-clip-text text-transparent mb-2">
                    R{voucher.value}
                  </div>
                  <p className="text-sm text-muted-foreground">Free Credits</p>
                </div>

                {voucher.is_claimed ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-400 bg-green-500/10 rounded-lg p-3">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Claimed</span>
                    </div>
                    
                    <div className="text-center text-sm bg-betting-black/50 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <User className="h-4 w-4 text-betting-green" />
                        <span className="font-medium text-white">{voucher.claim?.claimer_username}</span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {voucher.claim?.claimed_at && 
                          formatDistanceToNow(new Date(voucher.claim.claimed_at), { addSuffix: true })
                        }
                      </div>
                    </div>

                    {voucher.claimed_by_current_user && (
                      <div className="text-center space-y-3">
                        <Badge className="bg-gradient-to-r from-betting-green to-betting-green-dark text-white px-4 py-1">
                          Your Voucher ⭐
                        </Badge>
                        <div className="p-4 bg-gradient-to-br from-betting-black/80 to-betting-dark-gray/80 rounded-xl border border-betting-green/30">
                          <div className="text-xs text-muted-foreground mb-2">Voucher Code:</div>
                          <div className="font-mono text-sm text-betting-green mb-3 bg-betting-black/50 p-2 rounded border">
                            {voucher.code}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => copyVoucherCode(voucher.code)}
                            className="w-full bg-gradient-to-r from-betting-green/20 to-betting-accent/20 hover:from-betting-green/30 hover:to-betting-accent/30 border border-betting-green/30 text-betting-green text-xs"
                          >
                            <Copy className="h-3 w-3 mr-2" />
                            Copy Code
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!currentUser ? (
                      <Link to="/auth/login">
                        <Button className="w-full bg-gradient-to-r from-betting-green to-betting-green-dark hover:from-betting-green-dark hover:to-betting-green text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                          <LogIn className="mr-2 h-4 w-4" />
                          Login to Claim
                        </Button>
                      </Link>
                    ) : !canClaim ? (
                      <Button disabled className="w-full bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-xl py-3">
                        Not Available
                      </Button>
                    ) : (
                      <Button
                        onClick={() => claimVoucher(voucher.id)}
                        disabled={!isDropTime || claiming === voucher.id}
                        className={`w-full font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                          isDropTime && claiming !== voucher.id
                            ? 'bg-gradient-to-r from-betting-green to-betting-accent hover:from-betting-green-dark hover:to-betting-accent text-white animate-pulse'
                            : 'bg-gradient-to-r from-betting-dark-gray to-betting-light-gray text-muted-foreground border border-betting-light-gray/30'
                        }`}
                      >
                        {claiming === voucher.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Claiming...
                          </>
                        ) : !isDropTime ? (
                          'Available at 12:00 PM'
                        ) : (
                          <>
                            <Gift className="mr-2 h-4 w-4" />
                            Claim Now!
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-betting-dark-gray/80 to-betting-light-gray/80 backdrop-blur-sm rounded-2xl p-8 border border-betting-light-gray/30">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-betting-green" />
              How It Works
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3 p-3 bg-betting-black/30 rounded-lg">
                <div className="w-8 h-8 bg-betting-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-betting-green font-bold text-xs">1</span>
                </div>
                <span>One voucher per user per day</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-betting-black/30 rounded-lg">
                <div className="w-8 h-8 bg-betting-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-betting-green font-bold text-xs">2</span>
                </div>
                <span>R50 credits added instantly</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-betting-black/30 rounded-lg">
                <div className="w-8 h-8 bg-betting-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-betting-green font-bold text-xs">3</span>
                </div>
                <span>New vouchers daily at 12:00 PM</span>
              </div>
              {!currentUser && (
                <div className="flex items-center gap-3 p-3 bg-betting-black/30 rounded-lg">
                  <div className="w-8 h-8 bg-betting-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <LogIn className="h-4 w-4 text-betting-accent" />
                  </div>
                  <span>Login required to claim</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyVouchersSection;
