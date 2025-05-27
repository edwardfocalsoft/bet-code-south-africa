
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeScanned: (code: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  isOpen,
  onClose,
  onCodeScanned,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const handleManualInput = () => {
    const code = prompt("Enter ticket code manually:");
    if (code && code.trim()) {
      onCodeScanned(code.trim());
      toast.success("Ticket code added successfully!");
    }
  };

  const simulateCodeDetection = () => {
    // For demo purposes - in real implementation, you'd use a QR code detection library
    const mockCode = `TICKET_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    onCodeScanned(mockCode);
    toast.success("Ticket code scanned successfully!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Ticket Codes</DialogTitle>
          <DialogDescription>
            Point your camera at a ticket code to scan it automatically, or enter codes manually.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {isScanning ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {isScanning && (
              <div className="absolute inset-0 border-2 border-betting-green rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-lg"></div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={simulateCodeDetection}
              className="flex-1 bg-betting-green hover:bg-betting-green-dark"
              disabled={!isScanning}
            >
              Simulate Scan
            </Button>
            <Button
              onClick={handleManualInput}
              variant="outline"
              className="flex-1"
            >
              Manual Input
            </Button>
          </div>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Close Scanner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;
