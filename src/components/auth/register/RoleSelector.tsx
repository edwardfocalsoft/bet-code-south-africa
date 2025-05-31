
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserRole } from "@/types";

interface RoleSelectorProps {
  role: UserRole;
  onChange: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ role, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Choose your account type</h3>
        <p className="text-sm text-muted-foreground">
          Select whether you want to buy or sell betting predictions
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <Card 
          className={`cursor-pointer transition-all duration-200 ${
            role === "buyer" 
              ? "border-betting-green bg-betting-green/5" 
              : "border-betting-light-gray hover:border-betting-green/50"
          }`}
          onClick={() => onChange("buyer")}
        >
          <CardContent className="p-4">
            <Button
              type="button"
              variant={role === "buyer" ? "default" : "outline"}
              className={`w-full ${
                role === "buyer" 
                  ? "bg-betting-green hover:bg-betting-green-dark" 
                  : "hover:bg-betting-green hover:text-white"
              }`}
              onClick={() => onChange("buyer")}
            >
              Sign up as Buyer
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Purchase betting predictions from verified sellers
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-200 ${
            role === "seller" 
              ? "border-betting-green bg-betting-green/5" 
              : "border-betting-light-gray hover:border-betting-green/50"
          }`}
          onClick={() => onChange("seller")}
        >
          <CardContent className="p-4">
            <Button
              type="button"
              variant={role === "seller" ? "default" : "outline"}
              className={`w-full ${
                role === "seller" 
                  ? "bg-betting-green hover:bg-betting-green-dark" 
                  : "hover:bg-betting-green hover:text-white"
              }`}
              onClick={() => onChange("seller")}
            >
              Sign up as Seller
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Sell your betting predictions and earn money
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelector;
