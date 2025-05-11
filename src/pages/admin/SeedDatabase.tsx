
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Database, Copy, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/contexts/auth/authUtils";

const SeedDatabase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("fix");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "failure" | null>(null);
  const navigate = useNavigate();

  // SQL statements for admin account management
  const createAdminSql = `-- Create admin user
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, 
  role, aud, confirmation_token, recovery_token, 
  email_change_token_new, email_change
)
VALUES (
  '6102564c-9981-45d1-a773-7dff8ef27fd1', 'admin@bettickets.com', 
  '$2a$10$CvXACY1DNDxDumqj5Dn4XeSMQwakYSZZnW2.9eRqjK3YYQUFhXQJa', 
  now(), 'authenticated', 'authenticated', '', '', '', ''
)
ON CONFLICT (id) DO UPDATE SET
  email = 'admin@bettickets.com',
  encrypted_password = '$2a$10$CvXACY1DNDxDumqj5Dn4XeSMQwakYSZZnW2.9eRqjK3YYQUFhXQJa',
  email_confirmed_at = now(),
  raw_user_meta_data = '{"role": "admin"}';

-- Ensure profile exists with admin role
INSERT INTO public.profiles (id, email, role, approved)
VALUES ('6102564c-9981-45d1-a773-7dff8ef27fd1', 'admin@bettickets.com', 'admin', true)
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  approved = true,
  email = 'admin@bettickets.com';`;

  // Improved fix SQL with comprehensive approach
  const fixAdminSql = `-- Fix auth.users table issues
UPDATE auth.users
SET 
  email = 'admin@bettickets.com',
  encrypted_password = '$2a$10$CvXACY1DNDxDumqj5Dn4XeSMQwakYSZZnW2.9eRqjK3YYQUFhXQJa',
  email_confirmed_at = now(),
  raw_user_meta_data = '{"role": "admin"}',
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change = ''
WHERE id = '6102564c-9981-45d1-a773-7dff8ef27fd1';

-- Ensure email_change is not null
ALTER TABLE auth.users ALTER COLUMN email_change SET DEFAULT '';

-- Ensure profile exists with admin role
INSERT INTO public.profiles (id, email, role, approved)
VALUES ('6102564c-9981-45d1-a773-7dff8ef27fd1', 'admin@bettickets.com', 'admin', true)
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  approved = true,
  email = 'admin@bettickets.com';`;

  // Delete SQL statement
  const deleteAdminSql = `-- Delete admin profile first
DELETE FROM public.profiles WHERE id = '6102564c-9981-45d1-a773-7dff8ef27fd1';

-- Then delete the admin user
DELETE FROM auth.users WHERE id = '6102564c-9981-45d1-a773-7dff8ef27fd1';`;

  const handleCopySQL = (sql: string, type: string) => {
    navigator.clipboard.writeText(sql);
    toast.success(`${type} SQL copied to clipboard!`);
  };

  const handleTestAdminConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Clear any existing auth state
      cleanupAuthState();
      
      // Try to sign out first to ensure clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Pre-test signout failed, continuing", err);
      }
      
      // Attempt to sign in with admin credentials
      console.log("Testing admin login with admin@bettickets.com...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@bettickets.com',
        password: 'AdminPassword123!'
      });
      
      if (error) {
        console.error("Admin login test failed:", error);
        setTestResult("failure");
        
        if (error.message.includes("Database error") || 
            error.message.includes("querying schema") || 
            error.message.includes("email_change")) {
          toast.error("Admin login test failed due to database schema issue. Try using the 'Fix Admin' SQL which addresses common schema problems.");
        } else {
          toast.error("Admin login test failed: " + error.message);
        }
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
        const { error } = await supabase.auth.signInWithPassword({
          email: 'admin@bettickets.com',
          password: 'AdminPassword123!'
        });
        
        if (!error) {
          // Admin exists and password works!
          setTestResult("success");
        }
        
        // Always sign out after this check
        await supabase.auth.signOut();
      } catch (err) {
        // Silent failure is fine here, we're just checking
        console.log("Initial admin check failed silently:", err);
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
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Database Management Required</AlertTitle>
              <AlertDescription>
                {activeTab === "create" 
                  ? "The admin account needs to be created. You need to run the seeding script to set up the initial data."
                  : activeTab === "fix" 
                    ? "The admin account exists but may need to be fixed. Run this SQL to update it and fix any schema issues."
                    : "Use this option to delete the existing admin account if you're encountering duplicate key errors."
                }
              </AlertDescription>
            </Alert>
            
            <Tabs defaultValue="fix" value={activeTab} onValueChange={setActiveTab}>
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
                  <h3 className="text-lg font-medium">Fix Admin Account & Schema Issues</h3>
                  <p>This SQL will fix common schema problems including NULL values in auth.users columns that should not be NULL:</p>
                  
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
