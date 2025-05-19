
import React from "react";
import { Button } from "@/components/ui/button";
import { UserCircle, Store } from "lucide-react";
import type { Extract } from "@/types";

// Only allow 'buyer' or 'seller' roles for registration form
type RegisterFormRole = 'buyer' | 'seller';

interface RoleSelectorProps {
  role: RegisterFormRole;
  onChange: (role: RegisterFormRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ role, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-foreground">
        I want to register as a:
      </label>
      <div className="flex space-x-3">
        <Button
          type="button"
          variant={role === "buyer" ? "default" : "outline"}
          className={`flex-1 ${
            role === "buyer" ? "bg-betting-green hover:bg-betting-green-dark" : ""
          }`}
          onClick={() => onChange("buyer")}
        >
          <UserCircle className="mr-2 h-4 w-4" />
          Buyer
        </Button>
        <Button
          type="button"
          variant={role === "seller" ? "default" : "outline"}
          className={`flex-1 ${
            role === "seller" ? "bg-betting-green hover:bg-betting-green-dark" : ""
          }`}
          onClick={() => onChange("seller")}
        >
          <Store className="mr-2 h-4 w-4" />
          Seller
        </Button>
      </div>
    </div>
  );
};

export default RoleSelector;
