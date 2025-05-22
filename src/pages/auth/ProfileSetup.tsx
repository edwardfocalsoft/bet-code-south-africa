
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ProfileSetup: React.FC = () => {
  const { currentUser, userRole } = useAuth();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.username) {
      // User already has a profile setup, redirect to their dashboard
      redirectToDashboard();
    }
  }, [currentUser]);
  
  const checkUsernameAvailability = async (username: string) => {
    if (!username.trim()) return;
    
    setIsChecking(true);
    setIsAvailable(true);
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      
      setIsAvailable(!data);
    } catch (error) {
      console.error("Error checking username availability:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // Add debounce to username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.trim()) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const redirectToDashboard = () => {
    if (userRole === "admin") {
      navigate("/admin/dashboard");
    } else if (userRole === "seller") {
      navigate("/seller/dashboard");
    } else {
      navigate("/buyer/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    if (!isAvailable) {
      toast.error("Username already taken. Please choose another one.");
      return;
    }

    setIsLoading(true);
    try {
      // Check again if username already exists (in case of race condition)
      const { data: existingUsers, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existingUsers) {
        toast.error("Username already taken. Please choose another one.");
        setIsLoading(false);
        return;
      }

      // Update the user's profile with the username
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", currentUser?.id);

      if (updateError) throw updateError;

      toast.success("Profile setup completed!");
      
      // Redirect based on user role
      redirectToDashboard();
    } catch (error: any) {
      toast.error(`Error setting up profile: ${error.message}`);
      console.error("Profile setup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="container max-w-md mx-auto py-12 px-4">
          <Card className="bg-betting-dark-gray border-betting-light-gray">
            <CardHeader>
              <CardTitle>Please Login</CardTitle>
              <CardDescription>
                You need to be logged in to set up your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate("/auth/login")}>Go to Login</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavigation>
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="bg-betting-dark-gray border-betting-light-gray">
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Please choose a username to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="Choose a unique username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className={`bg-betting-black border-betting-light-gray pr-10 ${
                      !isAvailable && username ? "border-red-500" : ""
                    }`}
                  />
                  {isChecking && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {!isAvailable && username && (
                  <p className="text-sm text-red-500 mt-1">
                    This username is already taken
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-betting-green hover:bg-betting-green-dark"
                disabled={isLoading || isChecking || !isAvailable || !username.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileSetup;
