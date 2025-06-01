
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isServiceDown, setIsServiceDown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formShake, setFormShake] = useState(false);
  const [needsSeeding, setNeedsSeeding] = useState(false);
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

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleSeedDatabase = async () => {
    setIsLoading(true);
    try {
      // Navigate to the seed confirmation page
      navigate("/admin/seed-database");
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password");
      return;
    }
    
    setErrorMessage("");
    setIsServiceDown(false);
    setNeedsSeeding(false);
    setIsLoading(true);
    
    try {
      // Special case for admin login from seed
      const isAdminLogin = email.toLowerCase() === "admin@bettickets.com";
      
      if (isAdminLogin) {
        console.log("Attempting admin login...");
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
        if (isAdminLogin) {
          setNeedsSeeding(true);
          setErrorMessage("Admin account not found or incorrectly set up. The database might need seeding.");
          navigate("/admin/seed-database");
        }
      }
      // Navigation is handled in the login function
    } catch (error: any) {
      console.error("Login form error:", error);
      
      // Activate the shake animation
      setFormShake(true);
      setTimeout(() => setFormShake(false), 500);
      
      // Check if this is an admin seeding issue
      const isAdminCredentials = email.toLowerCase() === "admin@bettickets.com";
      const isDatabaseIssue = 
        error.message?.includes("Database error") || 
        error.message?.includes("querying schema") ||
        error.message?.includes("temporarily unavailable") ||
        error.message?.includes("Scan error") ||
        error.message?.includes("NULL to string") ||
        error.code === "unexpected_failure";
      
      if (isAdminCredentials) {
        console.log("Admin login attempt failed, redirecting to seeding page");
        setNeedsSeeding(true);
        setErrorMessage("Admin account not found or incorrectly set up. The database might need seeding.");
        
        // Automatically navigate to the seeding page for admin
        setTimeout(() => {
          navigate("/admin/seed-database");
        }, 800);
      } else if (isDatabaseIssue) {
        setIsServiceDown(true);
        setErrorMessage("Authentication service is temporarily unavailable. Please try again in a few minutes.");
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
    needsSeeding,
    handleSeedDatabase,
    handleSubmit,
    handleKeyDown
  };
};
