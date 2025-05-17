
import { useState } from "react";
import { BettingSite } from "@/types";

interface TicketFormData {
  title: string;
  description: string;
  bettingSite: BettingSite;
  price: number;
  isFree: boolean;
  odds: string;
  date: Date;
  time: string;
  ticketCode: string;
}

interface TicketFormErrors {
  title: string;
  description: string;
  bettingSite: string;
  price: string;
  odds: string;
  date: string;
  time: string;
  ticketCode: string;
}

export const useTicketForm = () => {
  const [step, setStep] = useState(1);
  const [ticketData, setTicketData] = useState<TicketFormData>({
    title: "",
    description: "",
    bettingSite: "" as BettingSite,
    price: 0,
    isFree: false,
    odds: "",
    date: new Date(),
    time: "19:00",
    ticketCode: "",
  });
  
  const [errors, setErrors] = useState<TicketFormErrors>({
    title: "",
    description: "",
    bettingSite: "",
    price: "",
    odds: "",
    date: "",
    time: "",
    ticketCode: "",
  });
  
  const validateStep1 = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    if (!ticketData.title.trim()) {
      newErrors.title = "Ticket type is required";
      valid = false;
    } else {
      newErrors.title = "";
    }
    
    if (!ticketData.description.trim()) {
      newErrors.description = "Description is required";
      valid = false;
    } else {
      newErrors.description = "";
    }
    
    if (!ticketData.bettingSite) {
      newErrors.bettingSite = "Betting site is required";
      valid = false;
    } else {
      newErrors.bettingSite = "";
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const validateStep2 = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    if (!ticketData.isFree && (ticketData.price <= 0 || isNaN(ticketData.price))) {
      newErrors.price = "Please set a valid price";
      valid = false;
    } else {
      newErrors.price = "";
    }
    
    if (!ticketData.odds.trim()) {
      newErrors.odds = "Odds are required";
      valid = false;
    } else {
      newErrors.odds = "";
    }
    
    if (!ticketData.ticketCode.trim()) {
      newErrors.ticketCode = "Ticket code is required";
      valid = false;
    } else {
      newErrors.ticketCode = "";
    }
    
    // Date/time validation
    const now = new Date();
    const kickoffTime = new Date(ticketData.date);
    const [hours, minutes] = ticketData.time.split(':').map(Number);
    kickoffTime.setHours(hours, minutes);
    
    if (kickoffTime <= now) {
      newErrors.date = "Kickoff time must be in the future";
      valid = false;
    } else {
      newErrors.date = "";
    }
    
    setErrors(newErrors);
    return valid;
  };

  return {
    step,
    setStep,
    ticketData,
    setTicketData,
    errors,
    validateStep1,
    validateStep2
  };
};
