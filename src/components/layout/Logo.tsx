
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="text-xl font-bold text-betting-green">BettingTips</span>
    </Link>
  );
};

export default Logo;
