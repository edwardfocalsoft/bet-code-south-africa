
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isServiceDown, setIsServiceDown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formShake, setFormShake] = useState(false);
  const { login } = useAuth();

  // Load saved email from localStorage if remember me was used
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password");
      return;
    }
    
    setErrorMessage("");
    setIsServiceDown(false);
    setIsLoading(true);
    
    try {
      // Special case for admin login from seed
      if (email === "admin@bettickets.com" && password === "AdminPassword123!") {
        toast.info("Using admin credentials. If login fails, the database might need seeding.");
      }
      
      const user = await login(email, password);
      
      // If remember me is checked, save the email
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      if (!user) {
        console.log("Login returned no user but no error was thrown");
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

  return {
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
    handleSubmit,
    handleKeyDown
  };
};
