
import { useState, useRef, useEffect } from "react";
import { BettingSite } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SingleTicketData {
  id: string;
  title: string;
  description: string;
  bettingSite: BettingSite;
  price: number;
  isFree: boolean;
  odds: string;
  date: Date;
  time: string;
  ticketCode: string;
  numberOfLegs: number;
}

interface MultiTicketFormData {
  tickets: SingleTicketData[];
  isMultiTicket: boolean;
}

export const useMultiTicketForm = () => {
  const [formData, setFormData] = useState<MultiTicketFormData>({
    tickets: [],
    isMultiTicket: false,
  });
  
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Check camera permissions first
      const cameraAllowed = await checkCameraPermissions();
      if (!cameraAllowed) return;

      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Error playing video stream:", err);
          toast.error("Failed to start camera preview");
          stopCamera();
        });
      }
    } catch (err) {
      console.error('Camera error:', err);
      setIsScanning(false);
      toast.error('Could not access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const checkCameraPermissions = async (): Promise<boolean> => {
    try {
      // Check if browser supports permissions API
      if (!navigator.permissions) {
        return true; // Proceed anyway and let getUserMedia handle the permission
      }

      const permissionStatus = await navigator.permissions.query({
        name: 'camera' as any
      });

      if (permissionStatus.state === 'denied') {
        toast.error('Camera permission denied. Please enable it in your browser settings.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission check error:', error);
      return true; // Proceed anyway as some browsers don't support permissions API
    }
  };

  const generateTicketId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const createEmptyTicket = (): SingleTicketData => ({
    id: generateTicketId(),
    title: "",
    description: "",
    bettingSite: "" as BettingSite,
    price: 0,
    isFree: false,
    odds: "",
    date: new Date(),
    time: "19:00",
    ticketCode: "",
    numberOfLegs: 0,
  });

  const addTicket = () => {
    setFormData(prev => ({
      ...prev,
      tickets: [...prev.tickets, createEmptyTicket()]
    }));
  };

  const removeTicket = (ticketId: string) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.filter(ticket => ticket.id !== ticketId)
    }));
  };

  const updateTicket = (ticketId: string, updates: Partial<SingleTicketData>) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, ...updates } : ticket
      )
    }));
  };

  const addScannedCode = (code: string) => {
    if (!scannedCodes.includes(code)) {
      setScannedCodes(prev => [...prev, code]);
      const newTicket = createEmptyTicket();
      newTicket.ticketCode = code;
      setFormData(prev => ({
        ...prev,
        tickets: [...prev.tickets, newTicket]
      }));
      toast.success(`Ticket code ${code} scanned successfully`);
    } else {
      toast.error("This code has already been scanned");
    }
  };

  const validateTicketCodeUniqueness = async (ticketCode: string): Promise<boolean> => {
    try {
      const { data, error, count } = await supabase
        .from("tickets")
        .select("ticket_code", { count: "exact" })
        .eq("ticket_code", ticketCode)
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      return count === 0;
    } catch (error) {
      console.error("Error checking ticket code uniqueness:", error);
      toast.error("Error verifying ticket code");
      return false;
    }
  };

  const validateTicket = (ticket: SingleTicketData): boolean => {
    if (!ticket.title.trim()) {
      toast.error("All tickets must have a title");
      return false;
    }
    if (!ticket.description.trim()) {
      toast.error("All tickets must have a description");
      return false;
    }
    if (!ticket.bettingSite) {
      toast.error("All tickets must have a betting site selected");
      return false;
    }
    if (!ticket.ticketCode.trim()) {
      toast.error("All tickets must have a ticket code");
      return false;
    }
    if (!ticket.odds.trim()) {
      toast.error("All tickets must have odds specified");
      return false;
    }
    if (ticket.numberOfLegs < 2) {
      toast.error("All tickets must have at least 2 legs");
      return false;
    }
    if (!ticket.isFree && ticket.price <= 0) {
      toast.error("All paid tickets must have a price greater than 0");
      return false;
    }
    return true;
  };

  const submitMultipleTickets = async (userId: string) => {
    if (formData.tickets.length === 0) {
      toast.error("Please add at least one ticket");
      return false;
    }

    // Validate all tickets
    for (const ticket of formData.tickets) {
      if (!validateTicket(ticket)) {
        return false;
      }
    }

    setIsSubmitting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const ticket of formData.tickets) {
        try {
          // Check if ticket code is unique
          const isUnique = await validateTicketCodeUniqueness(ticket.ticketCode);
          if (!isUnique) {
            toast.error(`Ticket code ${ticket.ticketCode} already exists`);
            errorCount++;
            continue;
          }

          // Combine date and time for kickoff_time
          const kickoffDateTime = new Date(ticket.date);
          const [hours, minutes] = ticket.time.split(':');
          kickoffDateTime.setHours(parseInt(hours), parseInt(minutes));

          const ticketData = {
            seller_id: userId,
            title: ticket.title,
            description: ticket.description,
            betting_site: ticket.bettingSite,
            price: ticket.isFree ? 0 : ticket.price,
            is_free: ticket.isFree,
            odds: parseFloat(ticket.odds),
            kickoff_time: kickoffDateTime.toISOString(),
            ticket_code: ticket.ticketCode,
          };

          const { error } = await supabase
            .from('tickets')
            .insert(ticketData);

          if (error) {
            throw error;
          }

          successCount++;
        } catch (error: any) {
          console.error(`Error creating ticket ${ticket.ticketCode}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} ticket(s)`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to create ${errorCount} ticket(s)`);
      }

      // Reset form if all tickets were created successfully
      if (errorCount === 0) {
        setFormData({
          tickets: [],
          isMultiTicket: false,
        });
        setScannedCodes([]);
        return true;
      }

      return successCount > 0;
    } catch (error: any) {
      toast.error(`Error creating tickets: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMultiTicket = () => {
    setFormData(prev => ({
      ...prev,
      isMultiTicket: !prev.isMultiTicket,
      tickets: !prev.isMultiTicket ? [createEmptyTicket()] : []
    }));
  };

  return {
    formData,
    setFormData,
    isScanning,
    setIsScanning,
    scannedCodes,
    isSubmitting,
    addTicket,
    removeTicket,
    updateTicket,
    addScannedCode,
    validateTicketCodeUniqueness,
    toggleMultiTicket,
    createEmptyTicket,
    submitMultipleTickets,
    startCamera,
    stopCamera,
    videoRef,
  };
};
