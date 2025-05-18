
import React from 'react';

interface SellerAvatarProps {
  username: string;
}

const SellerAvatar: React.FC<SellerAvatarProps> = ({ username }) => {
  return (
    <div className="h-24 w-24 rounded-full bg-betting-dark-gray flex items-center justify-center mb-4">
      <span className="text-3xl font-bold text-betting-green">
        {username?.substring(0, 2).toUpperCase() || "PP"}
      </span>
    </div>
  );
};

export default SellerAvatar;
