
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";

const RegisterConfirmation: React.FC = () => {
  const location = useLocation();
  const role = location.state?.role || "buyer";
  
  const isSeller = role === "seller";

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="bg-betting-dark-gray border-betting-light-gray">
          <CardHeader>
            <div className="mx-auto bg-betting-green/20 h-16 w-16 rounded-full flex items-center justify-center mb-4">
              {isSeller ? (
                <AlertCircle className="h-8 w-8 text-betting-accent" />
              ) : (
                <Check className="h-8 w-8 text-betting-green" />
              )}
            </div>
            <CardTitle className="text-2xl text-center">Registration Successful</CardTitle>
            <CardDescription className="text-center">
              {isSeller
                ? "Your seller account is pending approval"
                : "Your account has been created successfully"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {isSeller ? (
              <div className="space-y-4">
                <p>
                  Thank you for registering as a seller on BetCode ZA. Your account is currently under review by our admin team.
                </p>
                <p className="text-muted-foreground text-sm">
                  You will receive an email notification once your account has been approved. This typically takes 24-48 hours.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p>
                  Thank you for joining BetCode ZA. Your buyer account is now active.
                </p>
                <p className="text-muted-foreground text-sm">
                  You can now browse and purchase tickets, and start earning loyalty rewards.
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <Link to={isSeller ? "/" : "/buyer/dashboard"}>
                <Button className="bg-betting-green hover:bg-betting-green-dark">
                  {isSeller ? "Return to Homepage" : "Go to Dashboard"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RegisterConfirmation;
