
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const MaintenancePage: React.FC = () => {
  const [siteName, setSiteName] = useState<string>("BetCode");
  const [logoUrl, setLogoUrl] = useState<string>("/lovable-uploads/fac54ed7-e7af-463e-852d-7a912e0e1631.png");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('site_name, logo_url')
          .maybeSingle();

        if (data) {
          setSiteName(data.site_name);
          if (data.logo_url) setLogoUrl(data.logo_url);
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-betting-black p-4 text-white">
      <div className="w-full max-w-md rounded-lg bg-betting-dark-gray p-8 shadow-lg">
        <div className="mb-8 flex justify-center">
          <img 
            src={logoUrl} 
            alt={siteName} 
            className="h-12 w-auto"
          />
        </div>
        
        <h1 className="mb-4 text-center text-3xl font-bold text-betting-green">
          Under Maintenance
        </h1>
        
        <div className="mb-8 space-y-4 text-center">
          <p>
            We're currently performing scheduled maintenance on {siteName}.
          </p>
          <p>
            Please check back soon. We apologize for any inconvenience.
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="h-2 w-32 animate-pulse rounded-full bg-betting-green"></div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
