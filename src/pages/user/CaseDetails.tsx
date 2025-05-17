import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useCases } from "@/hooks/useCases";
import { useAuth } from "@/contexts/auth";
import { 
  ChevronLeft, 
  Loader2, 
  Send, 
  AlertCircle, 
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  User
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription, 
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { CaseReplyProfile } from "@/types";

interface CaseReply {
  id: string;
  case_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: CaseReplyProfile;
}

interface CaseDetail {
  id: string;
  case_number: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  ticket_id: string;
  purchase_id: string;
  tickets: any;
  purchases: any;
  replies: CaseReply[];
}

const CaseDetailsPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const { 
    fetchCaseDetails, 
    addReply, 
    updateCaseStatus, 
    processRefund,
    isLoading: casesLoading 
  } = useCases();
  
  const [caseDetails, setCaseDetails] = useState<CaseDetail | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const isAdmin = userRole === 'admin';
  
  // Check if refund param is present in URL
  const urlParams = new URLSearchParams(window.location.search);
  const showRefundOption = urlParams.get('refund') === 'true';

  // Helper function to safely get profile data
  const safeProfileData = (profile: any): CaseReplyProfile => {
    // If profile has an error or is invalid
    if (!profile || profile.error) {
      return {
        username: 'Unknown User',
        role: 'buyer',
        avatar_url: undefined,
        error: true
      };
    }
    
    return {
      username: profile.username || 'Unknown User',
      role: profile.role || 'buyer',
      avatar_url: profile.avatar_url,
      error: false
    };
  };

  useEffect(() => {
    if (showRefundOption) {
      setRefundDialogOpen(true);
    }
  }, [showRefundOption]);

  useEffect(() => {
    const loadCaseDetails = async () => {
      if (!caseId) return;

      try {
        setLoading(true);
        setError(null);
        const details = await fetchCaseDetails(caseId);
        
        if (!details) {
          setError("Case not found");
          return;
        }

        // Process the replies to handle potential profile errors
        const processedReplies: CaseReply[] = details.replies?.map((reply: any) => ({
          ...reply,
          profiles: safeProfileData(reply.profiles)
        })) || [];
        
        // Create a properly typed CaseDetail object
        const processedDetails: CaseDetail = {
          ...details,
          replies: processedReplies
        };
        
        setCaseDetails(processedDetails);
      } catch (err: any) {
        console.error("Error fetching case details:", err);
        setError(err.message || "Failed to load case details");
      } finally {
        setLoading(false);
      }
    };

    loadCaseDetails();
  }, [caseId, fetchCaseDetails]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !caseId) return;

    setIsSubmitting(true);
    try {
      const result = await addReply(caseId, replyContent);
      if (result) {
        // Refresh case details to show the new reply
        const updatedDetails = await fetchCaseDetails(caseId);
        
        if (updatedDetails) {
          // Process the updatedDetails to ensure it matches our expected type
          const processedReplies: CaseReply[] = updatedDetails.replies?.map((reply: any) => ({
            ...reply,
            profiles: safeProfileData(reply.profiles)
          })) || [];
          
          setCaseDetails({
            ...updatedDetails,
            replies: processedReplies
          });
        }
        
        setReplyContent("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!caseId) return;
    
    try {
      setIsSubmitting(true);
      const success = await updateCaseStatus(caseId, newStatus);
      if (success && caseDetails) {
        // Update the local state
        setCaseDetails({
          ...caseDetails,
          status: newStatus
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefund = async () => {
    if (!caseId || !caseDetails) return;
    
    const { purchases } = caseDetails;
    if (!purchases || purchases.length === 0) {
      setError("Purchase information not found");
      return;
    }
    
    const purchase = purchases[0];
    
    try {
      setIsSubmitting(true);
      const success = await processRefund(
        caseId,
        purchase.id,
        purchase.buyer_id,
        purchase.seller_id,
        parseFloat(purchase.price)
      );
      
      if (success) {
        // Reload case details
        const updatedDetails = await fetchCaseDetails(caseId);
        
        if (updatedDetails) {
          // Process the updatedDetails to ensure it matches our expected type
          const processedReplies: CaseReply[] = updatedDetails.replies?.map((reply: any) => ({
            ...reply,
            profiles: safeProfileData(reply.profiles)
          })) || [];
          
          setCaseDetails({
            ...updatedDetails,
            replies: processedReplies
          });
        }
        
        setRefundDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
      case "in progress":
        return <Loader2 className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "refunded":
        return <RefreshCw className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8 px-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={isAdmin ? "/admin/cases" : "/user/cases"}>
                <ChevronLeft className="inline-block mr-1 h-4 w-4" />
                Back to cases
              </BreadcrumbLink>
            </BreadcrumbItem>
            {caseDetails && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <span>{caseDetails.case_number}</span>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        ) : caseDetails ? (
          <div className="space-y-6">
            {/* Case details card */}
            <Card className="betting-card">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl">{caseDetails.title}</CardTitle>
                    <CardDescription>
                      Case #{caseDetails.case_number} • Opened {format(new Date(caseDetails.created_at), "PPP")}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 px-3 py-1 ${getStatusColor(caseDetails.status)}`}
                  >
                    {getStatusIcon(caseDetails.status)}
                    <span>{caseDetails.status.charAt(0).toUpperCase() + caseDetails.status.slice(1).replace('_', ' ')}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* ... keep existing code (case description and admin action buttons) */}
                <div className="space-y-4">
                  <div className="p-4 bg-betting-dark-gray/30 rounded-md">
                    <p className="whitespace-pre-wrap">{caseDetails.description}</p>
                  </div>
                  
                  {isAdmin && (caseDetails.status !== 'refunded' && caseDetails.status !== 'closed') && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
                      {caseDetails.status === 'open' && (
                        <Button 
                          variant="outline" 
                          className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
                          onClick={() => handleStatusChange('in_progress')}
                          disabled={isSubmitting}
                        >
                          Start Processing
                        </Button>
                      )}
                      
                      {caseDetails.status === 'in_progress' && (
                        <Button 
                          variant="outline" 
                          className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                          onClick={() => handleStatusChange('resolved')}
                          disabled={isSubmitting}
                        >
                          Mark as Resolved
                        </Button>
                      )}
                      
                      {(caseDetails.status === 'open' || caseDetails.status === 'in_progress') && (
                        <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20"
                              disabled={isSubmitting}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Process Refund
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Process Refund</DialogTitle>
                              <DialogDescription>
                                This will refund the purchase amount to the buyer and deduct it from the seller's balance.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Amount:</span>
                                  <span className="font-semibold">R {parseFloat(caseDetails.purchases?.[0]?.price || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Buyer:</span>
                                  <span>ID: {caseDetails.purchases?.[0]?.buyer_id.substring(0, 8)}...</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Seller:</span>
                                  <span>ID: {caseDetails.purchases?.[0]?.seller_id.substring(0, 8)}...</span>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button 
                                onClick={handleRefund} 
                                disabled={isSubmitting}
                                className="bg-purple-500 hover:bg-purple-600"
                              >
                                {isSubmitting ? (
                                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing</>
                                ) : (
                                  <>Confirm Refund</>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      {(caseDetails.status === 'resolved' || caseDetails.status === 'refunded') && (
                        <Button 
                          variant="outline" 
                          className="bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20"
                          onClick={() => handleStatusChange('closed')}
                          disabled={isSubmitting}
                        >
                          Close Case
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conversation history card */}
            <Card className="betting-card">
              <CardHeader>
                <CardTitle>Conversation History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {caseDetails.replies && caseDetails.replies.length > 0 ? (
                    caseDetails.replies.map((reply) => (
                      <div 
                        key={reply.id} 
                        className={`flex gap-4 ${reply.profiles.role === 'admin' ? 'bg-betting-dark-gray/30' : 'bg-betting-dark-gray/10'} p-4 rounded-lg`}
                      >
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                          {reply.profiles.avatar_url ? (
                            <img 
                              src={reply.profiles.avatar_url} 
                              alt={reply.profiles.username || "User"} 
                              className="w-full h-full rounded-full object-cover" 
                            />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {reply.profiles.username || "Anonymous"}
                            </span>
                            {reply.profiles.role === 'admin' && (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                                Admin
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {format(new Date(reply.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No replies yet. Be the first to respond.
                    </div>
                  )}

                  {/* Only show the reply form if the case is not closed */}
                  {caseDetails.status !== 'closed' && (
                    <form onSubmit={handleSubmitReply} className="space-y-4 pt-4 border-t border-gray-700">
                      <Textarea
                        placeholder="Type your reply here..."
                        className="min-h-[120px]"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={!replyContent.trim() || isSubmitting}
                        >
                          {isSubmitting ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending</>
                          ) : (
                            <><Send className="h-4 w-4 mr-2" /> Send Reply</>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Related ticket info */}
            {caseDetails.tickets && (
              <Card className="betting-card">
                <CardHeader>
                  <CardTitle>Related Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{caseDetails.tickets.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{caseDetails.tickets.description}</p>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/tickets/${caseDetails.ticket_id}`)}
                      >
                        View Ticket
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl">Case not found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate(isAdmin ? "/admin/cases" : "/user/cases")}
            >
              Back to All Cases
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CaseDetailsPage;
