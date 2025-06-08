
import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  verified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  verified = false, 
  size = 'md',
  className = '' 
}) => {
  if (!verified) return null;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  return (
    <ShieldCheck 
      className={`${sizeClasses[size]} text-blue-500 ${className}`} 
    />
  );
};

export default VerifiedBadge;
