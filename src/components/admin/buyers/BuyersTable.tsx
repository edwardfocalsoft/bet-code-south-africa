
import React, { useState } from "react";
import { format } from "date-fns";
import { User, Ban, Check, MoreHorizontal, User as UserIcon, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuyerProfileModal } from "./BuyerProfileModal";
import { User as UserType } from "@/types";

interface BuyersTableProps {
  buyers: UserType[];
  updateBuyerStatus: (
    buyerId: string,
    updates: { approved?: boolean; suspended?: boolean }
  ) => Promise<boolean>;
  resendVerificationEmail?: (email: string) => Promise<boolean>;
}

export const BuyersTable = ({ 
  buyers, 
  updateBuyerStatus,
  resendVerificationEmail
}: BuyersTableProps) => {
  const { toast } = useToast();
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSuspendToggle = async (userId: string, currentStatus: boolean) => {
    const success = await updateBuyerStatus(userId, { suspended: !currentStatus });
    
    if (success) {
      toast({
        title: `User ${currentStatus ? "unsuspended" : "suspended"} successfully`,
        description: `User ID: ${userId}`,
      });
    }
  };

  const handleApproveToggle = async (userId: string, currentStatus: boolean) => {
    const success = await updateBuyerStatus(userId, { approved: !currentStatus });
    
    if (success) {
      toast({
        title: `User ${!currentStatus ? "approved" : "unapproved"} successfully`,
        description: `User ID: ${userId}`,
      });
    }
  };

  const handleResendVerification = async (email: string) => {
    if (resendVerificationEmail) {
      await resendVerificationEmail(email);
    } else {
      toast({
        title: "Feature unavailable",
        description: "Unable to resend verification email at this time.",
        variant: "destructive",
      });
    }
  };

  const viewBuyerProfile = (userId: string) => {
    setSelectedBuyerId(userId);
    setIsProfileModalOpen(true);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return format(date, "MMM d, yyyy");
  };

  return (
    <>
      <Table>
        <TableCaption>List of platform buyers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Purchases</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buyers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No buyers found
              </TableCell>
            </TableRow>
          ) : (
            buyers.map((buyer) => (
              <TableRow key={buyer.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span>{buyer.username || buyer.email}</span>
                  </div>
                </TableCell>
                <TableCell>{buyer.email}</TableCell>
                <TableCell>{formatDate(buyer.createdAt)}</TableCell>
                <TableCell>{buyer.purchasesCount || 0}</TableCell>
                <TableCell>{buyer.lastActive ? formatDate(buyer.lastActive) : formatDate(buyer.createdAt)}</TableCell>
                <TableCell>
                  {buyer.suspended ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : buyer.approved ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                      Pending Verification
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleApproveToggle(buyer.id, buyer.approved || false)}>
                        <Check className="mr-2 h-4 w-4" />
                        {buyer.approved ? "Mark as Unverified" : "Mark as Verified"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSuspendToggle(buyer.id, buyer.suspended || false)}>
                        <Ban className="mr-2 h-4 w-4" />
                        {buyer.suspended ? "Unsuspend Account" : "Suspend Account"}
                      </DropdownMenuItem>
                      {!buyer.approved && (
                        <DropdownMenuItem onClick={() => handleResendVerification(buyer.email)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Verification Email
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => viewBuyerProfile(buyer.id)}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <BuyerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        buyerId={selectedBuyerId}
      />
    </>
  );
};
