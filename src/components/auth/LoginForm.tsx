
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isServiceDown, setIsServiceDown] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsServiceDown(false);
    setIsLoading(true);
    
    try {
      const user = await login(email, password);
      
      if (!user) {
        // Login failed but no error was thrown
        // Error toast is already shown in the login function
        console.log("Login failed with no specific error");
      }
      // Navigation is handled in the login function
    } catch (error: any) {
      console.error("Login form error:", error);
      
      // Check for service unavailability
      if (
        error.message?.includes("Database error") || 
        error.message?.includes("querying schema") ||
        error.message?.includes("temporarily unavailable")
      ) {
        setIsServiceDown(true);
        setErrorMessage("Authentication service is temporarily unavailable. Please try again in a few minutes.");
        toast.error("Service Unavailable", {
          description: "Our authentication service is temporarily down. Please try again later.",
        });
      } else {
        setErrorMessage(error.message || "Login failed. Please try again.");
        toast.error("Login failed", {
          description: error.message || "Please check your credentials and try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isServiceDown && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            Authentication service is temporarily unavailable.
            Please try again later.
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && !isServiceDown && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-sm text-red-500">
          {errorMessage}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white"
          disabled={isLoading || isServiceDown}
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
          required
          className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white"
          disabled={isLoading || isServiceDown}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-betting-light-gray bg-betting-light-gray text-betting-green focus:ring-betting-green"
          />
          <label htmlFor="remember" className="ml-2 block text-sm">
            Remember me
          </label>
        </div>
        
        <a href="/forgot-password" className="text-sm text-betting-green hover:underline">
          Forgot password?
        </a>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading || isServiceDown}
        className="w-full bg-betting-green hover:bg-betting-green-dark"
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
      
      {isServiceDown && (
        <p className="text-center text-sm text-amber-500">
          Our authentication service is currently experiencing issues. 
          You can try again later or contact support if the problem persists.
        </p>
      )}
    </form>
  );
};

export default LoginForm;
