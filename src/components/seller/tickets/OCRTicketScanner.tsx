
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, ScanText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Tesseract from 'tesseract.js';

interface OCRTicketScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeScanned: (code: string) => void;
}

const OCRTicketScanner: React.FC<OCRTicketScannerProps> = ({
  isOpen,
  onClose,
  onCodeScanned,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
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
      console.log('[OCRScanner] Starting camera...');
      
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
          console.log('[OCRScanner] Video loaded, ready for OCR scanning');
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions and try again.");
    }
  };

  const stopCamera = () => {
    console.log('[OCRScanner] Stopping camera...');
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('[OCRScanner] Camera track stopped');
      });
      setStream(null);
    }
    setIsScanning(false);
    setIsProcessing(false);
    setOcrProgress(0);
  };

  const captureAndProcessImage = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setOcrProgress(0);
    
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
      
      // Convert canvas to blob for OCR processing
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsProcessing(false);
          return;
        }

        console.log('[OCRScanner] Starting OCR processing...');
        
        try {
          const { data: { text } } = await Tesseract.recognize(
            blob,
            'eng',
            {
              logger: m => {
                if (m.status === 'recognizing text') {
                  setOcrProgress(Math.round(m.progress * 100));
                }
              }
            }
          );
          
          console.log('[OCRScanner] OCR result:', text);
          
          // Extract alphanumeric codes from the recognized text
          const detectedCodes = extractTicketCodes(text);
          
          if (detectedCodes.length > 0) {
            console.log('[OCRScanner] Ticket codes detected:', detectedCodes);
            
            // For now, take the first detected code
            const firstCode = detectedCodes[0];
            onCodeScanned(firstCode);
            toast.success(`Ticket code "${firstCode}" scanned successfully!`);
            onClose();
          } else {
            toast.error("No valid ticket codes found. Please ensure the text is clearly visible.");
          }
        } catch (ocrError) {
          console.error('[OCRScanner] OCR processing error:', ocrError);
          toast.error("Failed to process image. Please try again with better lighting.");
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('[OCRScanner] Error during capture:', error);
      toast.error("Failed to capture image. Please try again.");
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  // Extract potential ticket codes from OCR text
  const extractTicketCodes = (text: string): string[] => {
    const codes: string[] = [];
    
    // Clean up the text and split into lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (const line of lines) {
      // Look for alphanumeric sequences that could be ticket codes
      // Typically 4-20 characters, containing letters and numbers
      const matches = line.match(/[A-Za-z0-9]{4,20}/g);
      
      if (matches) {
        for (const match of matches) {
          // Filter out sequences that are too short or look like common words
          if (match.length >= 4 && 
              /[0-9]/.test(match) && // Must contain at least one number
              !/^(the|and|for|you|are|not|can|was|but|had|his|her|all|any|may|day|get|has|him|how|man|new|now|old|see|two|way|who|boy|did|its|let|put|say|she|too|use)$/i.test(match)) {
            codes.push(match.toUpperCase());
          }
        }
      }
    }
    
    // Remove duplicates
    return [...new Set(codes)];
  };

  const handleManualInput = () => {
    const code = prompt("Enter ticket code manually:");
    if (code && code.trim()) {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode.length >= 4) {
        onCodeScanned(cleanCode);
        toast.success("Ticket code added successfully!");
        onClose();
      } else {
        toast.error("Please enter a valid ticket code (at least 4 characters)");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Handwritten Ticket Codes</DialogTitle>
          <DialogDescription>
            Point your camera at handwritten ticket codes. The scanner will automatically detect alphanumeric codes.
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
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-24 border-2 border-white rounded-lg">
                    <ScanText className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 text-white animate-pulse" />
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                      Position codes here
                    </div>
                  </div>
                </div>
                {isProcessing && (
                  <div className="absolute top-2 right-2 bg-betting-green text-white px-3 py-2 rounded text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing... {ocrProgress}%
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
              onClick={captureAndProcessImage}
              className="flex-1 bg-betting-green hover:bg-betting-green-dark"
              disabled={!isScanning || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ScanText className="h-4 w-4 mr-2" />
                  Scan Now
                </>
              )}
            </Button>
            <Button
              onClick={handleManualInput}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              Manual Input
            </Button>
          </div>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Close Scanner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OCRTicketScanner;
