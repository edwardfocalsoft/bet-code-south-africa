
import React from "react";
import { useAuth } from "@/contexts/auth";
import Logo from "./Logo";
import NotificationDropdown from "./NotificationDropdown";
import NavLinks from "./navbar/NavLinks";
import AuthButtons from "./navbar/AuthButtons";
import UserDropdown from "./navbar/UserDropdown";

const Navbar: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-betting-black border-b border-betting-light-gray">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Logo />
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 mr-6">
            <NavLinks />
          </nav>
          
          {currentUser ? (
            <>
              <NotificationDropdown />
              <UserDropdown />
            </>
          ) : (
            <AuthButtons />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
