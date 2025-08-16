
import React from "react";
import Layout from "@/components/layout/Layout";
import RegisterForm from "@/components/auth/RegisterForm";

const Register: React.FC = () => {
  return (
    <Layout redirectIfAuth={true}>
      <div className="container mx-auto max-w-md py-12">
        <div className="betting-card p-6 md:p-8">
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-2xl font-bold">Create an Account</h1>
            <p className="text-muted-foreground">
              Join our community of bettors and sellers
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </Layout>
  );
};

export default Register;
