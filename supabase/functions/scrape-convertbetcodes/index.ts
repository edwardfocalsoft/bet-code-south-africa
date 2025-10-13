import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingCodeData {
  code: string;
  odds?: number;
  outcomes?: number;
  events?: number;
  legs?: number;
}


function getTicketTitle(events?: number): string {
  if (!events) return 'Standard Ticket';
  
  if (events >= 16) return 'Long Ticket';
  if (events >= 6) return 'Standard Ticket';
  if (events >= 3) return 'High Stake';
  return 'Standard Ticket';
}

function getKickoffTime(): string {
  // Get current time in Africa/Johannesburg timezone
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const johannesburgOffset = 2; // UTC+2
  const johannesburgTime = new Date(utc + (johannesburgOffset * 3600000));
  
  // Add 8 hours to current time
  const kickoffTime = new Date(johannesburgTime.getTime() + (8 * 60 * 60 * 1000));
  
  // Round to the top of the hour (set minutes and seconds to 0)
  kickoffTime.setMinutes(0);
  kickoffTime.setSeconds(0);
  kickoffTime.setMilliseconds(0);
  
  return kickoffTime.toISOString();
}

async function scrapeBetwayFreeCodesAndNotify() {
  console.log('Starting Betway booking codes API fetch...');
  
  try {
    // Call the Betway booking codes API directly
    const apiUrl = 'https://cmsgt1.betwayafrican.com/bookingcode?skip=0&limit=20';
    console.log('Fetching from API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    // Extract booking codes from the response
    // The exact structure depends on the API response, so we'll handle multiple possible formats
    let bookingCodes: BookingCodeData[] = [];
    
    if (Array.isArray(data)) {
      bookingCodes = data;
    } else if (data.data && Array.isArray(data.data)) {
      bookingCodes = data.data;
    } else if (data.bookingCodes && Array.isArray(data.bookingCodes)) {
      bookingCodes = data.bookingCodes;
    } else if (data.results && Array.isArray(data.results)) {
      bookingCodes = data.results;
    } else {
      console.log('Unexpected API response structure:', data);
      return {
        success: true,
        message: 'No booking codes found in API response',
        processed: 0,
        skipped: 0,
        errors: 0
      };
    }
    
    console.log(`Found ${bookingCodes.length} booking codes from API`);
    
    if (bookingCodes.length === 0) {
      console.log('No booking codes in API response');
      return {
        success: true,
        message: 'No booking codes found',
        processed: 0,
        skipped: 0,
        errors: 0
      };
    }
    
    // Get Supabase client with service role key
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not found');
    }
    
    const supabase = createClient(
      'https://lvcbgoatolxgyuyuqyyr.supabase.co',
      supabaseServiceKey
    );
    
    // Get system seller ID with fallback logic
    let systemSellerId = Deno.env.get('SYSTEM_SELLER_ID');
    let sellerIdSource = 'environment';
    
    if (!systemSellerId) {
      console.log('SYSTEM_SELLER_ID not found in environment, querying database for masterbet user...');
      
      // Try to find masterbet user in database
      const { data: masterbetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', 'masterbet')
        .single();
      
      if (masterbetProfile && !profileError) {
        systemSellerId = masterbetProfile.id;
        sellerIdSource = 'database';
        console.log('Found masterbet user ID in database:', systemSellerId);
      } else {
        console.log('Failed to find masterbet user in database, using hardcoded fallback');
        systemSellerId = '65166241-9382-44e3-a40b-af9b62f6afb0'; // hardcoded masterbet UUID
        sellerIdSource = 'hardcoded';
      }
    }
    
    console.log(`Using system seller ID: ${systemSellerId} (source: ${sellerIdSource})`);
    
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    
    const kickoffTime = getKickoffTime();
    console.log('Using kickoff time:', kickoffTime);
    
    for (const codeItem of bookingCodes) {
      // Extract code - handle different possible field names
      const code = (codeItem.code || codeItem.bookingCode || '').toString().replace(/^#?/, '').toUpperCase();
      if (!code || !code.startsWith('BW')) {
        console.log('Skipping invalid code:', code);
        continue;
      }
      
      // Extract odds and outcomes/legs - handle different possible field names
      const odds = codeItem.odds || codeItem.totalOdds || undefined;
      const events = codeItem.outcomes || codeItem.events || codeItem.legs || codeItem.selections || undefined;
      
      try {
        // Check if this code already exists today for the system seller
        const { data: existingTickets, error: checkError } = await supabase
          .from('tickets')
          .select('id')
          .eq('seller_id', systemSellerId)
          .eq('ticket_code', code)
          .gte('created_at', new Date().toISOString().split('T')[0]); // Today
        
        if (checkError) {
          console.error('Error checking existing tickets:', checkError);
          errors++;
          continue;
        }
        
        if (existingTickets && existingTickets.length > 0) {
          console.log('Code already exists today:', code);
          skipped++;
          continue;
        }
        
        // Insert new ticket with new format
        const ticketTitle = getTicketTitle(events);
        
        const ticketData = {
          title: ticketTitle,
          description: 'Big Boom Put Together By Masterbet.',
          seller_id: systemSellerId,
          price: 0,
          is_free: true,
          betting_site: 'Betway',
          kickoff_time: kickoffTime,
          is_hidden: false,
          is_expired: false,
          ticket_code: code,
          odds: odds || null,
          legs: events || null
        };
        
        const { error: insertError } = await supabase
          .from('tickets')
          .insert(ticketData);
        
        if (insertError) {
          console.error('Error inserting ticket:', insertError);
          errors++;
          continue;
        }
        
        console.log('Successfully inserted code:', code);
        processed++;
        
      } catch (err) {
        console.error('Error processing code', code, ':', err);
        errors++;
      }
    }
    
    const result = {
      success: true,
      message: `Processed ${processed} codes, skipped ${skipped}, errors ${errors}`,
      processed,
      skipped,
      errors,
      totalFound: bookingCodes.length,
      kickoffTime
    };
    
    console.log('Scraping completed:', result);
    return result;
    
  } catch (error) {
    console.error('Scraping failed:', error);
    return {
      success: false,
      error: error.message,
      processed: 0,
      skipped: 0,
      errors: 1
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const result = await scrapeBetwayFreeCodesAndNotify();
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 500,
      },
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        processed: 0,
        skipped: 0,
        errors: 1
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});