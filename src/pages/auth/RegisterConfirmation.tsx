
import React from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

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
              <CheckCircle className="h-16 w-16 text-betting-green" />
            ) : (
              <Mail className="h-16 w-16 text-betting-green" />
            )}
          </div>
          
          <Heading as="h1" size="xl" className="text-center">
            {isSeller ? "Seller Account Created!" : "Registration Complete"}
          </Heading>
          
          {isSeller ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Congratulations! Your seller account has been created and is ready to use.
              </p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-md p-4 text-left">
                <h3 className="font-semibold text-green-500 mb-2">You can now:</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Create and sell betting tickets</li>
                  <li>Manage your seller profile</li>
                  <li>Track your sales and earnings</li>
                  <li>Interact with your subscribers</li>
                </ul>
              </div>
              <p className="text-muted-foreground">
                Click below to access your seller dashboard and start selling tickets!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Thank you for registering!
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
