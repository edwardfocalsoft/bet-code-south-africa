
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import { useCases } from "@/hooks/useCases";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink } from "lucide-react";

const CasesPage: React.FC = () => {
  const { userCases, isLoading } = useCases();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "in_progress":
      case "in progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "refunded":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "closed":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <Layout>
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
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
              </div>
            ) : userCases && userCases.length > 0 ? (
              <Table>
                <TableCaption>
                  Your support case history
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userCases.map((caseItem) => (
                    <TableRow key={caseItem.id} className="cursor-pointer hover:bg-betting-light-gray/10" onClick={() => navigate(`/user/cases/${caseItem.id}`)}>
                      <TableCell className="font-medium">{caseItem.case_number}</TableCell>
                      <TableCell>{caseItem.title}</TableCell>
                      <TableCell>{format(new Date(caseItem.created_at), "PPP")}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(caseItem.status)}
                        >
                          {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/user/cases/${caseItem.id}`);
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg font-medium mb-2">No cases found</p>
                <p className="text-muted-foreground mb-6">
                  You haven't reported any issues yet
                </p>
                <Link to="/buyer/purchases">
                  <Button className="bg-betting-green hover:bg-betting-green-dark">
                    View My Purchases
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CasesPage;
