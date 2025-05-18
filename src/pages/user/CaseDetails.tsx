
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Loader2, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useCases } from "@/hooks/useCases";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Case status options
const caseStatusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "refunded", label: "Refunded" },
  { value: "closed", label: "Closed" },
];

// Helper function to get status color
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

const CaseDetailsPage: React.FC = () => {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { userRole, currentUser } = useAuth();
  const {
    fetchCaseDetails,
    addReply,
    updateCaseStatus,
    processRefund,
    isLoading,
  } = useCases();

  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const isAdmin = userRole === 'admin';
  
  // Check if the refund parameter is in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const showRefundDialog = urlParams.get('refund') === 'true';

  useEffect(() => {
    if (showRefundDialog && caseDetails) {
      setRefundDialogOpen(true);
    }
  }, [showRefundDialog, caseDetails]);

  // Extract ticket and purchase data
  const ticketData = caseDetails?.tickets && caseDetails.tickets[0];
  const purchaseData = caseDetails?.purchases && caseDetails.purchases[0];

  // Check if this is a refund situation with necessary data
  const canProcessRefund =
    isAdmin &&
    purchaseData &&
    purchaseData.price > 0 &&
    ticketData &&
    (caseDetails?.status === "open" || caseDetails?.status === "in_progress");

  useEffect(() => {
    const loadCaseDetails = async () => {
      if (!caseId || !currentUser || initialLoadComplete) return;

      try {
        setLoading(true);
        setError(null);
        
        const details = await fetchCaseDetails(caseId);
        
        if (!details) {
          setError("Case not found or you don't have permission to view it");
        } else {
          setCaseDetails(details);
        }
        
        setInitialLoadComplete(true);
      } catch (err: any) {
        console.error("Error loading case details:", err);
        setError(err.message || "Failed to load case details");
      } finally {
        setLoading(false);
      }
    };

    loadCaseDetails();
  }, [caseId, fetchCaseDetails, currentUser, initialLoadComplete]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caseId || !replyContent.trim()) return;
    
    try {
      const result = await addReply(caseId, replyContent);
      if (result) {
        // Refresh case details to show the new reply
        setInitialLoadComplete(false);
        const updatedDetails = await fetchCaseDetails(caseId);
        
        if (updatedDetails) {
          setCaseDetails(updatedDetails);
          setReplyContent("");
          toast.success("Reply added successfully");
        }
      }
    } catch (err: any) {
      console.error("Error submitting reply:", err);
      toast.error(err.message || "Failed to add reply");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!caseId || !newStatus) return;
    
    try {
      const success = await updateCaseStatus(caseId, newStatus);
      
      if (success) {
        // Refresh case details to show the new status
        setInitialLoadComplete(false);
        const updatedDetails = await fetchCaseDetails(caseId);
        
        if (updatedDetails) {
          setCaseDetails(updatedDetails);
          toast.success(`Case status updated to ${newStatus}`);
        }
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleRefund = async () => {
    if (!caseId || !purchaseData || !ticketData) return;
    
    try {
      const success = await processRefund(
        caseId,
        purchaseData.id,
        purchaseData.buyer_id,
        purchaseData.seller_id,
        Number(purchaseData.price)
      );
      
      if (success) {
        // Reload case details
        setInitialLoadComplete(false);
        const updatedDetails = await fetchCaseDetails(caseId);
        
        if (updatedDetails) {
          setCaseDetails(updatedDetails);
          setRefundDialogOpen(false);
          
          // Remove the refund param from URL
          if (showRefundDialog) {
            navigate(`/user/cases/${caseId}`, { replace: true });
          }
        }
      }
    } catch (err: any) {
      console.error("Error processing refund:", err);
      toast.error(err.message || "Failed to process refund");
    }
  };

  if (loading && !caseDetails) {
    return (
      <Layout requireAuth={true}>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout requireAuth={true}>
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">{error}</h2>
                <Button
                  className="mt-4 bg-betting-green hover:bg-betting-green-dark"
                  onClick={() => navigate("/user/cases")}
                >
                  Back to Cases
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!caseDetails) {
    return (
      <Layout requireAuth={true}>
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Case not found</h2>
                <p className="text-muted-foreground mb-4">
                  The case you're looking for doesn't exist or has been removed.
                </p>
                <Button
                  className="bg-betting-green hover:bg-betting-green-dark"
                  onClick={() => navigate("/user/cases")}
                >
                  Back to Cases
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => navigate("/user/cases")}
        >
          Back to Cases
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  {caseDetails.title}
                  {caseDetails.case_number && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (#{caseDetails.case_number})
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="mt-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {format(new Date(caseDetails.created_at), "PPP p")}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className={getStatusColor(caseDetails.status)}
              >
                {caseDetails.status.charAt(0).toUpperCase() +
                  caseDetails.status.slice(1).replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-betting-light-gray p-4 rounded-md mb-6 whitespace-pre-line">
              {caseDetails.description}
            </div>

            {isAdmin && (
              <div className="bg-betting-dark-gray/50 p-4 rounded-md mb-6">
                <h3 className="font-bold mb-2">Admin Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Select
                    value={caseDetails.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {canProcessRefund && (
                    <Button
                      variant="outline"
                      className="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20"
                      onClick={() => setRefundDialogOpen(true)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Process Refund
                    </Button>
                  )}
                </div>
              </div>
            )}

            {ticketData && (
              <div className="bg-betting-dark-gray/50 p-4 rounded-md mb-6">
                <h3 className="font-bold mb-2">Related Ticket</h3>
                <p>
                  <strong>Title:</strong> {ticketData.title}
                </p>
                {purchaseData && (
                  <p className="mt-1">
                    <strong>Price:</strong> R{Number(purchaseData.price).toFixed(2)}
                  </p>
                )}
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => navigate(`/tickets/${ticketData.id}`)}
                >
                  View Ticket
                </Button>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Case Discussion</h3>

              {caseDetails.replies && caseDetails.replies.length > 0 ? (
                <div className="space-y-4">
                  {caseDetails.replies.map((reply: any) => (
                    <div
                      key={reply.id}
                      className="bg-betting-light-gray p-4 rounded-md"
                    >
                      <div className="flex items-center mb-2">
                        <Avatar className="h-8 w-8 mr-2">
                          {reply.profiles.avatar_url ? (
                            <AvatarImage src={reply.profiles.avatar_url} />
                          ) : (
                            <AvatarFallback>
                              {reply.profiles.username
                                ? reply.profiles.username.charAt(0).toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {reply.profiles.username || "User"}
                            {reply.profiles.role === "admin" && (
                              <Badge
                                variant="outline"
                                className="ml-2 bg-red-500/10 text-red-500 border-red-500/20"
                              >
                                Admin
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(reply.created_at), "PPP p")}
                          </p>
                        </div>
                      </div>
                      <p className="whitespace-pre-line">{reply.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-betting-dark-gray/20 rounded-md">
                  <p className="text-muted-foreground">
                    No replies yet. Be the first to respond.
                  </p>
                </div>
              )}

              {caseDetails.status !== "closed" && (
                <form onSubmit={handleSubmitReply} className="mt-6">
                  <Textarea
                    placeholder="Type your reply here..."
                    className="min-h-[100px] bg-betting-light-gray border-betting-light-gray"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="mt-3 bg-betting-green hover:bg-betting-green-dark"
                    disabled={isLoading || !replyContent.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Add Reply"
                    )}
                  </Button>
                </form>
              )}

              {caseDetails.status === "closed" && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This case is closed. No further replies can be added.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Refund Dialog */}
        {canProcessRefund && (
          <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Process Refund</DialogTitle>
                <DialogDescription>
                  This will refund the customer and deduct the amount from the
                  seller's account.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <p className="font-medium">Refund Details:</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    <span className="text-muted-foreground">Amount: </span>
                    <span className="font-medium">
                      R{Number(purchaseData?.price).toFixed(2)}
                    </span>
                  </li>
                  <li>
                    <span className="text-muted-foreground">Ticket: </span>
                    <span className="font-medium">{ticketData?.title}</span>
                  </li>
                  <li>
                    <span className="text-muted-foreground">Case #: </span>
                    <span className="font-medium">
                      {caseDetails.case_number}
                    </span>
                  </li>
                </ul>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRefundDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleRefund}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Refund"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default CaseDetailsPage;
