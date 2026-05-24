
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SeedDatabase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("fix");

  // SQL templates for admin account management (no credentials embedded)
  const createAdminSql = `-- Promote an existing user to admin
-- 1. Create the user via the Supabase Auth dashboard or signup flow first.
-- 2. Then run:
UPDATE public.profiles
SET role = 'admin', approved = true
WHERE email = '<your-admin-email>';`;

  const fixAdminSql = `-- Ensure the profile row for an admin user is correct
UPDATE public.profiles
SET role = 'admin', approved = true
WHERE email = '<your-admin-email>';`;

  const deleteAdminSql = `-- Remove admin role from a profile (does not delete the auth user)
UPDATE public.profiles
SET role = 'buyer', approved = true
WHERE email = '<your-admin-email>';`;

  const handleCopySQL = (sql: string, type: string) => {
    navigator.clipboard.writeText(sql);
    toast.success(`${type} SQL copied to clipboard!`);
  };

  return (
    <Layout requireAuth allowedRoles={["admin"]}>
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <Link to="/admin/dashboard" className="flex items-center text-betting-green hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Admin Dashboard
        </Link>
        
        <Card className="bg-betting-dark-gray border-betting-light-gray">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Account Setup (Admins Only)</CardTitle>
            <CardDescription>
              Copy SQL templates to manage admin accounts via the Supabase SQL editor. Replace placeholders before running.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sensitive operation</AlertTitle>
              <AlertDescription>
                Never share admin credentials or paste them into client code. Create users through Supabase Auth and only adjust the role here.
              </AlertDescription>
            </Alert>
            
            <Tabs defaultValue="fix" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Promote Admin</TabsTrigger>
                <TabsTrigger value="fix">Repair Admin</TabsTrigger>
                <TabsTrigger value="delete">Demote Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Steps</h3>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>Create the user via the Supabase Auth dashboard or app signup.</li>
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to the SQL Editor</li>
                    <li>Replace the placeholder email and run the following SQL:</li>
                    <div className="bg-black/50 p-4 rounded-md relative">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => handleCopySQL(createAdminSql, "Promote Admin")}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">{createAdminSql}</pre>
                    </div>
                  </ol>
                </div>
              </TabsContent>
              
              <TabsContent value="fix" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Repair an admin profile</h3>
                  <p>Use this when an admin profile lost its role or approval flag.</p>
                  
                  <div className="bg-black/50 p-4 rounded-md relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => handleCopySQL(fixAdminSql, "Repair Admin")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">{fixAdminSql}</pre>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="delete" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Demote an admin</h3>
                  <Alert className="bg-red-500/10 border-red-500/50 text-red-400">
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      This removes admin privileges from a profile. The underlying auth user is preserved.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-black/50 p-4 rounded-md relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={() => handleCopySQL(deleteAdminSql, "Demote Admin")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">{deleteAdminSql}</pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex flex-col gap-4 items-center mt-6">
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/dashboard">
                  Back to Admin Dashboard
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
