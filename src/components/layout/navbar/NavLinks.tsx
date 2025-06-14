
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useIsMobile } from "@/hooks/use-mobile";
import { getLinksForRole } from './navigationLinks';
import MobileNavigation from './MobileNavigation';
import DesktopNavigation from './DesktopNavigation';

const NavLinks: React.FC = () => {
  const { userRole } = useAuth();
  const isMobile = useIsMobile();
  
  const links = getLinksForRole(userRole);

  if (isMobile) {
    return <MobileNavigation links={links} />;
  }

  return <DesktopNavigation links={links} />;
};

export default NavLinks;
