
import { useState } from "react";
import { BettingSite } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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
      return false;
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
    addTicket,
    removeTicket,
    updateTicket,
    addScannedCode,
    validateTicketCodeUniqueness,
    toggleMultiTicket,
    createEmptyTicket
  };
};
