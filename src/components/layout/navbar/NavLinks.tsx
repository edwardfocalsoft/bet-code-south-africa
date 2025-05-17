
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { LayoutDashboard, Wallet, Ticket, ShoppingBag } from 'lucide-react';

const NavLinks: React.FC = () => {
  const { userRole } = useAuth();
  
  return (
    <div className="hidden md:flex space-x-6">
      {userRole === 'admin' && (
        <>
          <NavLink to="/admin/dashboard" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Dashboard
          </NavLink>
          <NavLink to="/admin/tickets" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Tickets
          </NavLink>
          <NavLink to="/admin/sellers" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Sellers
          </NavLink>
          <NavLink to="/admin/buyers" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Buyers
          </NavLink>
          <NavLink to="/admin/cases" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Cases
          </NavLink>
        </>
      )}

      {userRole === 'seller' && (
        <>
          <NavLink to="/seller/dashboard" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Dashboard
          </NavLink>
          <NavLink to="/seller/tickets" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            My Tickets
          </NavLink>
        </>
      )}

      {userRole === 'buyer' && (
        <>
          <NavLink to="/buyer/dashboard" className={({ isActive }) =>
            isActive ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to="/user/wallet" className={({ isActive }) =>
            isActive ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <Wallet className="h-4 w-4" />
            Wallet
          </NavLink>
          <NavLink to="/tickets" className={({ isActive }) =>
            isActive ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <Ticket className="h-4 w-4" />
            Browse Tickets
          </NavLink>
          <NavLink to="/buyer/purchases" className={({ isActive }) =>
            isActive ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <ShoppingBag className="h-4 w-4" />
            My Purchases
          </NavLink>
        </>
      )}
    </div>
  );
};

export default NavLinks;
