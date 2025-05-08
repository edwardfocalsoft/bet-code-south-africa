
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
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
      setErrorMessage(error.message || "Login failed. Please try again.");
      toast.error("Login failed", {
        description: error.message || "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
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
          disabled={isLoading}
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
          disabled={isLoading}
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
        disabled={isLoading}
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
    </form>
  );
};

export default LoginForm;
