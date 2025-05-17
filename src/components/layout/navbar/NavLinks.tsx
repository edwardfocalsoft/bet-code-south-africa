
import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavLinks: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/tickets", label: "Tickets" },
    { path: "/sellers", label: "Sellers" },
  ];

  return (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`text-sm font-medium transition-colors hover:text-betting-green ${
            isActive(link.path) ? "text-betting-green" : "text-white"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
};

export default NavLinks;
