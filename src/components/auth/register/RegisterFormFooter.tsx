
import React from "react";
import { Button } from "@/components/ui/button";

interface RegisterFormFooterProps {
  isLoading: boolean;
}

const RegisterFormFooter: React.FC<RegisterFormFooterProps> = ({ isLoading }) => {
  return (
    <div className="pt-2">
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-betting-green hover:bg-betting-green-dark"
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
      
      <p className="mt-4 text-sm text-center text-muted-foreground">
        By creating an account, you agree to our{" "}
        <a href="/terms" className="text-betting-green hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-betting-green hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default RegisterFormFooter;
