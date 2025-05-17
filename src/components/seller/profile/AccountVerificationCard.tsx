
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AccountVerificationCard: React.FC = () => {
  return (
    <Card className="betting-card mt-6 border-yellow-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-lg">Account Verification</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Complete your account verification to unlock higher withdrawal limits and additional features.
        </p>
        <Button variant="outline">Verify Account</Button>
      </CardContent>
    </Card>
  );
};

export default AccountVerificationCard;
