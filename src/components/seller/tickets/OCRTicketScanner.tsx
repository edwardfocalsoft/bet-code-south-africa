
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, ScanText, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string>('');
  const [detectedCodes, setDetectedCodes] = useState<string[]>([]);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const autoScanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-scan every 3 seconds when enabled and camera is ready
  useEffect(() => {
    if (autoScanEnabled && videoLoaded && !isProcessing) {
      autoScanTimeoutRef.current = setTimeout(() => {
        captureAndProcessImage();
      }, 3000);
    }

    return () => {
      if (autoScanTimeoutRef.current) {
        clearTimeout(autoScanTimeoutRef.current);
      }
    };
  }, [autoScanEnabled, videoLoaded, isProcessing]);

  const startCamera = async () => {
    try {
      console.log('[OCRScanner] Starting camera...');
      setCameraError(null);
      setVideoLoaded(false);
      setDetectedText('');
      setDetectedCodes([]);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        const video = videoRef.current;
        
        const handleLoadedMetadata = () => {
          console.log('[OCRScanner] Video metadata loaded');
          video.play().then(() => {
            console.log('[OCRScanner] Video playing successfully');
            setVideoLoaded(true);
            setIsScanning(true);
          }).catch((error) => {
            console.error('[OCRScanner] Error playing video:', error);
            setCameraError("Failed to start video playback");
          });
        };

        const handleCanPlay = () => {
          console.log('[OCRScanner] Video can play');
          if (!videoLoaded) {
            setVideoLoaded(true);
            setIsScanning(true);
          }
        };

        const handleError = (error: Event) => {
          console.error('[OCRScanner] Video error:', error);
          setCameraError("Video stream error");
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleError);
        
        const cleanup = () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('error', handleError);
        };
        
        (video as any)._cleanup = cleanup;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Could not access camera. Please check permissions and try again.");
      toast.error("Could not access camera. Please check permissions and try again.");
    }
  };

  const stopCamera = () => {
    console.log('[OCRScanner] Stopping camera...');
    
    if (autoScanTimeoutRef.current) {
      clearTimeout(autoScanTimeoutRef.current);
    }
    
    if (videoRef.current && (videoRef.current as any)._cleanup) {
      (videoRef.current as any)._cleanup();
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
    setVideoLoaded(false);
    setCameraError(null);
    setDetectedText('');
    setDetectedCodes([]);
  };

  const captureAndProcessImage = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || !videoLoaded) {
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
      
      // Convert canvas to base64
      const imageData = canvas.toDataURL('image/png');
      
      console.log('[OCRScanner] Calling OCR edge function...');
      
      // Call the Supabase Edge Function for OCR processing
      const { data, error } = await supabase.functions.invoke('ocr-scan', {
        body: { imageData }
      });

      if (error) {
        console.error('[OCRScanner] Edge function error:', error);
        if (!autoScanEnabled) {
          toast.error("OCR processing failed. Please try again.");
        }
        return;
      }

      console.log('[OCRScanner] OCR result:', data);
      
      if (data?.detectedCodes && data.detectedCodes.length > 0) {
        setDetectedCodes(data.detectedCodes);
        setDetectedText(data.fullText || '');
        
        if (!autoScanEnabled) {
          toast.success(`Found ${data.detectedCodes.length} potential ticket code(s)!`);
        }
      } else {
        setDetectedText(data?.fullText || '');
        setDetectedCodes([]);
        
        if (!autoScanEnabled && data?.fullText) {
          toast.info("Text detected but no valid ticket codes found.");
        }
      }
      
    } catch (error) {
      console.error('[OCRScanner] Error during capture:', error);
      if (!autoScanEnabled) {
        toast.error("Failed to process image. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCodeSelect = (code: string) => {
    onCodeScanned(code);
    toast.success(`Ticket code "${code}" added successfully!`);
    onClose();
  };

  const handleManualInput = () => {
    const code = prompt("Enter ticket code manually:");
    if (code && code.trim()) {
      const cleanCode = code.trim().toUpperCase();
      if (/^[A-Za-z0-9]{4,}$/.test(cleanCode)) {
        handleCodeSelect(cleanCode);
      } else {
        toast.error("Please enter a valid alphanumeric ticket code (letters and numbers, at least 4 characters)");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan Ticket Codes</DialogTitle>
          <DialogDescription>
            Point your camera at handwritten or printed ticket codes. The scanner will automatically detect text.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {cameraError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{cameraError}</p>
                  <Button 
                    onClick={startCamera} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    Retry Camera
                  </Button>
                </div>
              </div>
            ) : !videoLoaded ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-gray-600">Camera loading...</p>
                </div>
              </div>
            ) : (
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
                    Processing...
                  </div>
                )}
                {detectedCodes.length > 0 && (
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {detectedCodes.length} code(s) found
                  </div>
                )}
              </>
            )}
          </div>

          {/* Auto-scan toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoScanEnabled}
                onChange={(e) => setAutoScanEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto-scan every 3 seconds</span>
            </label>
          </div>

          {/* Detected codes */}
          {detectedCodes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Detected Ticket Codes:</h4>
              <div className="grid gap-2">
                {detectedCodes.map((code, index) => (
                  <Button
                    key={index}
                    onClick={() => handleCodeSelect(code)}
                    variant="outline"
                    className="justify-start text-left"
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    {code}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Detected text preview */}
          {detectedText && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Detected Text:</h4>
              <div className="bg-gray-50 p-2 rounded text-xs max-h-20 overflow-y-auto">
                {detectedText}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={captureAndProcessImage}
              className="flex-1 bg-betting-green hover:bg-betting-green-dark"
              disabled={!videoLoaded || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
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
