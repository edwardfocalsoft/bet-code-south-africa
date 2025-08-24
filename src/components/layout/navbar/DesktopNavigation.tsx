
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NavigationLink } from './navigationLinks';

interface DesktopNavigationProps {
  links: NavigationLink[];
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ links }) => {
  return (
    <div className="hidden md:flex space-x-6">
      {links.map((link) => (
        <NavLink 
          key={link.href}
          to={link.href} 
          className={({ isActive }) =>
            isActive 
              ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' 
              : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }
        >
          {link.icon && <link.icon className="h-4 w-4" />}
          {link.label}
        </NavLink>
      ))}
    </div>
  );
};

export default DesktopNavigation;
