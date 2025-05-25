
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface CopyTicketCodeProps {
  ticketCode: string;
}

const CopyTicketCode: React.FC<CopyTicketCodeProps> = ({ ticketCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketCode);
      setCopied(true);
      toast.success("Ticket code copied to clipboard!");
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy ticket code");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="ml-2 h-8"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-1 text-green-500" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </>
      )}
    </Button>
  );
};

export default CopyTicketCode;
