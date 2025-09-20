import React from "react";
import Layout from "@/components/layout/Layout";
import LoginForm from "@/components/auth/LoginForm";
const Login: React.FC = () => {
  return <Layout redirectIfAuth={true}>
      <div className="container mx-auto max-w-md py-12">
        <div className="betting-card p-6 md:p-8">
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Log in to access your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </Layout>;
};
export default Login;