
import React from "react";
import Layout from "@/components/layout/Layout";
import LoginForm from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login: React.FC = () => {
  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="bg-betting-dark-gray border-betting-light-gray">
          <CardHeader>
            <CardTitle className="text-2xl">Log In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
