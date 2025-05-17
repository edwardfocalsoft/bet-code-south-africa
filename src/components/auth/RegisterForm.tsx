
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/types";
import { User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Form schema with validation
const formSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const RegisterForm: React.FC = () => {
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

  // Initialize react-hook-form with zod validation
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: FormData) => {
    setIsLoading(true);
    setServerError("");
    
    try {
      const { email, password } = values;
      
      // Call register function from auth context
      const user = await register(email, password, role);
      
      if (user) {
        uiToast({
          title: "Account created",
          description: "Your account has been created successfully.",
        });
        
        if (role === "seller") {
          // Sellers must wait for approval
          navigate("/auth/register/confirmation", { state: { role } });
        } else {
          // Buyers can proceed to dashboard
          navigate("/auth/register/confirmation");
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle email-specific errors specially
      if (error.message?.toLowerCase().includes("email")) {
        setServerError(error.message);
        form.setError("email", { 
          type: "manual", 
          message: error.message || "Invalid email format" 
        });
        toast.error(error.message || "Invalid email format");
      } else {
        setServerError(error.message || "Registration failed");
        uiToast({
          title: "Registration failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const changeRole = (value: string) => {
    setRole(value as "buyer" | "seller");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        {serverError && (
          <div className="p-3 bg-destructive/15 border border-destructive rounded-md text-destructive text-sm">
            {serverError}
          </div>
        )}
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="your@email.com"
                    className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••••"
                    className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••••"
                    className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
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
      </form>
    </Form>
  );
};

export default RegisterForm;
