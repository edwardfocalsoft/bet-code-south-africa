
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

const NavLinks: React.FC = () => {
  const { userRole } = useAuth();

  return (
    <div className="hidden md:flex space-x-6">
      <NavLink
        to="/tickets"
        className={({ isActive }) =>
          isActive
            ? 'text-white border-b-2 border-betting-green pb-1'
            : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
        }
      >
        Tickets
      </NavLink>
      <NavLink
        to="/sellers"
        className={({ isActive }) =>
          isActive
            ? 'text-white border-b-2 border-betting-green pb-1'
            : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
        }
      >
        Sellers
      </NavLink>

      {userRole === 'admin' && (
        <>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'text-white border-b-2 border-betting-green pb-1'
                : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/tickets"
            className={({ isActive }) =>
              isActive
                ? 'text-white border-b-2 border-betting-green pb-1'
                : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
            }
          >
            Tickets
          </NavLink>
          <NavLink
            to="/admin/sellers"
            className={({ isActive }) =>
              isActive
                ? 'text-white border-b-2 border-betting-green pb-1'
                : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
            }
          >
            Sellers
          </NavLink>
          <NavLink
            to="/admin/buyers"
            className={({ isActive }) =>
              isActive
                ? 'text-white border-b-2 border-betting-green pb-1'
                : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
            }
          >
            Buyers
          </NavLink>
          <NavLink
            to="/admin/cases"
            className={({ isActive }) =>
              isActive
                ? 'text-white border-b-2 border-betting-green pb-1'
                : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
            }
          >
            Cases
          </NavLink>
        </>
      )}

      {userRole === 'seller' && (
        <>
          <NavLink
            to="/seller/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'text-white border-b-2 border-betting-green pb-1'
                : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/seller/tickets"
            className={({ isActive }) =>
              isActive
                ? 'text-white border-b-2 border-betting-green pb-1'
                : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
            }
          >
            My Tickets
          </NavLink>
        </>
      )}

      {userRole === 'buyer' && (
        <NavLink
          to="/buyer/purchases"
          className={({ isActive }) =>
            isActive
              ? 'text-white border-b-2 border-betting-green pb-1'
              : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }
        >
          My Purchases
        </NavLink>
      )}
    </div>
  );
};

export default NavLinks;
