
import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MarqueeNotice from "./MarqueeNotice";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import SEO, { SEOProps } from "./SEO";

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  hideMarquee?: boolean;
  seo?: SEOProps;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  requireAuth = false,
  allowedRoles = [],
  hideMarquee = false,
  seo,
}) => {
  const { user, isInitialized, loading, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireAuth && isInitialized && !loading && !user) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname));
    }

    if (
      requireAuth &&
      allowedRoles.length > 0 &&
      isInitialized &&
      !loading &&
      user &&
      currentUser &&
      !allowedRoles.includes(currentUser.role)
    ) {
      navigate("/dashboard");
    }
  }, [requireAuth, isInitialized, loading, user, allowedRoles, navigate, currentUser]);

  if (requireAuth && (loading || !isInitialized)) {
    return (
      <div className="min-h-screen bg-betting-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-betting-black text-white">
      <SEO {...seo} />
      <Navbar />
      {!hideMarquee && <MarqueeNotice />}
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
