
import React from "react";
import { cn } from "@/lib/utils";
import { useLoginForm } from "./login/useLoginForm";
import FormAlert from "./login/FormAlert";
import EmailInput from "./login/EmailInput";
import PasswordInput from "./login/PasswordInput";
import RememberMeOption from "./login/RememberMeOption";
import LoginButton from "./login/LoginButton";
import ServiceDownMessage from "./login/ServiceDownMessage";
import RegisterLink from "./login/RegisterLink";

const LoginForm: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMessage,
    isServiceDown,
    showPassword,
    toggleShowPassword,
    rememberMe,
    setRememberMe,
    formShake,
    handleSubmit,
    handleKeyDown
  } = useLoginForm();

  const isFormDisabled = isLoading || isServiceDown;

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "space-y-4 transition-all", 
        formShake && "animate-wiggle"
      )}
      onKeyDown={handleKeyDown}
    >
      <FormAlert 
        isServiceDown={isServiceDown} 
        errorMessage={errorMessage} 
      />
      
      <EmailInput 
        email={email} 
        setEmail={setEmail} 
        isDisabled={isFormDisabled} 
      />
      
      <PasswordInput 
        password={password} 
        setPassword={setPassword}
        showPassword={showPassword}
        toggleShowPassword={toggleShowPassword}
        isDisabled={isFormDisabled}
      />
      
      <div className="flex items-center justify-between">
        <RememberMeOption 
          rememberMe={rememberMe} 
          setRememberMe={setRememberMe}
          isDisabled={isFormDisabled} 
        />
        
        <a href="/forgot-password" className="text-sm text-betting-green hover:underline transition-colors">
          Forgot password?
        </a>
      </div>
      
      <LoginButton 
        isLoading={isLoading} 
        isDisabled={isFormDisabled} 
      />
      
      <ServiceDownMessage isServiceDown={isServiceDown} />
      
      <RegisterLink />
    </form>
  );
};

export default LoginForm;
