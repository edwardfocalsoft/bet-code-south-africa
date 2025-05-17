
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import { useCases } from "@/hooks/useCases";
import { useAuth } from "@/contexts/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  Ticket,
  Clock,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CaseDetailsPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { 
    fetchCaseDetails, 
    addReply, 
    updateCaseStatus, 
    processRefund, 
    isLoading 
  } = useCases();
  const { userRole } = useAuth();
  
  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loadingCase, setLoadingCase] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");
  
  const isAdmin = userRole === "admin";

  useEffect(() => {
    const loadCaseDetails = async () => {
      if (!caseId) return;
      
      setLoadingCase(true);
      const details = await fetchCaseDetails(caseId);
      setCaseDetails(details);
      
      if (details) {
        setStatus(details.status);
      }
      
      setLoadingCase(false);
    };
    
    loadCaseDetails();
  }, [caseId, fetchCaseDetails]);

  const handleSendReply = async () => {
    if (!caseId || !replyContent.trim()) return;
    
    setSubmitting(true);
    const result = await addReply(caseId, replyContent.trim());
    
    if (result) {
      // Refresh case details
      const updatedCase = await fetchCaseDetails(caseId);
      setCaseDetails(updatedCase);
      setReplyContent("");
    }
    
    setSubmitting(false);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!caseId || newStatus === caseDetails?.status) return;
    
    setSubmitting(true);
    const success = await updateCaseStatus(caseId, newStatus);
    
    if (success) {
      // Refresh case details
      const updatedCase = await fetchCaseDetails(caseId);
      setCaseDetails(updatedCase);
      setStatus(newStatus);
    }
    
    setSubmitting(false);
  };

  const handleRefund = async () => {
    if (!caseId || !caseDetails) return;
    
    const { purchases } = caseDetails;
    if (!purchases || purchases.length === 0) return;
    
    const purchase = purchases[0];
    
    setSubmitting(true);
    const success = await processRefund(
      caseId,
      purchase.id,
      purchase.buyer_id,
      purchase.seller_id,
      purchase.price
    );
    
    if (success) {
      // Refresh case details
      const updatedCase = await fetchCaseDetails(caseId);
      setCaseDetails(updatedCase);
      setStatus("refunded");
    }
    
    setSubmitting(false);
  };

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

  if (loadingCase) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-betting-green" />
          <p className="mt-4 text-muted-foreground">Loading case details...</p>
        </div>
      </Layout>
    );
  }

  if (!caseDetails) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <p className="text-xl font-bold mb-4">Case not found</p>
          <Button onClick={() => navigate("/user/cases")} variant="default">
            Back to Cases
          </Button>
        </div>
      </Layout>
    );
  }

  const ticket = caseDetails.tickets?.[0];
  const purchase = caseDetails.purchases?.[0];

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/user/cases" className="text-betting-green hover:underline flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to All Cases
          </Link>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{caseDetails.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">Case #{caseDetails.case_number}</span>
              <span className="text-muted-foreground">•</span>
              <Badge variant="outline" className={getStatusColor(caseDetails.status)}>
                {caseDetails.status.charAt(0).toUpperCase() + caseDetails.status.slice(1)}
              </Badge>
            </div>
          </div>
          
          {isAdmin && caseDetails.status !== "refunded" && (
            <div className="flex items-center gap-3">
              <Select value={status} onValueChange={(value) => handleStatusUpdate(value)}>
                <SelectTrigger className="w-[180px] bg-betting-light-gray border-betting-light-gray">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              {(caseDetails.status === "open" || caseDetails.status === "in_progress") && (
                <Button 
                  onClick={handleRefund}
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Process Refund
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="betting-card mb-6">
              <CardHeader>
                <CardTitle>Issue Description</CardTitle>
                <CardDescription>
                  Reported on {format(new Date(caseDetails.created_at), "PPP p")}
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>{caseDetails.description}</p>
              </CardContent>
            </Card>
            
            <Card className="betting-card mb-6">
              <CardHeader>
                <CardTitle>Case History</CardTitle>
                <CardDescription>
                  Conversation history for this case
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseDetails.replies && caseDetails.replies.length > 0 ? (
                  caseDetails.replies.map((reply: any) => (
                    <div 
                      key={reply.id}
                      className="p-4 rounded-lg bg-betting-light-gray/30 border border-betting-light-gray"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-betting-green/20 flex items-center justify-center">
                            {reply.profiles?.username?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-medium">
                              {reply.profiles?.username || "User"}
                              {reply.profiles?.role === "admin" && (
                                <Badge variant="outline" className="ml-2 bg-red-500/10 text-red-500 border-red-500/20">
                                  Admin
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(reply.created_at), "PPP p")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm mt-2">{reply.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No replies yet</p>
                  </div>
                )}
              </CardContent>
              
              {caseDetails.status !== "closed" && caseDetails.status !== "refunded" && (
                <>
                  <CardHeader className="pt-0">
                    <CardTitle>Reply to Case</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Type your reply..."
                      className="bg-betting-light-gray border-betting-light-gray mb-4"
                      rows={4}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <Button 
                      onClick={handleSendReply}
                      disabled={!replyContent.trim() || submitting}
                      className="bg-betting-green hover:bg-betting-green-dark"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reply"
                      )}
                    </Button>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="betting-card mb-6">
              <CardHeader>
                <CardTitle>Related Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                {ticket ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-betting-green/10 flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-betting-green" />
                      </div>
                      <div>
                        <p className="font-medium">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.betting_site}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {format(new Date(ticket.kickoff_time), "PPP p")}
                      </span>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" asChild className="w-full">
                        <Link to={`/tickets/${ticket.id}`}>
                          View Ticket Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No ticket information available</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="betting-card">
              <CardHeader>
                <CardTitle>Purchase Details</CardTitle>
              </CardHeader>
              <CardContent>
                {purchase ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Purchase Date</p>
                      <p className="font-medium">
                        {format(new Date(purchase.purchase_date), "PPP")}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">R {purchase.price.toFixed(2)}</p>
                    </div>
                    
                    {caseDetails.status === "refunded" && (
                      <div className="bg-purple-500/10 p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-purple-500" />
                          <p className="text-sm font-medium text-purple-500">
                            Refund Processed
                          </p>
                        </div>
                        <p className="text-xs text-purple-400 mt-1">
                          R {purchase.price.toFixed(2)} has been credited to your account
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No purchase information available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CaseDetailsPage;
