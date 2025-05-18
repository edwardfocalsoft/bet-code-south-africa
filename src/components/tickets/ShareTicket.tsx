
import React, { useState } from "react";
import { 
  Facebook,
  Twitter,
  Share2, 
  Link as LinkIcon,
  MessageCircle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareTicketProps {
  ticketId: string;
  ticketTitle: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ShareTicket: React.FC<ShareTicketProps> = ({ 
  ticketId, 
  ticketTitle,
  open,
  onOpenChange 
}) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // Generate the share URL
  const ticketUrl = `${window.location.origin}/tickets/${ticketId}`;
  
  // Share content
  const shareContent = `Check out this betting ticket on BetCode ZA: ${ticketTitle} - ${ticketUrl}`;
  
  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(ticketUrl).then(
      () => {
        setIsCopied(true);
        toast({
          title: "Link copied!",
          description: "Ticket link has been copied to clipboard",
        });
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Failed to copy",
          description: "Could not copy the link to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  // Share to Facebook
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ticketUrl)}`;
    window.open(url, "_blank");
  };

  // Share to Twitter
  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent)}`;
    window.open(url, "_blank");
  };

  // Share to WhatsApp
  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareContent)}`;
    window.open(url, "_blank");
  };

  // If we're using this component as a dialog trigger (with open/onOpenChange props)
  if (open !== undefined && onOpenChange) {
    return (
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 border-betting-green text-betting-green hover:bg-betting-green/10"
          >
            <Share2 className="h-4 w-4" />
            Share Ticket
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-betting-dark-gray border-betting-light-gray">
          <DropdownMenuLabel>Share this ticket</DropdownMenuLabel>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer hover:bg-betting-light-gray" 
            onClick={copyToClipboard}
          >
            {isCopied ? <CheckCircle className="h-4 w-4 text-betting-green" /> : <LinkIcon className="h-4 w-4" />}
            Copy Link
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer hover:bg-betting-light-gray" 
            onClick={shareToFacebook}
          >
            <Facebook className="h-4 w-4 text-blue-500" />
            Facebook
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer hover:bg-betting-light-gray" 
            onClick={shareToTwitter}
          >
            <Twitter className="h-4 w-4 text-sky-500" />
            Twitter
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer hover:bg-betting-light-gray" 
            onClick={shareToWhatsApp}
          >
            <MessageCircle className="h-4 w-4 text-green-500" />
            WhatsApp
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default rendering without dialog controls
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 border-betting-green text-betting-green hover:bg-betting-green/10"
        >
          <Share2 className="h-4 w-4" />
          Share Ticket
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-betting-dark-gray border-betting-light-gray">
        <DropdownMenuLabel>Share this ticket</DropdownMenuLabel>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer hover:bg-betting-light-gray" 
          onClick={copyToClipboard}
        >
          {isCopied ? <CheckCircle className="h-4 w-4 text-betting-green" /> : <LinkIcon className="h-4 w-4" />}
          Copy Link
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer hover:bg-betting-light-gray" 
          onClick={shareToFacebook}
        >
          <Facebook className="h-4 w-4 text-blue-500" />
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer hover:bg-betting-light-gray" 
          onClick={shareToTwitter}
        >
          <Twitter className="h-4 w-4 text-sky-500" />
          Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer hover:bg-betting-light-gray" 
          onClick={shareToWhatsApp}
        >
          <MessageCircle className="h-4 w-4 text-green-500" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareTicket;
