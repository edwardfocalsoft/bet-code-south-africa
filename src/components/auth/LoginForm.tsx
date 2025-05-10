
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
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

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
    needsSeeding,
    handleSeedDatabase,
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
      
      {needsSeeding && (
        <div className="p-4 border border-yellow-500 bg-yellow-500/10 rounded-md">
          <p className="text-sm text-yellow-600 mb-3">
            It looks like the admin account is not set up yet. The database might need seeding.
            Please follow the instructions in supabase/seed.js to create the admin account.
          </p>
          <Button 
            type="button" 
            onClick={handleSeedDatabase}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
            disabled={isLoading}
          >
            <Database className="h-4 w-4 mr-2" />
            View Seeding Instructions
          </Button>
        </div>
      )}
      
      <ServiceDownMessage isServiceDown={isServiceDown} />
      
      <RegisterLink />
    </form>
  );
};

export default LoginForm;
