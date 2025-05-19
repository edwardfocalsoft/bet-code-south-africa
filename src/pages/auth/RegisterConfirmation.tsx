
import React from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Clock } from "lucide-react";

const RegisterConfirmation = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "";
  
  const isSeller = role === "seller";
  
  return (
    <Layout>
      <div className="container max-w-xl py-16">
        <div className="betting-card p-8 text-center space-y-6">
          <div className="flex justify-center">
            {isSeller ? (
              <Clock className="h-16 w-16 text-amber-500" />
            ) : (
              <Mail className="h-16 w-16 text-betting-green" />
            )}
          </div>
          
          <Heading as="h1" size="xl" className="text-center">
            {isSeller ? "Account Awaiting Approval" : "Registration Complete"}
          </Heading>
          
          {isSeller ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Thank you for registering as a seller! Your account is currently under review.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-4 text-left">
                <h3 className="font-semibold text-amber-500 mb-2">Next Steps:</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>An administrator will review your account</li>
                  <li>This process typically takes 1-2 business days</li>
                  <li>You'll receive an email notification once approved</li>
                  <li>You will not be able to log in until your account is approved</li>
                </ul>
              </div>
              <p className="text-muted-foreground">
                If you have any questions, please contact our support team.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Thank you for registering! You can now log in to your account.
              </p>
              <p className="text-muted-foreground">
                We've sent a confirmation email to your address. Please check your inbox.
              </p>
            </div>
          )}
          
          <div className="pt-4">
            <Button asChild className="w-full">
              <Link to="/auth/login">
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterConfirmation;
