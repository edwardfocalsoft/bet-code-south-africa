
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

    // Set canvas size for horizontal ticket
    canvas.width = 1200;
    canvas.height = 500;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create ticket shape with rounded corners and perforations
    const drawTicketShape = () => {
      const margin = 20;
      const width = canvas.width - (margin * 2);
      const height = canvas.height - (margin * 2);
      const cornerRadius = 20;
      const perfRadius = 8;
      const perfSpacing = 25;

      // Main ticket background with gradient effect
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#2c2c2c');
      gradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(margin, margin, width, height, cornerRadius);
      ctx.fill();

      // Green header section
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.roundRect(margin, margin, width, 80, [cornerRadius, cornerRadius, 0, 0]);
      ctx.fill();

      // Green accent stripe
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(margin, margin + 80, width, 4);

      // Vertical perforation line (separating main content from QR section)
      const perfX = canvas.width - 280;
      for (let y = margin + 40; y < canvas.height - margin - 40; y += perfSpacing) {
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(perfX, y, perfRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Side perforations
      for (let y = margin + 60; y < canvas.height - margin - 60; y += perfSpacing) {
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
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BetCode South Africa', canvas.width / 2, 55);

    // Left section - Main ticket content
    const leftMargin = 60;
    const rightBoundary = canvas.width - 320; // Leave space for QR section

    // Ticket title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    const title = ticket.title || 'Betting Ticket';
    let fontSize = 32;
    ctx.font = `bold ${fontSize}px Arial`;
    while (ctx.measureText(title).width > (rightBoundary - leftMargin - 40) && fontSize > 20) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px Arial`;
    }
    ctx.fillText(title.substring(0, 50), leftMargin, 140);

    // Two-column layout for details
    const leftColumn = leftMargin;
    const middleColumn = leftMargin + 320;
    let yPos = 190;

    // Left column - Betting Site and Odds
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '18px Arial';
    ctx.fillText('Betting Site:', leftColumn, yPos);
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(ticket.betting_site || 'N/A', leftColumn, yPos + 25);

    ctx.fillStyle = '#CCCCCC';
    ctx.font = '18px Arial';
    ctx.fillText('Odds:', leftColumn, yPos + 70);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(ticket.odds || 'N/A', leftColumn, yPos + 100);

    // Middle column - Time and Price
    if (ticket.kickoff_time) {
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '18px Arial';
      ctx.fillText('Kickoff Time:', middleColumn, yPos);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      const kickoffDate = new Date(ticket.kickoff_time);
      const dateText = format(kickoffDate, 'MMM dd, yyyy');
      const timeText = format(kickoffDate, 'HH:mm');
      ctx.fillText(dateText, middleColumn, yPos + 25);
      ctx.fillText(timeText, middleColumn, yPos + 45);
    }

    // Price section
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '18px Arial';
    ctx.fillText('Price:', middleColumn, yPos + 70);

    if (ticket.is_free) {
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('FREE', middleColumn, yPos + 105);
      
      // Free ticket CTA
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(middleColumn - 5, yPos + 115, 240, 40);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GET THIS FREE TICKET NOW!', middleColumn + 115, yPos + 138);
      ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = '#FF5722';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(formatCurrency(ticket.price || 0), middleColumn, yPos + 105);
      
      // Paid ticket CTA
      ctx.fillStyle = '#FF5722';
      ctx.fillRect(middleColumn - 5, yPos + 115, 240, 40);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PURCHASE THIS TICKET', middleColumn + 115, yPos + 138);
      ctx.textAlign = 'left';
    }

    // Ticket code section (blurred)
    if (ticket.ticket_code) {
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '14px Arial';
      ctx.fillText('Ticket Code:', leftColumn, yPos + 180);
      
      // Create blurred effect for ticket code
      ctx.fillStyle = '#666666';
      ctx.fillRect(leftColumn, yPos + 190, 200, 25);
      ctx.fillStyle = '#999999';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('●●●●●●●●●●', leftColumn + 10, yPos + 208);
      
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '12px Arial';
      ctx.fillText('Code revealed after purchase', leftColumn, yPos + 225);
    }

    // Description section (bottom left)
    if (ticket.description) {
      const descY = yPos + 250;
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '14px Arial';
      ctx.fillText('Description:', leftColumn, descY);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial';
      const words = ticket.description.split(' ');
      let line = '';
      let currentY = descY + 20;
      const maxWidth = rightBoundary - leftColumn - 40;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line.trim(), leftColumn, currentY);
          line = words[n] + ' ';
          currentY += 18;
          if (currentY > canvas.height - 60) break;
        } else {
          line = testLine;
        }
      }
      if (line.trim() && currentY <= canvas.height - 60) {
        ctx.fillText(line.trim(), leftColumn, currentY);
      }
    }

    // Right section - QR Code and additional info
    const qrSection = canvas.width - 260;
    const qrSize = 120;
    const qrX = qrSection + 20;
    const qrY = 150;

    // QR Code background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

    // Generate QR code
    const ticketUrl = `${window.location.origin}/tickets/${ticket.id}`;
    
    // Create a proper QR code using qrcode.react
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);

    // Create QR code element
    const qrElement = document.createElement('div');
    tempContainer.appendChild(qrElement);

    // Use React to render QR code
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(qrElement);
      root.render(
        React.createElement(QRCodeSVG, {
          value: ticketUrl,
          size: qrSize,
          bgColor: "#FFFFFF",
          fgColor: "#000000",
          level: "M"
        })
      );

      // Wait for QR code to render, then extract and draw it
      setTimeout(() => {
        const svgElement = qrElement.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
            
            // QR Code labels
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SCAN TO VIEW', qrX + qrSize / 2, qrY + qrSize + 20);
            ctx.fillText('TICKET ONLINE', qrX + qrSize / 2, qrY + qrSize + 35);
            
            // Seller info
            if (seller?.username) {
              ctx.fillStyle = '#CCCCCC';
              ctx.font = '14px Arial';
              ctx.textAlign = 'left';
              ctx.fillText(`Seller: ${seller.username}`, qrSection, qrY + qrSize + 60);
            }
            
            // Footer text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Visit betcode.co.za for more tickets', canvas.width / 2, canvas.height - 25);
          };
          
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        }
        
        // Clean up
        document.body.removeChild(tempContainer);
      }, 100);
    });

    // If QR code fails, show placeholder
    setTimeout(() => {
      if (!qrElement.querySelector('svg')) {
        // Simple placeholder QR pattern
        ctx.fillStyle = '#000000';
        for (let i = 0; i < qrSize; i += 10) {
          for (let j = 0; j < qrSize; j += 10) {
            if ((i + j) % 20 === 0) {
              ctx.fillRect(qrX + j, qrY + i, 8, 8);
            }
          }
        }
        
        // Labels for placeholder
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SCAN TO VIEW', qrX + qrSize / 2, qrY + qrSize + 20);
        ctx.fillText('TICKET ONLINE', qrX + qrSize / 2, qrY + qrSize + 35);
        
        // Seller info
        if (seller?.username) {
          ctx.fillStyle = '#CCCCCC';
          ctx.font = '14px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(`Seller: ${seller.username}`, qrSection, qrY + qrSize + 60);
        }
        
        // Footer text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Visit betcode.co.za for more tickets', canvas.width / 2, canvas.height - 25);
      }
    }, 500);
  };

  const downloadImage = async () => {
    await generateTicketImage();
    
    // Wait a bit for QR code to render
    setTimeout(() => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `betcode-ticket-${ticket.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }, 1000);
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
        height={500}
      />
    </>
  );
};

export default DownloadTicketImage;
