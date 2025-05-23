
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Reply {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    username?: string;
    email?: string;
    role?: string;
  };
}

interface CaseRepliesProps {
  replies: Reply[];
  totalReplies: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CaseReplies: React.FC<CaseRepliesProps> = ({ 
  replies, 
  totalReplies,
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalReplies === 0) {
    return (
      <div className="bg-betting-dark-gray/50 rounded-md p-6 mb-6">
        <p className="text-center text-muted-foreground">No replies yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-betting-dark-gray rounded-md p-6 mb-6">
      <h3 className="text-lg font-bold mb-3">Conversation</h3>
      <div className="space-y-6">
        {replies.map((reply) => (
          <div key={reply.id} className="border-b border-betting-light-gray last:border-0 pb-4 last:pb-0">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-betting-green">
                {reply.user?.username || reply.user?.email || "User"}
                {reply.user?.role === "admin" && (
                  <span className="ml-2 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
              </div>
            </div>
            <p className="whitespace-pre-line">{reply.content}</p>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-betting-light-gray">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalReplies} {totalReplies === 1 ? 'reply' : 'replies'})
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseReplies;
