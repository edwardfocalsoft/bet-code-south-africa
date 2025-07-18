
import React, { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MarqueeNotice from "./MarqueeNotice";
import SystemAdPopup from "./SystemAdPopup";
import PlayabetsPopupAd from "./PlayabetsPopupAd";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectIfAuth?: boolean;
  isHomePage?: boolean;
  hideNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  requireAuth = false,
  allowedRoles = ["buyer", "seller", "admin"],
  redirectIfAuth = false,
  isHomePage = false,
  hideNavigation = false
}) => {
  const { currentUser, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading) {
      // Special handling for admin users - they don't need username setup
      if (currentUser && userRole === "admin") {
        if (location.pathname === "/auth/profile-setup") {
          navigate("/admin/dashboard", { replace: true });
          return;
        }
      }
      
      // Check if user needs to complete profile setup (only for non-admin users)
      if (currentUser && userRole !== "admin" && !currentUser.username && location.pathname !== "/auth/profile-setup") {
        navigate("/auth/profile-setup", { replace: true });
        return;
      }
      
      // Prevent sellers from accessing wallet page
      if (location.pathname === "/user/wallet" && userRole === "seller") {
        navigate("/seller/transactions", { replace: true });
        return;
      }
      
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
        // Only redirect if user has completed profile setup (or is admin)
        if (userRole === "admin" || currentUser.username) {
          if (userRole === "admin") {
            navigate("/admin/dashboard", { replace: true });
          } else if (userRole === "seller") {
            navigate("/seller/dashboard", { replace: true });
          } else {
            navigate("/buyer/dashboard", { replace: true });
          }
        }
      }
      
      // Redirect authenticated users from home page to their respective dashboards
      if (isHomePage && currentUser && userRole && (userRole === "admin" || currentUser.username)) {
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
      {!hideNavigation && <MarqueeNotice />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {currentUser && userRole && (userRole === 'buyer' || userRole === 'seller') && <SystemAdPopup />}
      <PlayabetsPopupAd />
    </div>
  );
};

export default Layout;
