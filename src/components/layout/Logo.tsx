
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/betcode-logo.png" 
        alt="BetCode"
        className="h-8"
      />
    </Link>
  );
};

export default Logo;
