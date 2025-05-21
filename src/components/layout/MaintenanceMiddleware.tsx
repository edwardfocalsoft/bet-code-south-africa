
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

interface MaintenanceMiddlewareProps {
  children: React.ReactNode;
}

const MaintenanceMiddleware: React.FC<MaintenanceMiddlewareProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const { userRole } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        // Using as { data: any } to bypass TypeScript errors until types are regenerated
        const { data } = await supabase
          .from('site_settings')
          .select('maintenance_mode')
          .maybeSingle() as { data: any };

        setIsMaintenanceMode(data?.maintenance_mode || false);
      } catch (error) {
        console.error("Error checking maintenance mode:", error);
        setIsMaintenanceMode(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkMaintenanceMode();
  }, []);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
      </div>
    );
  }

  // Allow admin users to bypass maintenance mode
  if (isMaintenanceMode && userRole !== "admin") {
    // Whitelist maintenance page and auth pages
    const whitelistedPaths = ['/maintenance', '/auth/login', '/auth/register'];
    const isWhitelisted = whitelistedPaths.some(path => location.pathname.startsWith(path));

    if (!isWhitelisted) {
      return <Navigate to="/maintenance" replace />;
    }
  }

  return <>{children}</>;
};

export default MaintenanceMiddleware;
