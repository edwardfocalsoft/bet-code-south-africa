
import React from "react";
import Layout from "@/components/layout/Layout";
import RegisterForm from "@/components/auth/RegisterForm";
import { Card } from "@/components/ui/card";

const Register: React.FC = () => {
  return (
    <Layout redirectIfAuth={true}>
      <div className="container mx-auto max-w-md py-12">
        <Card className="space-y-6 p-8 shadow-lg border-betting-light-gray bg-betting-dark">
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-2xl font-bold">Create an Account</h1>
            <p className="text-muted-foreground">
              Join our community of bettors and sellers
            </p>
          </div>
          <RegisterForm />
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
