
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users } from "lucide-react";

interface RoleSelectorProps {
  role: "buyer" | "seller";
  onChange: (value: "buyer" | "seller") => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ role, onChange }) => {
  return (
    <Tabs defaultValue={role} className="w-full" onValueChange={onChange}>
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="buyer" className="data-[state=active]:bg-betting-green">
          <User className="h-4 w-4 mr-2" />
          Sign up as Buyer
        </TabsTrigger>
        <TabsTrigger value="seller" className="data-[state=active]:bg-betting-green">
          <Users className="h-4 w-4 mr-2" />
          Sign up as Seller
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="buyer">
        <div className="space-y-1 text-sm text-muted-foreground mb-4">
          <p>As a buyer, you can:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Browse all available betting codes</li>
            <li>Purchase premium predictions</li>
            <li>Rate sellers and their tickets</li>
            <li>Earn loyalty points for future discounts</li>
          </ul>
        </div>
      </TabsContent>
      
      <TabsContent value="seller">
        <div className="space-y-1 text-sm text-muted-foreground mb-4">
          <p>As a seller, you can:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Share free and paid betting codes</li>
            <li>Build your reputation with good predictions</li>
            <li>Earn commission from your betting knowledge</li>
            <li>Gain followers and visibility on the platform</li>
          </ul>
          <p className="mt-2 font-medium text-betting-accent">
            Note: Seller accounts require admin approval before activation.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default RoleSelector;
