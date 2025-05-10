
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Database, Copy, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SeedDatabase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("create");

  const createAdminSql = `-- Insert admin user
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', '6102564c-9981-45d1-a773-7dff8ef27fd1', 'authenticated', 'authenticated', 'admin@bettickets.com', '$2a$10$CvXACY1DNDxDumqj5Dn4XeSMQwakYSZZnW2.9eRqjK3YYQUFhXQJa', '2023-01-01 00:00:00+00', null, '2023-01-01 00:00:00+00', '{"provider": "email", "providers": ["email"]}', '{"role": "admin"}', '2023-01-01 00:00:00+00', '2023-01-01 00:00:00+00', '', null, '', '');

-- Update the profile to be an admin
INSERT INTO public.profiles (id, email, role, approved)
VALUES ('6102564c-9981-45d1-a773-7dff8ef27fd1', 'admin@bettickets.com', 'admin', true);`;

  const fixAdminSql = `-- Fix the admin account - first update the profile if it exists
UPDATE public.profiles 
SET role = 'admin', approved = true 
WHERE id = '6102564c-9981-45d1-a773-7dff8ef27fd1';

-- If profile doesn't exist, create it
INSERT INTO public.profiles (id, email, role, approved)
SELECT '6102564c-9981-45d1-a773-7dff8ef27fd1', 'admin@bettickets.com', 'admin'::user_role, true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '6102564c-9981-45d1-a773-7dff8ef27fd1');

-- Fix user metadata if needed
UPDATE auth.users
SET raw_user_meta_data = '{"role": "admin"}'
WHERE id = '6102564c-9981-45d1-a773-7dff8ef27fd1';`;

  const deleteAdminSql = `-- Use the Supabase admin function to delete the user
-- This must be run from the SQL editor with admin privileges
SELECT supabase_admin.delete_user('6102564c-9981-45d1-a773-7dff8ef27fd1');`;

  const handleCopySQL = (sql: string, type: string) => {
    navigator.clipboard.writeText(sql);
    toast.success(`${type} SQL copied to clipboard!`);
  };

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
                    <li>Return to the login page and try logging in with the admin credentials</li>
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
                    <li>Return to the login page and try logging in with the admin credentials</li>
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
            
            <div className="flex justify-center mt-6">
              <Button asChild className="bg-betting-green hover:bg-betting-green-dark">
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
