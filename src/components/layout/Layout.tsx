
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
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && requireAuth && !currentUser) {
      navigate("/login", { replace: true });
    }
    
    if (!loading && currentUser && allowedRoles.length > 0 && currentUser.role && !allowedRoles.includes(currentUser.role)) {
      navigate("/", { replace: true });
    }
  }, [currentUser, loading, requireAuth, allowedRoles, navigate]);

  if (loading && requireAuth) {
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
