
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CreateTicketForm from "@/components/seller/tickets/CreateTicketForm";

const CreateTicket: React.FC = () => {
  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Betting Ticket</h1>
        
        <Card className="betting-card">
          <CardHeader>
            <CardTitle>Create a New Betting Ticket</CardTitle>
            <CardDescription>
              Share your betting knowledge and earn from your predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTicketForm />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateTicket;
