
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, ScanLine } from "lucide-react";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      console.log('[QRScanner] Starting camera...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
        
        // Start scanning once video is loaded
        videoRef.current.onloadedmetadata = () => {
          console.log('[QRScanner] Video loaded, starting scan process');
          startScanProcess();
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions and try again.");
    }
  };

  const stopCamera = () => {
    console.log('[QRScanner] Stopping camera...');
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('[QRScanner] Camera track stopped');
      });
      setStream(null);
    }
    setIsScanning(false);
    setIsProcessing(false);
  };

  const startScanProcess = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    // Scan every 500ms
    scanIntervalRef.current = setInterval(() => {
      if (!isProcessing) {
        scanForNumbers();
      }
    }, 500);
  };

  const scanForNumbers = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) {
      return;
    }

    setIsProcessing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
        setIsProcessing(false);
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple number detection (this is a basic implementation)
      // In a real implementation, you'd use a proper OCR library
      const detectedCode = simulateNumberDetection(imageData);
      
      if (detectedCode) {
        console.log('[QRScanner] Number sequence detected:', detectedCode);
        onCodeScanned(detectedCode);
        toast.success(`Ticket code ${detectedCode} scanned successfully!`);
        onClose();
      }
    } catch (error) {
      console.error('[QRScanner] Error during scan:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate number detection - in reality you'd use OCR
  const simulateNumberDetection = (imageData: ImageData): string | null => {
    // This is a placeholder for actual OCR implementation
    // For now, we'll simulate detection with a random chance
    const randomChance = Math.random();
    
    if (randomChance > 0.95) { // 5% chance to "detect" a code
      // Generate a realistic ticket code (numbers only)
      const ticketCode = Math.floor(Math.random() * 999999999).toString().padStart(9, '0');
      return ticketCode;
    }
    
    return null;
  };

  const handleManualInput = () => {
    const code = prompt("Enter ticket code manually (numbers only):");
    if (code && code.trim()) {
      // Validate that it contains only numbers
      const numbersOnly = code.replace(/\D/g, '');
      if (numbersOnly.length > 0) {
        onCodeScanned(numbersOnly);
        toast.success("Ticket code added successfully!");
        onClose();
      } else {
        toast.error("Please enter a valid numeric ticket code");
      }
    }
  };

  const handleTestScan = () => {
    // Generate a test ticket code for testing purposes
    const testCode = Math.floor(Math.random() * 999999999).toString().padStart(9, '0');
    onCodeScanned(testCode);
    toast.success(`Test ticket code ${testCode} scanned!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Ticket Codes</DialogTitle>
          <DialogDescription>
            Point your camera at a ticket code to scan numeric codes automatically, or enter codes manually.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                <div className="absolute inset-0 border-2 border-betting-green rounded-lg pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-lg">
                    <ScanLine className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 text-white animate-pulse" />
                  </div>
                </div>
                {isProcessing && (
                  <div className="absolute top-2 right-2 bg-betting-green text-white px-2 py-1 rounded text-sm">
                    Scanning...
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Camera loading...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleTestScan}
              className="flex-1 bg-betting-green hover:bg-betting-green-dark"
              disabled={!isScanning}
            >
              Test Scan
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
