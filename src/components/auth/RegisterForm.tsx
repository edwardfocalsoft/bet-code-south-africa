
import React from "react";
import { Form } from "@/components/ui/form";
import { useRegisterForm } from "./register/useRegisterForm";
import RoleSelector from "./register/RoleSelector";
import RegisterFormFields from "./register/RegisterFormFields";
import ServerError from "./register/ServerError";
import RegisterFormFooter from "./register/RegisterFormFooter";
import GoogleAuthButton from "./GoogleAuthButton";
import AuthDivider from "./AuthDivider";

const RegisterForm: React.FC = () => {
  const {
    form,
    role,
    changeRole,
    isLoading,
    serverError,
    handleSubmit
  } = useRegisterForm();

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <RoleSelector 
          selectedRole={role} 
          onRoleChange={changeRole} 
        />

        {serverError && <ServerError error={serverError} />}
        
        <GoogleAuthButton 
          mode="signup" 
          role={role}
          isLoading={isLoading}
        />
        
        <AuthDivider />
        
        <RegisterFormFields />
        
        <RegisterFormFooter isLoading={isLoading} />
      </form>
    </Form>
  );
};

export default RegisterForm;
