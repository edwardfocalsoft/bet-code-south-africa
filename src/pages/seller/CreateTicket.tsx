
import React from "react";
import Layout from "@/components/layout/Layout";

const SellerCreateTicket: React.FC = () => {
  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Ticket</h1>
        <p className="text-muted-foreground mb-8">
          Create ticket functionality will be implemented in the next phase.
        </p>
        <div className="betting-card p-6">
          <p className="text-center py-8 text-muted-foreground">
            This feature is coming soon.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SellerCreateTicket;
