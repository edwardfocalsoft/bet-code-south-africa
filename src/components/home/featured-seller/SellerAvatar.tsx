
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/common/VerifiedBadge";

interface SellerAvatarProps {
  username: string;
  avatarUrl?: string;
  verified?: boolean;
}

const SellerAvatar: React.FC<SellerAvatarProps> = ({ username, avatarUrl, verified = false }) => {
  return (
    <div className="p-6 flex flex-col items-center justify-center">
      <Avatar className="h-24 w-24 mb-4">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={username} />
        ) : (
          <AvatarFallback className="bg-betting-dark-gray text-betting-green text-3xl font-bold">
            {username?.substring(0, 2).toUpperCase() || "PP"}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-semibold text-center">{username}</h3>
        <VerifiedBadge verified={verified} size="lg" />
      </div>
    </div>
  );
};

export default SellerAvatar;
