
import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2 } from "lucide-react";

interface LoginButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
}

const LoginButton: React.FC<LoginButtonProps> = ({ isLoading, isDisabled }) => {
  return (
    <Button
      type="submit"
      disabled={isLoading || isDisabled}
      className="w-full bg-betting-green hover:bg-betting-green-dark transition-colors"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Logging in...</span>
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4 mr-2" />
          <span>Log in</span>
        </>
      )}
    </Button>
  );
};

export default LoginButton;
