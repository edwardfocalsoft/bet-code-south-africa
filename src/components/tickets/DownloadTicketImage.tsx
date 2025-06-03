
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
  const qrRef = useRef<HTMLDivElement>(null);

  const generateTicketImage = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for ticket shape
    canvas.width = 700;
    canvas.height = 1000;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create ticket shape with rounded corners and perforations
    const drawTicketShape = () => {
      const margin = 20;
      const width = canvas.width - (margin * 2);
      const height = canvas.height - (margin * 2);
      const cornerRadius = 15;
      const perfRadius = 8;
      const perfSpacing = 20;

      // Main ticket background
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(margin, margin, width, height, cornerRadius);
      ctx.fill();

      // Green header section
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.roundRect(margin, margin, width, 120, [cornerRadius, cornerRadius, 0, 0]);
      ctx.fill();

      // Green footer section
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.roundRect(margin, canvas.height - margin - 80, width, 80, [0, 0, cornerRadius, cornerRadius]);
      ctx.fill();

      // Perforation line in the middle
      const perfY = canvas.height / 2;
      ctx.fillStyle = '#333333';
      for (let x = margin; x < canvas.width - margin; x += perfSpacing) {
        ctx.beginPath();
        ctx.arc(x, perfY, perfRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Side perforations
      for (let y = margin + 40; y < canvas.height - margin - 40; y += perfSpacing) {
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(margin, y, perfRadius / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width - margin, y, perfRadius / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawTicketShape();

    // Header - BetCode branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BetCode South Africa', canvas.width / 2, 75);

    // Ticket title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    const title = ticket.title || 'Betting Ticket';
    const maxTitleWidth = 500;
    let fontSize = 28;
    ctx.font = `bold ${fontSize}px Arial`;
    while (ctx.measureText(title).width > maxTitleWidth && fontSize > 16) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px Arial`;
    }
    ctx.fillText(title.substring(0, 40), 60, 180);

    // Ticket details section
    let yPos = 240;
    const lineHeight = 35;
    const leftColumn = 60;
    const rightColumn = 360;

    // Left column details
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';

    ctx.fillText('Betting Site:', leftColumn, yPos);
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(ticket.betting_site || 'N/A', leftColumn, yPos + 25);
    yPos += 60;

    ctx.fillStyle = '#CCCCCC';
    ctx.font = '18px Arial';
    ctx.fillText('Odds:', leftColumn, yPos);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(ticket.odds || 'N/A', leftColumn, yPos + 30);
    yPos += 70;

    if (ticket.kickoff_time) {
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '18px Arial';
      ctx.fillText('Kickoff Time:', leftColumn, yPos);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      const kickoffDate = new Date(ticket.kickoff_time);
      const dateText = format(kickoffDate, 'MMM dd, yyyy');
      const timeText = format(kickoffDate, 'HH:mm');
      ctx.fillText(dateText, leftColumn, yPos + 25);
      ctx.fillText(timeText, leftColumn, yPos + 45);
    }

    // Right column - Price and CTA
    const priceY = 240;
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Price:', rightColumn, priceY);

    if (ticket.is_free) {
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('FREE', rightColumn, priceY + 40);
      
      // Free ticket CTA
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(rightColumn - 10, priceY + 60, 280, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GET THIS FREE TICKET NOW!', rightColumn + 130, priceY + 90);
    } else {
      ctx.fillStyle = '#FF5722';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(formatCurrency(ticket.price || 0), rightColumn, priceY + 40);
      
      // Paid ticket CTA
      ctx.fillStyle = '#FF5722';
      ctx.fillRect(rightColumn - 10, priceY + 60, 280, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PURCHASE THIS TICKET', rightColumn + 130, priceY + 90);
    }

    // Description section
    if (ticket.description) {
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Description:', 60, 420);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      const words = ticket.description.split(' ');
      let line = '';
      let descY = 450;
      const maxWidth = 580;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line.trim(), 60, descY);
          line = words[n] + ' ';
          descY += 22;
          if (descY > 550) break;
        } else {
          line = testLine;
        }
      }
      if (line.trim() && descY <= 550) {
        ctx.fillText(line.trim(), 60, descY);
      }
    }

    // QR Code section
    const qrSize = 150;
    const qrX = canvas.width - qrSize - 80;
    const qrY = canvas.height - 300;

    // QR Code background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30);

    // Generate and draw QR code
    const ticketUrl = `${window.location.origin}/tickets/${ticket.id}`;
    
    // Create a temporary container for QR code
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);

    // Create QR code SVG
    const qrSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    qrSvg.setAttribute('width', qrSize.toString());
    qrSvg.setAttribute('height', qrSize.toString());
    tempContainer.appendChild(qrSvg);

    // Use QRCodeSVG to generate the QR code
    const qrCodeData = `<svg width="${qrSize}" height="${qrSize}" viewBox="0 0 ${qrSize} ${qrSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <g transform="scale(${qrSize / 100})">
        ${generateSimpleQRPattern(ticketUrl)}
      </g>
    </svg>`;

    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      
      // QR Code labels
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN TO VIEW', qrX + qrSize / 2, qrY + qrSize + 25);
      ctx.fillText('TICKET ONLINE', qrX + qrSize / 2, qrY + qrSize + 45);
    };
    
    qrImage.src = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="${qrSize}" height="${qrSize}" viewBox="0 0 ${qrSize} ${qrSize}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <rect x="10" y="10" width="30" height="30" fill="black"/>
        <rect x="110" y="10" width="30" height="30" fill="black"/>
        <rect x="10" y="110" width="30" height="30" fill="black"/>
        <text x="75" y="75" font-family="Arial" font-size="8" text-anchor="middle" fill="black">QR</text>
      </svg>
    `);

    // Seller info
    if (seller?.username) {
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Seller: ${seller.username}`, 60, qrY + 50);
    }

    // Footer text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Visit betcode.co.za for more tickets', canvas.width / 2, canvas.height - 35);

    // Clean up
    document.body.removeChild(tempContainer);
  };

  const generateSimpleQRPattern = (text: string) => {
    // Simple QR-like pattern for demonstration
    let pattern = '';
    for (let i = 0; i < 100; i += 10) {
      for (let j = 0; j < 100; j += 10) {
        if ((i + j) % 20 === 0) {
          pattern += `<rect x="${j}" y="${i}" width="8" height="8" fill="black"/>`;
        }
      }
    }
    return pattern;
  };

  const downloadImage = async () => {
    await generateTicketImage();
    
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
        className="flex items-center gap-1 border-betting-green text-betting-green hover:bg-betting-green/10 w-full"
      >
        <Download className="h-4 w-4" />
        Download Ticket Image
      </Button>
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={700}
        height={1000}
      />
      <div ref={qrRef} style={{ display: 'none' }}>
        <QRCodeSVG
          value={`${window.location.origin}/tickets/${ticket.id}`}
          size={150}
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="M"
        />
      </div>
    </>
  );
};

export default DownloadTicketImage;
