
import React, { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  requireAuth = false,
  allowedRoles = ["buyer", "seller", "admin"] 
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      navigate("/login", { replace: true });
    }
    
    if (!isLoading && user && allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, requireAuth, allowedRoles, navigate]);

  if (isLoading && requireAuth) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-betting-green" />
            <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
