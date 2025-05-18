
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SellerAvatarProps {
  username: string;
  avatarUrl?: string;
}

const SellerAvatar: React.FC<SellerAvatarProps> = ({ username, avatarUrl }) => {
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
      <h3 className="text-xl font-semibold text-center">{username}</h3>
    </div>
  );
};

export default SellerAvatar;
