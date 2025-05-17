
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BettingSite } from "@/types";
import { CalendarIcon, Clock, Loader2, DollarSign, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const bettingSites: BettingSite[] = [
  "Betway",
  "HollywoodBets",
  "Supabets",
  "Playa",
  "10bet",
  "Easybet",
];

const ticketTypes = [
  "Standard Ticket",
  "High Stake Ticket",
  "Long Ticket",
];

const CreateTicket: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const [ticketData, setTicketData] = useState({
    title: "",
    description: "",
    bettingSite: "" as BettingSite,
    price: 0,
    isFree: false,
    odds: "",
    date: new Date(),
    time: "19:00",
  });
  
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    bettingSite: "",
    price: "",
    odds: "",
    date: "",
    time: "",
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
  
  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };
  
  const handlePrevStep = () => {
    setStep(1);
  };
  
  const handleSubmit = async () => {
    if (!currentUser?.id) {
      toast.error("You must be logged in to create a ticket");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create a Date object with the selected date and time
      const kickoffTime = new Date(ticketData.date);
      const [hours, minutes] = ticketData.time.split(':').map(Number);
      kickoffTime.setHours(hours, minutes);
      
      const { data, error } = await supabase
        .from("tickets")
        .insert({
          seller_id: currentUser.id,
          title: ticketData.title,
          description: ticketData.description,
          betting_site: ticketData.bettingSite,
          price: ticketData.isFree ? 0 : ticketData.price,
          is_free: ticketData.isFree,
          odds: parseFloat(ticketData.odds),
          kickoff_time: kickoffTime.toISOString(),
        })
        .select();
      
      if (error) throw error;
      
      toast.success("Ticket created successfully!");
      navigate(`/seller/tickets`);
    } catch (error: any) {
      toast.error(`Error creating ticket: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Betting Ticket</h1>
        
        <div className="mb-8 bg-betting-dark-gray p-4 rounded-lg">
          <div className="relative">
            <div className="flex justify-between">
              <div className={cn(
                "flex flex-col items-center",
                step >= 1 ? "text-betting-green" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2",
                  step >= 1 ? "border-betting-green bg-betting-green/10" : "border-muted-foreground"
                )}>
                  {step > 1 ? <Check className="h-5 w-5" /> : "1"}
                </div>
                <span className="text-xs">Ticket Info</span>
              </div>
              
              <div className={cn(
                "flex flex-col items-center",
                step >= 2 ? "text-betting-green" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2",
                  step >= 2 ? "border-betting-green bg-betting-green/10" : "border-muted-foreground"
                )}>
                  2
                </div>
                <span className="text-xs">Details & Pricing</span>
              </div>
            </div>
            
            <div className="absolute top-5 left-0 w-full">
              <div className={cn(
                "h-0.5 w-full bg-muted-foreground",
                step >= 2 ? "bg-betting-green" : "bg-muted-foreground"
              )}></div>
            </div>
          </div>
        </div>
        
        <Card className="betting-card">
          <CardHeader>
            <CardTitle>{step === 1 ? "Ticket Information" : "Pricing & Details"}</CardTitle>
            <CardDescription>
              {step === 1 
                ? "Enter the basic information about your betting ticket" 
                : "Set pricing and event details"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Ticket Type
                  </Label>
                  <Select
                    value={ticketData.title}
                    onValueChange={(value) => setTicketData({...ticketData, title: value})}
                  >
                    <SelectTrigger id="title" className="bg-betting-black border-betting-light-gray">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description
                  </Label>
                  <Textarea 
                    id="description"
                    placeholder="Describe your ticket strategy: BTS, straight wins, corners, 10 minute draws, etc."
                    value={ticketData.description}
                    onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                    className="bg-betting-black border-betting-light-gray min-h-[120px]"
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="betting-site">
                    Betting Site
                  </Label>
                  <Select
                    value={ticketData.bettingSite}
                    onValueChange={(value) => setTicketData({...ticketData, bettingSite: value as BettingSite})}
                  >
                    <SelectTrigger id="betting-site" className="bg-betting-black border-betting-light-gray">
                      <SelectValue placeholder="Select betting site" />
                    </SelectTrigger>
                    <SelectContent>
                      {bettingSites.map((site) => (
                        <SelectItem key={site} value={site}>
                          {site}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bettingSite && <p className="text-red-500 text-xs mt-1">{errors.bettingSite}</p>}
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={handleNextStep}
                    className="bg-betting-green hover:bg-betting-green-dark"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="free-ticket">Free Ticket</Label>
                    <p className="text-xs text-muted-foreground">Offer this ticket for free</p>
                  </div>
                  <Switch 
                    id="free-ticket" 
                    checked={ticketData.isFree}
                    onCheckedChange={(checked) => setTicketData({...ticketData, isFree: checked})}
                  />
                </div>
                
                {!ticketData.isFree && (
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Ticket Price (ZAR)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="5"
                        placeholder="50"
                        value={ticketData.price}
                        onChange={(e) => setTicketData({...ticketData, price: parseFloat(e.target.value)})}
                        className="bg-betting-black border-betting-light-gray pl-10"
                      />
                    </div>
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="odds">
                    Total Odds
                  </Label>
                  <Input 
                    id="odds"
                    placeholder="e.g. 2.5"
                    value={ticketData.odds}
                    onChange={(e) => setTicketData({...ticketData, odds: e.target.value})}
                    className="bg-betting-black border-betting-light-gray"
                  />
                  {errors.odds && <p className="text-red-500 text-xs mt-1">{errors.odds}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-betting-black border-betting-light-gray",
                            !ticketData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {ticketData.date ? format(ticketData.date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={ticketData.date}
                          onSelect={(date) => date && setTicketData({...ticketData, date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Event Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        value={ticketData.time}
                        onChange={(e) => setTicketData({...ticketData, time: e.target.value})}
                        className="bg-betting-black border-betting-light-gray pl-10"
                      />
                    </div>
                    {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                  </div>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                  >
                    Back
                  </Button>
                  
                  <Button
                    onClick={handleNextStep}
                    className="bg-betting-green hover:bg-betting-green-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Ticket"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateTicket;
