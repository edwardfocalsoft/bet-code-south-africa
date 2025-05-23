
import React, { useState } from 'react';
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

interface CaseRepliesProps {
  replies: any[];
}

const CaseReplies: React.FC<CaseRepliesProps> = ({ replies }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const repliesPerPage = 5;
  
  if (!replies || replies.length === 0) {
    return (
      <div className="text-center py-6 bg-betting-dark-gray/20 rounded-md">
        <p className="text-muted-foreground">
          No replies yet. Be the first to respond.
        </p>
      </div>
    );
  }

  // Pagination logic
  const indexOfLastReply = currentPage * repliesPerPage;
  const indexOfFirstReply = indexOfLastReply - repliesPerPage;
  const currentReplies = replies.slice(indexOfFirstReply, indexOfLastReply);
  const totalPages = Math.ceil(replies.length / repliesPerPage);

  return (
    <div className="space-y-4">
      {currentReplies.map((reply: any) => (
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
      
      {/* Pagination control */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default CaseReplies;
