
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: "buyer" | "seller";
  onRoleChange: (role: "buyer" | "seller") => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card 
        className={`cursor-pointer transition-all hover:scale-105 ${
          selectedRole === "buyer" 
            ? "ring-2 ring-betting-green bg-betting-green/10" 
            : "hover:border-betting-green/50"
        }`}
        onClick={() => onRoleChange("buyer")}
      >
        <CardContent className="p-6 text-center">
          <Users className="mx-auto h-12 w-12 mb-4 text-betting-green" />
          <h3 className="text-lg font-semibold mb-2">Sign up as Punter</h3>
          <p className="text-sm text-muted-foreground">
            Purchase betting tips and predictions from expert tipsters
          </p>
        </CardContent>
      </Card>

      <Card 
        className={`cursor-pointer transition-all hover:scale-105 ${
          selectedRole === "seller" 
            ? "ring-2 ring-betting-green bg-betting-green/10" 
            : "hover:border-betting-green/50"
        }`}
        onClick={() => onRoleChange("seller")}
      >
        <CardContent className="p-6 text-center">
          <TrendingUp className="mx-auto h-12 w-12 mb-4 text-betting-green" />
          <h3 className="text-lg font-semibold mb-2">Sign up as Tipster</h3>
          <p className="text-sm text-muted-foreground">
            Share your betting expertise and earn from your predictions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelector;
