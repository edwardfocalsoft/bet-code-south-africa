
import React, { useState } from 'react';
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReplyFormProps {
  caseStatus: string;
  onSubmit: (content: string) => Promise<void>;
  isLoading: boolean;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  caseStatus,
  onSubmit,
  isLoading
}) => {
  const [replyContent, setReplyContent] = useState("");

  if (caseStatus === "closed") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    await onSubmit(replyContent);
    setReplyContent(""); // Reset after submission
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
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
  );
};

export default ReplyForm;
