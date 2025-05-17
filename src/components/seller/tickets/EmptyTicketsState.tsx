
import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyTicketsStateProps {
  activeFilter: 'all' | 'active' | 'expired';
}

const EmptyTicketsState: React.FC<EmptyTicketsStateProps> = ({ activeFilter }) => {
  return (
    <Card className="betting-card">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <div className="mb-4">
            {activeFilter === 'all' ? (
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            ) : activeFilter === 'active' ? (
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            ) : (
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-medium mb-2">No tickets found</h3>
          <p className="text-muted-foreground mb-6">
            {activeFilter === 'all' 
              ? "You haven't created any tickets yet."
              : activeFilter === 'active'
              ? "You don't have any active tickets."
              : "You don't have any expired tickets."
            }
          </p>
          <Button className="bg-betting-green hover:bg-betting-green-dark" asChild>
            <Link to="/seller/tickets/create">Create Your First Ticket</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyTicketsState;
