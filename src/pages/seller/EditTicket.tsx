
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { BettingTicket, BettingSite } from '@/types';
import { LoadingState } from '@/components/purchases/LoadingState';
import { ArrowLeft, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EditTicket: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [ticket, setTicket] = useState<BettingTicket | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bettingSite: '' as BettingSite,
    price: 0,
    odds: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.id && id) {
      fetchTicket();
    }
  }, [currentUser, id]);

  const fetchTicket = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .eq('seller_id', currentUser?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        // Create BettingTicket object from data
        const ticketData: BettingTicket = {
          id: data.id,
          title: data.title,
          description: data.description,
          sellerId: data.seller_id,
          sellerUsername: '',
          price: data.price,
          isFree: data.is_free,
          bettingSite: data.betting_site as BettingSite,
          kickoffTime: new Date(data.kickoff_time),
          createdAt: new Date(data.created_at),
          odds: data.odds,
          isHidden: data.is_hidden,
          isExpired: data.is_expired,
          eventResults: data.event_results
        };
        
        setTicket(ticketData);
        setFormData({
          title: data.title,
          description: data.description,
          bettingSite: data.betting_site as BettingSite,
          // Make sure price is converted to a number
          price: typeof data.price === 'string' ? parseFloat(data.price) : data.price || 0,
          // Ensure odds is a string
          odds: data.odds !== null ? String(data.odds) : '',
        });
      }
    } catch (error: any) {
      toast.error(`Error loading ticket: ${error.message}`);
      navigate('/seller/tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Ensure price is a valid number
      const priceValue = parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [name]: priceValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBettingSiteChange = (value: BettingSite) => {
    setFormData(prev => ({ ...prev, bettingSite: value }));
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({ ...prev, title: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          title: formData.title,
          description: formData.description,
          betting_site: formData.bettingSite,
          // Ensure price is stored as a number
          price: formData.price,
          // Ensure odds is properly converted to a number or null
          odds: formData.odds ? parseFloat(formData.odds) : null,
        })
        .eq('id', id)
        .eq('seller_id', currentUser?.id);
      
      if (error) throw error;
      
      toast.success('Ticket updated successfully');
      navigate('/seller/tickets');
    } catch (error: any) {
      toast.error(`Error updating ticket: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout requireAuth={true} allowedRoles={['seller']}>
        <div className="container py-8">
          <LoadingState />
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout requireAuth={true} allowedRoles={['seller']}>
        <div className="container py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Ticket not found or you don't have permission to edit it.</p>
            <Button onClick={() => navigate('/seller/tickets')} variant="outline">
              Return to My Tickets
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const bettingSites: BettingSite[] = [
    "Betway", 
    "HollywoodBets", 
    "Supabets", 
    "Playa", 
    "10bet", 
    "Easybet"
  ];
  
  const ticketTypes = [
    "Standard Ticket",
    "High Stake Ticket",
    "Long Ticket"
  ];

  return (
    <Layout requireAuth={true} allowedRoles={['seller']}>
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/seller/tickets')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Heading as="h1" size="2xl">Edit Ticket</Heading>
        </div>
        
        <div className="betting-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </Label>
                <Select
                  value={formData.title}
                  onValueChange={handleTitleChange}
                >
                  <SelectTrigger id="title">
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
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="bettingSite">Betting Site</Label>
                <Select 
                  value={formData.bettingSite} 
                  onValueChange={(value) => handleBettingSiteChange(value as BettingSite)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a betting site" />
                  </SelectTrigger>
                  <SelectContent>
                    {bettingSites.map((site) => (
                      <SelectItem key={site} value={site}>
                        {site}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1">
                    Price
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="odds" className="block text-sm font-medium mb-1">
                    Odds
                  </label>
                  <Input
                    id="odds"
                    name="odds"
                    value={formData.odds}
                    onChange={handleInputChange}
                    placeholder="e.g. 2.5 or 5/2"
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/seller/tickets')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-betting-green hover:bg-betting-green-dark flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditTicket;
