
import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useBuyerData } from "@/hooks/buyers/useBuyerData";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UserInfoHeader } from "./profile/UserInfoHeader";
import { StatCards } from "./profile/StatCards";
import { UserSummary } from "./profile/UserSummary";
import { BuyerDataTabs } from "./profile/BuyerDataTabs";

interface BuyerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerId: string | null;
}

export const BuyerProfileModal = ({ isOpen, onClose, buyerId }: BuyerProfileModalProps) => {
  const {
    buyer,
    transactions,
    subscriptions,
    purchases,
    loading,
    fetchBuyerData,
    formatDate,
    formatCurrency
  } = useBuyerData();

  useEffect(() => {
    if (isOpen && buyerId) {
      fetchBuyerData(buyerId);
    }
  }, [isOpen, buyerId]);

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
            <UserInfoHeader buyer={buyer} />
            
            <StatCards 
              creditBalance={buyer.creditBalance || 0}
              loyaltyPoints={buyer.loyaltyPoints || 0}
              purchases={purchases}
              formatCurrency={formatCurrency}
            />
            
            <UserSummary 
              createdAt={buyer.createdAt}
              lastActive={buyer.lastActive}
              subscriptionsCount={subscriptions.length}
              formatDate={formatDate}
            />
            
            <BuyerDataTabs 
              transactions={transactions}
              purchases={purchases}
              subscriptions={subscriptions}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
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
