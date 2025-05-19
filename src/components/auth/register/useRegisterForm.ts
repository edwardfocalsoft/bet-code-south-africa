
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/types";

// Define the form schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Type for form data
type FormData = z.infer<typeof formSchema>;

export const useRegisterForm = () => {
  const [role, setRole] = useState<UserRole>("buyer");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register: signUp } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const user = await signUp(data.email, data.password, role);
      
      if (user) {
        // Navigate to confirmation page with role parameter
        navigate(`/auth/register/confirmation?role=${role}`);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setServerError(error.message || "Failed to create account. Please try again.");
      
      // Handle specific error types
      if (error.message.includes("already registered")) {
        setServerError("This email is already registered. Please log in or use a different email.");
      }
    } finally {
      setIsLoading(false);
    }
  });

  const changeRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  return {
    form,
    role,
    changeRole,
    isLoading,
    serverError,
    handleSubmit
  };
};

export default useRegisterForm;
