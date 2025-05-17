
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

interface ProfileIncompleteAlertProps {
  visible: boolean;
}

const ProfileIncompleteAlert: React.FC<ProfileIncompleteAlertProps> = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <Card className="betting-card mb-8 border-yellow-500/50">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="bg-yellow-500/20 p-2 rounded-full h-fit">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-medium mb-1">Complete Your Profile</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your bank details to receive payments from your ticket sales.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/seller/profile">Complete Profile</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileIncompleteAlert;
