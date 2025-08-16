
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import { User } from "@/types";

interface SellerAvatarProps {
  seller: User;
}

const SellerAvatar: React.FC<SellerAvatarProps> = ({ seller }) => {
  return (
    <div className="flex items-center justify-center lg:justify-start mb-6">
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-betting-green/20">
          <AvatarImage
            src={seller.avatar_url}
            alt={seller.username}
            className="object-cover"
          />
          <AvatarFallback className="text-2xl bg-betting-green text-betting-dark-gray font-bold">
            {seller.username ? seller.username.substring(0, 2).toUpperCase() : "T"}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="ml-4 text-center lg:text-left">
        <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
          <h3 className="text-3xl font-bold text-white">
            {seller.username || "Anonymous Tipster"}
          </h3>
          <VerifiedBadge verified={seller.verified} size="lg" />
        </div>
        <p className="text-betting-green font-medium text-lg">
          Featured Tipster
        </p>
      </div>
    </div>
  );
};

export default SellerAvatar;
