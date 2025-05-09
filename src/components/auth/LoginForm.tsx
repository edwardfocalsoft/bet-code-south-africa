
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Loader2, AlertTriangle, Eye, EyeOff, Key, Mail } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isServiceDown, setIsServiceDown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formShake, setFormShake] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Load saved email from localStorage if remember me was used
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsServiceDown(false);
    setIsLoading(true);
    
    try {
      const user = await login(email, password);
      
      // If remember me is checked, save the email
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      if (!user) {
        // Login failed but no error was thrown
        console.log("Login failed with no specific error");
      }
      // Navigation is handled in the login function
    } catch (error: any) {
      console.error("Login form error:", error);
      
      // Activate the shake animation
      setFormShake(true);
      setTimeout(() => setFormShake(false), 500);
      
      // Check for service unavailability
      if (
        error.message?.includes("Database error") || 
        error.message?.includes("querying schema") ||
        error.message?.includes("temporarily unavailable") ||
        error.code === "unexpected_failure"
      ) {
        setIsServiceDown(true);
        setErrorMessage("Authentication service is temporarily unavailable. Please try again in a few minutes.");
        // Don't show toast as it's already shown in the login function
      } else {
        setErrorMessage(error.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !isServiceDown) {
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "space-y-4 transition-all", 
        formShake && "animate-wiggle"
      )}
      onKeyDown={handleKeyDown}
    >
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
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-sm text-red-500 animate-fade-in">
          {errorMessage}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white pl-10 transition-all"
            disabled={isLoading || isServiceDown}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <div className="relative">
          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            required
            className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white pl-10 pr-10"
            disabled={isLoading || isServiceDown}
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading || isServiceDown}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? 
              <EyeOff className="h-4 w-4" /> : 
              <Eye className="h-4 w-4" />
            }
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remember" 
            checked={rememberMe} 
            onCheckedChange={(checked) => setRememberMe(!!checked)} 
            className="h-4 w-4 rounded border-betting-light-gray bg-betting-light-gray text-betting-green focus:ring-betting-green"
            disabled={isLoading || isServiceDown}
          />
          <label 
            htmlFor="remember" 
            className="text-sm cursor-pointer select-none"
            onClick={() => !isLoading && !isServiceDown && setRememberMe(!rememberMe)}
          >
            Remember me
          </label>
        </div>
        
        <a href="/forgot-password" className="text-sm text-betting-green hover:underline transition-colors">
          Forgot password?
        </a>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading || isServiceDown}
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
      
      {isServiceDown && (
        <p className="text-center text-sm text-amber-500">
          Our authentication service is currently experiencing issues. 
          You can try again later or contact support if the problem persists.
        </p>
      )}
      
      <div className="pt-4 text-center text-sm">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <a href="/auth/register" className="text-betting-green hover:underline transition-colors">
            Create one
          </a>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
