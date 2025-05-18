
import React from "react";
import { User } from "@/types";
import { User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface UserInfoHeaderProps {
  buyer: User | null;
}

export const UserInfoHeader: React.FC<UserInfoHeaderProps> = ({ buyer }) => {
  if (!buyer) return null;
  
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
          <UserIcon className="h-4 w-4" />
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
  );
};
