
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/types";
import { User, Users } from "lucide-react";

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    setPasswordError("");
    setIsLoading(true);
    
    try {
      const user = await register(email, password, role);
      
      if (user) {
        if (role === "seller") {
          // Sellers must wait for approval
          navigate("/auth/register/confirmation", { state: { role } });
        } else {
          // Buyers can proceed to dashboard
          navigate("/buyer/dashboard");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const changeRole = (value: string) => {
    setRole(value as "buyer" | "seller");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="buyer" className="w-full" onValueChange={changeRole}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="buyer" className="data-[state=active]:bg-betting-green">
            <User className="h-4 w-4 mr-2" />
            Sign up as Buyer
          </TabsTrigger>
          <TabsTrigger value="seller" className="data-[state=active]:bg-betting-green">
            <Users className="h-4 w-4 mr-2" />
            Sign up as Seller
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="buyer">
          <div className="space-y-1 text-sm text-muted-foreground mb-4">
            <p>As a buyer, you can:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Browse all available betting codes</li>
              <li>Purchase premium predictions</li>
              <li>Rate sellers and their tickets</li>
              <li>Earn loyalty points for future discounts</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="seller">
          <div className="space-y-1 text-sm text-muted-foreground mb-4">
            <p>As a seller, you can:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Share free and paid betting codes</li>
              <li>Build your reputation with good predictions</li>
              <li>Earn commission from your betting knowledge</li>
              <li>Gain followers and visibility on the platform</li>
            </ul>
            <p className="mt-2 font-medium text-betting-accent">
              Note: Seller accounts require admin approval before activation.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-4">
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
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••"
            required
            className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white"
          />
          {passwordError && (
            <p className="mt-1 text-sm text-destructive">{passwordError}</p>
          )}
        </div>
      </div>
      
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-betting-green hover:bg-betting-green-dark"
        >
          {isLoading ? (
            <span>Creating account...</span>
          ) : (
            <span>Create Account</span>
          )}
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
    </form>
  );
};

export default RegisterForm;
