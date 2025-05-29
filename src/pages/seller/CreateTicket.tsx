
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CreateTicketForm from "@/components/seller/tickets/CreateTicketForm";

const CreateTicket: React.FC = () => {
  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Create New Betting Ticket</h1>
        
        <Card className="betting-card border-0 sm:border shadow-none sm:shadow-sm p-0 sm:p-6 bg-transparent sm:bg-betting-dark-gray">
          <CardHeader className="px-0 sm:px-6 pt-0 sm:pt-6">
            <CardTitle className="text-lg sm:text-xl">Create a New Betting Ticket</CardTitle>
            <CardDescription className="text-sm">
              Share your betting knowledge and earn from your predictions
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <CreateTicketForm />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateTicket;
