
import React from "react";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CasesCardContent from "@/components/cases/CasesCardContent";

const CasesPage: React.FC = () => {
  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Cases</h1>

        <Card className="betting-card">
          <CardHeader>
            <CardTitle>Support Cases</CardTitle>
            <CardDescription>
              View and manage your reported issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CasesCardContent />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CasesPage;
