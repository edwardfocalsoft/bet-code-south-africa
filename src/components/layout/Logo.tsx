
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/fac54ed7-e7af-463e-852d-7a912e0e1631.png" 
        alt="BetCode" 
        className="h-8"
      />
    </Link>
  );
};

export default Logo;
