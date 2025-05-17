
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { UserRole } from "@/types";
import { EMAIL_REGEX } from "@/utils/validation";

// Form schema with validation
const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine((email) => {
      // Log validation attempt for debugging
      console.log("Form validation for email:", email);
      return EMAIL_REGEX.test(email.trim());
    }, "Please enter a valid email address"),
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

export type FormData = z.infer<typeof formSchema>;

export const useRegisterForm = () => {
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
      
      console.log("Form submission with email:", email);
      
      // Call register function from auth context
      const user = await register(email, password, role as UserRole);
      
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

  return {
    form,
    role,
    changeRole,
    isLoading,
    serverError,
    handleSubmit: form.handleSubmit(handleSubmit)
  };
};
