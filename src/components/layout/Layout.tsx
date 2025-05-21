
import React, { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectIfAuth?: boolean;
  isHomePage?: boolean; // Added property to identify home page
  hideNavigation?: boolean; // Added property to hide navigation
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  requireAuth = false,
  allowedRoles = ["buyer", "seller", "admin"],
  redirectIfAuth = false,
  isHomePage = false, // Default is false
  hideNavigation = false // Default is false
}) => {
  const { currentUser, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading) {
      // Redirect if not authenticated but auth is required
      if (requireAuth && !currentUser) {
        navigate("/auth/login", { 
          replace: true,
          state: { from: location.pathname }
        });
      }
      
      // Redirect if role not allowed
      if (currentUser && userRole && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        navigate("/", { replace: true });
      }
      
      // Redirect if authenticated but should redirect (e.g., login page)
      if (redirectIfAuth && currentUser) {
        // Redirect to appropriate dashboard based on role
        if (userRole === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (userRole === "seller") {
          navigate("/seller/dashboard", { replace: true });
        } else {
          navigate("/buyer/dashboard", { replace: true });
        }
      }
      
      // Redirect authenticated users from home page to their respective dashboards
      if (isHomePage && currentUser && userRole) {
        if (userRole === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (userRole === "seller") {
          navigate("/seller/dashboard", { replace: true });
        } else {
          navigate("/buyer/dashboard", { replace: true });
        }
      }
    }
  }, [currentUser, loading, requireAuth, allowedRoles, redirectIfAuth, isHomePage, userRole, navigate, location]);

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
      {!hideNavigation && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
