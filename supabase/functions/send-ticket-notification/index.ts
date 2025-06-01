
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TicketNotificationRequest {
  buyerEmail: string;
  buyerUsername: string;
  sellerUsername: string;
  ticketTitle: string;
  ticketId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-ticket-notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { buyerEmail, buyerUsername, sellerUsername, ticketTitle, ticketId }: TicketNotificationRequest = await req.json();

    console.log(`Sending ticket notification email to ${buyerEmail} about ticket: ${ticketTitle}`);

    const ticketUrl = `https://lvcbgoatolxgyuyuqyyr.supabase.co/tickets/${ticketId}`;

    const emailResponse = await resend.emails.send({
      from: "BetCode SA <notifications@resend.dev>",
      to: [buyerEmail],
      subject: `New Ticket from ${sellerUsername}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">New Betting Ticket Available!</h1>
          <p>Hi ${buyerUsername},</p>
          <p><strong>${sellerUsername}</strong> has just published a new betting ticket that might interest you:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin: 0 0 10px 0;">${ticketTitle}</h2>
            <p style="margin: 0; color: #6b7280;">Published by ${sellerUsername}</p>
          </div>
          
          <p>
            <a href="${ticketUrl}" 
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Ticket Details
            </a>
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            You're receiving this email because you're subscribed to ${sellerUsername}. 
            If you no longer wish to receive these notifications, you can unsubscribe from your account settings.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            BetCode South Africa - Your trusted betting tips platform
          </p>
        </div>
      `,
    });

    console.log("Ticket notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-ticket-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
