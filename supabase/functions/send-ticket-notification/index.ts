import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface TicketNotificationRequest {
  buyerEmail: string;
  buyerUsername: string;
  sellerUsername: string;
  ticketTitle: string;
  ticketId: string;
  ticketDescription?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const body: TicketNotificationRequest = await req.json();
    
    if (!body.buyerEmail || !body.ticketId) {
      throw new Error("Missing required fields");
    }

    const ticketUrl = `https://lvcbgoatolxgyuyuqyyr.supabase.co/tickets/${body.ticketId}`;

    const { data, error } = await resend.emails.send({
      from: "BetCode SA <notifications@resend.dev>",
      to: [body.buyerEmail],
      subject: `New Ticket from ${body.sellerUsername}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">New Betting Ticket Available!</h1>
          <p>Hi ${body.buyerUsername},</p>
          <p><strong>${body.sellerUsername}</strong> has just published a new betting ticket:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin: 0 0 10px 0;">${body.ticketTitle}</h2>
            ${body.ticketDescription ? `<p style="margin: 10px 0;">${body.ticketDescription}</p>` : ''}
            <p style="margin: 0; color: #6b7280;">Published by ${body.sellerUsername}</p>
          </div>
          
          <p>
            <a href="${ticketUrl}" 
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Ticket Details
            </a>
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            You're receiving this email because you're subscribed to ${body.sellerUsername}.
          </p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);