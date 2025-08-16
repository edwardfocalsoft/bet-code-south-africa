import React from "react";
import { Button } from "@/components/ui/button";
import { UserCircle, Store } from "lucide-react";
import { UserRole } from "@/types";

// Only allow 'buyer' or 'seller' roles for registration form
type RegisterFormRole = Extract<UserRole, 'buyer' | 'seller'>;
interface RoleSelectorProps {
  role: RegisterFormRole;
  onChange: (role: RegisterFormRole) => void;
}
const RoleSelector: React.FC<RoleSelectorProps> = ({
  role,
  onChange
}) => {
  return <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="button" variant={role === "buyer" ? "default" : "outline"} className={`w-full sm:flex-1 ${role === "buyer" ? "bg-betting-green hover:bg-betting-green-dark" : "bg-betting-light-gray border-betting-light-gray"}`} onClick={() => onChange("buyer")}>
          <UserCircle className="mr-2 h-4 w-4" />
          Sign up as Buyer
        </Button>
        <Button type="button" variant={role === "seller" ? "default" : "outline"} className={`w-full sm:flex-1 ${role === "seller" ? "bg-betting-green hover:bg-betting-green-dark" : "bg-betting-light-gray border-betting-light-gray"}`} onClick={() => onChange("seller")}>
          <Store className="mr-2 h-4 w-4" />
          Sign up as Seller
        </Button>
      </div>
      
      {role === 'buyer' && <div className="text-sm space-y-1">
          <p className="text-sm mb-1">As a buyer, you can:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
            <li>Browse all available betting codes</li>
            <li>Purchase premium predictions</li>
            <li>Rate sellers and their tickets</li>
            <li>Earn loyalty points for future discounts</li>
          </ul>
        </div>}
      
      {role === 'seller' && <div className="text-sm space-y-1">
          <p className="text-sm mb-1">As a tipster, you can:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
            <li>Share free and paid betting codes</li>
            <li>Build your reputation with good predictions</li>
            <li>Earn commission from your betting knowledge</li>
            <li>Gain followers and visibility on the platform</li>
          </ul>
          <p className="text-amber-500 font-medium mt-2">Note: Tipster accounts may require admin approval before activation.</p>
        </div>}
    </div>;
};
export default RoleSelector;