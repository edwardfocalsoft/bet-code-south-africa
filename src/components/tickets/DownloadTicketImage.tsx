
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

  const generateTicketImage = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for modern ticket design
    canvas.width = 1200;
    canvas.height = 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Modern gradient background
    const backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    backgroundGradient.addColorStop(0, '#111111'); // betting-black
    backgroundGradient.addColorStop(1, '#222222'); // betting-dark-gray
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Green header section
    const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    headerGradient.addColorStop(0, '#4CAF50'); // betting-green
    headerGradient.addColorStop(1, '#388E3C'); // betting-green-dark
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, canvas.width, 80);

    // Header text - BetCode South Africa
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BetCode South Africa', canvas.width / 2, 50);

    // Main content area with subtle border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 100, canvas.width - 60, canvas.height - 130);

    // Left section - Main ticket info
    const leftMargin = 60;
    const rightBoundary = canvas.width - 320;

    // Ticket title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'left';
    const title = ticket.title || 'Betting Ticket';
    ctx.fillText(title.length > 40 ? title.substring(0, 40) + '...' : title, leftMargin, 160);

    // Seller info with verification
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('by', leftMargin, 190);
    
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 16px Arial, sans-serif';
    const sellerName = seller?.username || 'Anonymous';
    ctx.fillText(sellerName, leftMargin + 25, 190);

    // Verification badge if seller is verified
    if (seller?.verified) {
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(leftMargin + 25 + ctx.measureText(sellerName).width + 15, 186, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓', leftMargin + 25 + ctx.measureText(sellerName).width + 15, 190);
      ctx.textAlign = 'left';
    }

    // Two-column layout for ticket details
    let yPos = 240;
    const columnSpacing = 280;

    // Left column
    // Betting Site
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Betting Site:', leftMargin, yPos);
    
    // Green badge for betting site
    const siteText = ticket.betting_site || 'N/A';
    const siteWidth = ctx.measureText(siteText).width + 20;
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(leftMargin, yPos + 10, siteWidth, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText(siteText, leftMargin + 10, yPos + 28);

    // Odds
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Odds:', leftMargin, yPos + 70);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText(ticket.odds || 'N/A', leftMargin, yPos + 105);

    // Right column
    // Kickoff Time
    if (ticket.kickoff_time) {
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('Kickoff Time:', leftMargin + columnSpacing, yPos);
      
      const kickoffDate = new Date(ticket.kickoff_time);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText(format(kickoffDate, 'MMM dd, yyyy'), leftMargin + columnSpacing, yPos + 25);
      ctx.fillText(format(kickoffDate, 'HH:mm'), leftMargin + columnSpacing, yPos + 45);
    }

    // Price
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Price:', leftMargin + columnSpacing, yPos + 70);

    if (ticket.is_free) {
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.fillText('FREE', leftMargin + columnSpacing, yPos + 105);
    } else {
      ctx.fillStyle = '#FF5722';
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.fillText(formatCurrency(ticket.price || 0), leftMargin + columnSpacing, yPos + 105);
    }

    // Status badges
    const badgeY = yPos + 130;
    const statusText = new Date() > new Date(ticket.kickoff_time || Date.now()) ? 'Event Started' : 'Upcoming';
    const statusColor = new Date() > new Date(ticket.kickoff_time || Date.now()) ? '#666666' : '#4CAF50';
    
    ctx.fillStyle = statusColor;
    ctx.fillRect(leftMargin, badgeY, 120, 25);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusText, leftMargin + 60, badgeY + 16);
    ctx.textAlign = 'left';

    if (ticket.is_free) {
      ctx.fillStyle = '#9C27B0';
      ctx.fillRect(leftMargin + 140, badgeY, 60, 25);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FREE', leftMargin + 170, badgeY + 16);
      ctx.textAlign = 'left';
    }

    // Ticket code section (blurred for preview)
    if (ticket.ticket_code) {
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('Ticket Code:', leftMargin, yPos + 180);
      
      // Blurred code box
      ctx.fillStyle = '#333333';
      ctx.fillRect(leftMargin, yPos + 200, 300, 35);
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText('●●●●●●●●●●●●●●●●', leftMargin + 10, yPos + 220);
      
      ctx.fillStyle = '#888888';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText('Code revealed after purchase', leftMargin, yPos + 250);
    }

    // Description
    if (ticket.description) {
      const descY = yPos + 280;
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('Description:', leftMargin, descY);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial, sans-serif';
      const words = ticket.description.split(' ');
      let line = '';
      let currentY = descY + 20;
      const maxWidth = rightBoundary - leftMargin - 40;
      
      for (let n = 0; n < words.length && currentY < canvas.height - 80; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line.trim(), leftMargin, currentY);
          line = words[n] + ' ';
          currentY += 18;
        } else {
          line = testLine;
        }
      }
      if (line.trim() && currentY <= canvas.height - 80) {
        ctx.fillText(line.trim(), leftMargin, currentY);
      }
    }

    // Right section - QR Code area
    const qrSection = canvas.width - 280;
    const qrSize = 120;
    const qrX = qrSection + 20;
    const qrY = 160;

    // QR Code background with border
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

    // Generate QR code pattern (simplified for canvas)
    const ticketUrl = `${window.location.origin}/tickets/${ticket.id}`;
    
    // Simple QR pattern placeholder
    ctx.fillStyle = '#000000';
    const blockSize = 4;
    for (let i = 0; i < qrSize; i += blockSize) {
      for (let j = 0; j < qrSize; j += blockSize) {
        // Create a pseudo-random pattern based on position
        if ((i + j + ticket.id.charCodeAt(0)) % 12 < 6) {
          ctx.fillRect(qrX + j, qrY + i, blockSize - 1, blockSize - 1);
        }
      }
    }

    // Corner markers for QR code
    const markerSize = 20;
    // Top-left
    ctx.fillStyle = '#000000';
    ctx.fillRect(qrX, qrY, markerSize, markerSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX + 4, qrY + 4, markerSize - 8, markerSize - 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(qrX + 8, qrY + 8, markerSize - 16, markerSize - 16);

    // Top-right
    ctx.fillStyle = '#000000';
    ctx.fillRect(qrX + qrSize - markerSize, qrY, markerSize, markerSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX + qrSize - markerSize + 4, qrY + 4, markerSize - 8, markerSize - 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(qrX + qrSize - markerSize + 8, qrY + 8, markerSize - 16, markerSize - 16);

    // Bottom-left
    ctx.fillStyle = '#000000';
    ctx.fillRect(qrX, qrY + qrSize - markerSize, markerSize, markerSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX + 4, qrY + qrSize - markerSize + 4, markerSize - 8, markerSize - 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(qrX + 8, qrY + qrSize - markerSize + 8, markerSize - 16, markerSize - 16);

    // QR Code labels
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN TO VIEW', qrX + qrSize / 2, qrY + qrSize + 20);
    ctx.fillText('TICKET ONLINE', qrX + qrSize / 2, qrY + qrSize + 35);

    // Seller info in QR section
    if (seller?.username) {
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '12px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Seller: ${seller.username}`, qrX - 10, qrY + qrSize + 65);
    }

    // Modern footer
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Visit betcode.co.za for more tickets', canvas.width / 2, canvas.height - 30);

    // Decorative elements
    // Corner accents
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.lineTo(30, 80);
    ctx.lineTo(30, 110);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(canvas.width, 80);
    ctx.lineTo(canvas.width - 30, 80);
    ctx.lineTo(canvas.width - 30, 110);
    ctx.closePath();
    ctx.fill();
  };

  const downloadImage = async () => {
    await generateTicketImage();
    
    // Small delay to ensure rendering is complete
    setTimeout(() => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `betcode-ticket-${ticket.id}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    }, 100);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadImage}
        className="flex items-center gap-1 border-betting-green text-betting-green hover:bg-betting-green/10 w-full"
      >
        <Download className="h-4 w-4" />
        Download Ticket Image
      </Button>
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={1200}
        height={600}
      />
    </>
  );
};

export default DownloadTicketImage;
