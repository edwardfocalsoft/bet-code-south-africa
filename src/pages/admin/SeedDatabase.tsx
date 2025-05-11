
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Database, Copy, RefreshCw, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const SeedDatabase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("create");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "failure" | null>(null);
  const navigate = useNavigate();

  // Updated SQL with better error handling and conditional logic
  const createAdminSql = `-- Insert admin user with ON CONFLICT DO NOTHING to prevent duplicate errors
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', '6102564c-9981-45d1-a773-7dff8ef27fd1', 'authenticated', 'authenticated', 'admin@bettickets.com', '$2a$10$CvXACY1DNDxDumqj5Dn4XeSMQwakYSZZnW2.9eRqjK3YYQUFhXQJa', '2023-01-01 00:00:00+00', null, '2023-01-01 00:00:00+00', '{"provider": "email", "providers": ["email"]}', '{"role": "admin"}', '2023-01-01 00:00:00+00', '2023-01-01 00:00:00+00', '', null, '', '')
ON CONFLICT (id) DO NOTHING;

-- Update or create the admin profile
INSERT INTO public.profiles (id, email, role, approved)
VALUES ('6102564c-9981-45d1-a773-7dff8ef27fd1', 'admin@bettickets.com', 'admin', true)
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  approved = true,
  email = 'admin@bettickets.com';`;

  // Significantly improved fix SQL to handle all potential issues
  const fixAdminSql = `-- Comprehensive fix for the admin account

-- First, ensure the user exists in auth.users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '6102564c-9981-45d1-a773-7dff8ef27fd1') THEN
    INSERT INTO auth.users 
      (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES
      ('00000000-0000-0000-0000-000000000000', '6102564c-9981-45d1-a773-7dff8ef27fd1', 'authenticated', 'authenticated', 'admin@bettickets.com', '$2a$10$CvXACY1DNDxDumqj5Dn4XeSMQwakYSZZnW2.9eRqjK3YYQUFhXQJa', '2023-01-01 00:00:00+00', '2023-01-01 00:00:00+00', '{"provider": "email", "providers": ["email"]}', '{"role": "admin"}', '2023-01-01 00:00:00+00', '2023-01-01 00:00:00+00');
  ELSE
    -- Update existing user if needed
    UPDATE auth.users 
    SET 
      raw_user_meta_data = '{"role": "admin"}',
      email = 'admin@bettickets.com',
      encrypted_password = '$2a$10$CvXACY1DNDxDumqj5Dn4XeSMQwakYSZZnW2.9eRqjK3YYQUFhXQJa'
    WHERE id = '6102564c-9981-45d1-a773-7dff8ef27fd1';
  END IF;
END $$;

-- Now ensure the profile exists and is correct
INSERT INTO public.profiles (id, email, role, approved)
VALUES ('6102564c-9981-45d1-a773-7dff8ef27fd1', 'admin@bettickets.com', 'admin', true)
ON CONFLICT (id) DO UPDATE SET 
  email = 'admin@bettickets.com',
  role = 'admin',
  approved = true,
  suspended = false;

-- Remove any other profiles that might be using admin@bettickets.com to avoid conflicts
UPDATE public.profiles 
SET email = email || '.duplicate'
WHERE email = 'admin@bettickets.com' AND id != '6102564c-9981-45d1-a773-7dff8ef27fd1';`;

  // Corrected delete SQL that won't use the non-existent supabase_auth schema
  const deleteAdminSql = `-- Safe deletion of admin account that handles dependencies
-- First delete the profile (less critical)
DELETE FROM public.profiles WHERE id = '6102564c-9981-45d1-a773-7dff8ef27fd1';

-- Then delete the user from auth.users table
DELETE FROM auth.users WHERE id = '6102564c-9981-45d1-a773-7dff8ef27fd1';`;

  const handleCopySQL = (sql: string, type: string) => {
    navigator.clipboard.writeText(sql);
    toast.success(`${type} SQL copied to clipboard!`);
  };

  const handleTestAdminConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Clear any existing auth state first
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      // Try to sign out first to ensure clean state
      await supabase.auth.signOut({ scope: 'global' });
      
      // Attempt to sign in with admin credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@bettickets.com',
        password: 'AdminPassword123!'
      });
      
      if (error) {
        console.error("Admin login test failed:", error);
        setTestResult("failure");
        toast.error("Admin login test failed: " + error.message);
      } else if (data?.user) {
        console.log("Admin login test successful:", data.user);
        setTestResult("success");
        toast.success("Admin login test successful! Redirecting to admin dashboard...");
        
        // Give the toast time to be seen before redirecting
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      console.error("Admin login test error:", err);
      setTestResult("failure");
      toast.error("Admin login test error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Attempt to detect if admin account might already exist
  useEffect(() => {
    const checkForAdmin = async () => {
      try {
        // Try to sign in with admin credentials
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@bettickets.com',
          password: 'AdminPassword123!'
        });
        
        if (!error && data?.user) {
          // Admin exists and password works!
          setTestResult("success");
          setActiveTab("fix"); // Set to fix tab as that's most likely to be useful
        }
        
        // Always sign out after this check
        await supabase.auth.signOut();
      } catch (err) {
        // Silent failure is fine here, we're just checking
        console.log("Admin check failed silently:", err);
      }
    };
    
    checkForAdmin();
  }, []);

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <Link to="/auth/login" className="flex items-center text-betting-green hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Login
        </Link>
        
        <Card className="bg-betting-dark-gray border-betting-light-gray">
          <CardHeader>
            <CardTitle className="text-2xl">Database Seeding Instructions</CardTitle>
            <CardDescription>
              Follow these steps to create or fix the admin account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-400">
              <Database className="h-4 w-4" />
              <AlertTitle>Database Management Required</AlertTitle>
              <AlertDescription>
                {activeTab === "create" 
                  ? "The admin account needs to be created. You need to run the seeding script to set up the initial data."
                  : activeTab === "fix" 
                    ? "The admin account exists but may need to be fixed. Run this SQL to update it."
                    : "Use this option to delete the existing admin account if you're encountering duplicate key errors."
                }
              </AlertDescription>
            </Alert>
            
            <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Create Admin</TabsTrigger>
                <TabsTrigger value="fix">Fix Admin</TabsTrigger>
                <TabsTrigger value="delete">Delete Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Admin Credentials</h3>
                  <div className="bg-black/50 p-4 rounded-md">
                    <p className="font-mono text-sm">Email: admin@bettickets.com</p>
                    <p className="font-mono text-sm">Password: AdminPassword123!</p>
                  </div>
                  
                  <h3 className="text-lg font-medium">Seeding Instructions</h3>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to the SQL Editor</li>
                    <li>Create a new query and paste the following SQL:</li>
                    <div className="bg-black/50 p-4 rounded-md relative">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => handleCopySQL(createAdminSql, "Create Admin")}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">{createAdminSql}</pre>
                    </div>
                    <li>Run the SQL query</li>
                    <li>Test the admin account with the button below:</li>
                  </ol>
                </div>
              </TabsContent>
              
              <TabsContent value="fix" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Fix Admin Account</h3>
                  <p>If the admin account exists but isn't working properly, run this SQL to fix it:</p>
                  
                  <div className="bg-black/50 p-4 rounded-md relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => handleCopySQL(fixAdminSql, "Fix Admin")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">{fixAdminSql}</pre>
                  </div>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>Run the SQL query in your Supabase SQL Editor</li>
                    <li>Test the admin account with the button below:</li>
                  </ol>
                </div>
              </TabsContent>
              
              <TabsContent value="delete" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Delete Admin Account</h3>
                  <Alert className="bg-red-500/10 border-red-500/50 text-red-400">
                    <AlertTitle>Warning: Destructive Action</AlertTitle>
                    <AlertDescription>
                      This will delete the admin account. Only use this if you're encountering duplicate key errors and need to start fresh.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-black/50 p-4 rounded-md relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => handleCopySQL(deleteAdminSql, "Delete Admin")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">{deleteAdminSql}</pre>
                  </div>
                  
                  <p className="text-sm text-yellow-400">
                    After deleting the admin user, return to the "Create Admin" tab to create a fresh admin account.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex flex-col gap-4 items-center mt-6">
              <Button 
                onClick={handleTestAdminConnection}
                disabled={isLoading}
                className={`w-full ${
                  testResult === "success" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : testResult === "failure"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-betting-green hover:bg-betting-green-dark"
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing Admin Connection...
                  </>
                ) : testResult === "success" ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Admin Connection Successful! Click to continue
                  </>
                ) : testResult === "failure" ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Admin Connection Failed - Try Again
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Test Admin Connection
                  </>
                )}
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth/login">
                  Return to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SeedDatabase;
