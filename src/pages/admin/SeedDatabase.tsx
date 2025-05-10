
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Database, Copy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const SeedDatabase: React.FC = () => {
  const adminSql = `-- Insert admin user
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', '6102564c-9981-45d1-a773-7dff8ef27fd1', 'authenticated', 'authenticated', 'admin@bettickets.com', '$2a$10$CvXACY1DNDxDumqj5Dn4XeSMQwakYSZZnW2.9eRqjK3YYQUFhXQJa', '2023-01-01 00:00:00+00', null, '2023-01-01 00:00:00+00', '{"provider": "email", "providers": ["email"]}', '{"role": "admin"}', '2023-01-01 00:00:00+00', '2023-01-01 00:00:00+00', '', null, '', '');

-- Update the profile to be an admin
INSERT INTO public.profiles (id, email, role, approved)
VALUES ('6102564c-9981-45d1-a773-7dff8ef27fd1', 'admin@bettickets.com', 'admin', true);`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(adminSql);
    toast.success("SQL copied to clipboard!");
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
              Follow these steps to create the admin account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/50">
              <Database className="h-4 w-4" />
              <AlertTitle>Database Needs Seeding</AlertTitle>
              <AlertDescription>
                The admin account hasn't been created yet. You need to run the seeding script to set up the initial data.
              </AlertDescription>
            </Alert>
            
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
                    onClick={handleCopySQL}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">{adminSql}</pre>
                </div>
                <li>Run the SQL query</li>
                <li>Return to the login page and try logging in with the admin credentials</li>
              </ol>
            </div>
            
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
