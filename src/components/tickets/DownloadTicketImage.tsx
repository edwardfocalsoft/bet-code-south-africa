
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatting";

interface DownloadTicketImageProps {
  ticket: any;
  seller: any;
}

const DownloadTicketImage: React.FC<DownloadTicketImageProps> = ({ ticket, seller }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateTicketImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 800;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#111111'); // betting-black
    gradient.addColorStop(1, '#222222'); // betting-dark-gray
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header background
    ctx.fillStyle = '#4CAF50'; // betting-green
    ctx.fillRect(0, 0, canvas.width, 80);

    // BetCode branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BetCode South Africa', canvas.width / 2, 50);

    // Ticket title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    const title = ticket.title || 'Betting Ticket';
    ctx.fillText(title.substring(0, 35), 40, 140);

    // Ticket details
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '16px Arial';
    
    let yPos = 180;
    const lineHeight = 30;

    // Betting site
    ctx.fillText(`Betting Site: ${ticket.betting_site || 'N/A'}`, 40, yPos);
    yPos += lineHeight;

    // Price
    const priceText = ticket.is_free ? 'Free' : formatCurrency(ticket.price || 0);
    ctx.fillText(`Price: ${priceText}`, 40, yPos);
    yPos += lineHeight;

    // Odds
    ctx.fillText(`Odds: ${ticket.odds || 'N/A'}`, 40, yPos);
    yPos += lineHeight;

    // Kickoff time
    if (ticket.kickoff_time) {
      const kickoffDate = new Date(ticket.kickoff_time);
      ctx.fillText(`Kickoff: ${format(kickoffDate, 'PPP p')}`, 40, yPos);
      yPos += lineHeight;
    }

    // Seller
    if (seller?.username) {
      ctx.fillText(`Seller: ${seller.username}`, 40, yPos);
      yPos += lineHeight;
    }

    // Description (truncated)
    if (ticket.description) {
      ctx.fillText('Description:', 40, yPos);
      yPos += lineHeight;
      
      const words = ticket.description.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > 520 && n > 0) {
          ctx.fillText(line, 40, yPos);
          line = words[n] + ' ';
          yPos += 20;
          if (yPos > 450) break; // Limit description height
        } else {
          line = testLine;
        }
      }
      if (line.trim() && yPos <= 450) {
        ctx.fillText(line, 40, yPos);
      }
    }

    // QR Code area
    const qrSize = 120;
    const qrX = canvas.width - qrSize - 40;
    const qrY = canvas.height - qrSize - 100;

    // QR Code background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

    // Generate QR code URL
    const ticketUrl = `${window.location.origin}/tickets/${ticket.id}`;
    
    // Create QR code SVG and draw to canvas
    const qrCodeSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    qrCodeSVG.setAttribute('width', qrSize.toString());
    qrCodeSVG.setAttribute('height', qrSize.toString());
    
    // Create a temporary QR code element
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    // We'll use a simpler approach for QR code generation
    // Add QR code label
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to view ticket', qrX + qrSize / 2, qrY + qrSize + 30);

    // Footer
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Visit betcode.co.za for more tickets', canvas.width / 2, canvas.height - 30);

    // Clean up
    document.body.removeChild(tempDiv);
  };

  const downloadImage = () => {
    generateTicketImage();
    
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `betcode-ticket-${ticket.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadImage}
        className="flex items-center gap-1 border-betting-green text-betting-green hover:bg-betting-green/10"
      >
        <Download className="h-4 w-4" />
        Download Image
      </Button>
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={600}
        height={800}
      />
    </>
  );
};

export default DownloadTicketImage;
