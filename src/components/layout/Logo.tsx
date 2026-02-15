
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img
        src="/lovable-uploads/cc72a31c-e286-4a9e-b900-b6f4839c3296.png"
        alt="CODE"
        className="h-10" />

    </Link>);

};

export default Logo;