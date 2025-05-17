
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

type NavLinksProps = {
  isMobile?: boolean;
};

const NavLinks: React.FC<NavLinksProps> = ({ isMobile = false }) => {
  const { currentUser, userRole } = useAuth();

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "seller") return "/seller/dashboard";
    if (userRole === "buyer") return "/buyer/dashboard";
    return "/";
  };

  const className = "text-sm font-medium text-gray-200 transition-colors hover:text-white";

  if (!currentUser) {
    return (
      <>
        <Link to="/" className={className}>
          Home
        </Link>
        <Link to="/tickets" className={className}>
          Tickets
        </Link>
        <Link to="/sellers" className={className}>
          Sellers
        </Link>
      </>
    );
  }

  return (
    <>
      <Link to={getDashboardPath()} className={className}>
        Dashboard
      </Link>
      
      {userRole === "buyer" && (
        <>
          <Link to="/tickets" className={className}>
            Browse Tickets
          </Link>
          <Link to="/sellers" className={className}>
            Find Sellers
          </Link>
          <Link to="/buyer/purchases" className={className}>
            My Purchases
          </Link>
        </>
      )}
      
      {userRole === "seller" && (
        <>
          <Link to="/seller/tickets" className={className}>
            My Tickets
          </Link>
          <Link to="/seller/tickets/create" className={className}>
            Create Ticket
          </Link>
          <Link to="/seller/withdrawals" className={className}>
            Withdrawals
          </Link>
        </>
      )}
      
      {userRole === "admin" && (
        <>
          <Link to="/admin/tickets" className={className}>
            Tickets
          </Link>
          <Link to="/admin/sellers" className={className}>
            Sellers
          </Link>
          <Link to="/admin/buyers" className={className}>
            Buyers
          </Link>
          <Link to="/admin/withdrawals" className={className}>
            Withdrawals
          </Link>
        </>
      )}
    </>
  );
};

export default NavLinks;
