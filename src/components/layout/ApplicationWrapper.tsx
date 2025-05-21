
import React, { useEffect } from 'react';
import { applyGlobalSiteSettings } from '@/utils/googleAdsUtils';

interface ApplicationWrapperProps {
  children: React.ReactNode;
}

const ApplicationWrapper: React.FC<ApplicationWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Apply global site settings when the app loads
    applyGlobalSiteSettings();
  }, []);

  return <>{children}</>;
};

export default ApplicationWrapper;
