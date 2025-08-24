
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NavigationLink } from './navigationLinks';

interface MobileNavigationProps {
  links: NavigationLink[];
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ links }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
          <Menu className="h-5 w-5 mr-2" />
          Menu
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-betting-dark-gray border-betting-light-gray"
      >
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <NavLink 
              to={link.href}
              className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-betting-black w-full"
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileNavigation;
