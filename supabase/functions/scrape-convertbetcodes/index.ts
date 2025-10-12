import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedCode {
  code: string;
  addedTimeText: string;
  addedMinutesAgo: number;
}

// Enhanced code discovery with events and odds extraction
interface EnhancedScrapedCode extends ScrapedCode {
  events?: number;
  odds?: number;
}

function parseTimeText(timeText: string): number {
  console.log('Parsing time text:', timeText);
  // Normalize text
  const cleanText = (timeText || '').trim().toLowerCase();

  if (!cleanText) return 999;

  // Handle common phrases
  if (/(just\s*now|now)/i.test(cleanText)) {
    return 0;
  }

  // Accept Facebook format (12m, 1h, etc.) and long units
  const matches = cleanText.match(/(\d+)\s*(minute|min|m|hour|hr|h|day|d|second|sec|s)/) ||
                  cleanText.match(/(\d+)(m|h|d|s)(?:\s|$)/); // Facebook format like "12m", "1h"
  if (!matches) {
    console.log('No time matches found in:', cleanText);
    return 999; // Return high number for non-matching text
  }

  const num = parseInt(matches[1]);
  const unit = matches[2];

  let minutesAgo = 999;
  switch (unit) {
    case 'minute':
    case 'min':
    case 'm':
      minutesAgo = num;
      break;
    case 'hour':
    case 'hr':
    case 'h':
      minutesAgo = num * 60;
      break;
    case 'day':
    case 'd':
      minutesAgo = num * 60 * 24;
      break;
    case 'second':
    case 'sec':
    case 's':
      minutesAgo = Math.ceil(num / 60);
      break;
    default:
      minutesAgo = 999;
  }

  console.log(`Parsed "${timeText}" as ${minutesAgo} minutes ago`);
  return minutesAgo;
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
  console.log('Starting scrape of Betway free codes...');
  
  try {
    const allScrapedCodes: EnhancedScrapedCode[] = [];
    const foundSet = new Set<string>();
    
    // Only scrape from Betway Book-a-Bet Results
    const sources = [
      {
        name: 'Betway Book-a-Bet Results',
        url: 'https://new.betway.co.za/book-a-bet-results'
      }
    ];
    
    for (const source of sources) {
      console.log(`Scraping ${source.name}...`);
      
      try {
        // Fetch the page
        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          console.log(`Failed to fetch ${source.name}: ${response.status}`);
          continue;
        }
        
        const html = await response.text();
        console.log(`Fetched ${source.name} HTML, length:`, html.length);
    
        // Parse the HTML
        const doc = new DOMParser().parseFromString(html, 'text/html');
        if (!doc) {
          console.log(`Failed to parse ${source.name} HTML`);
          continue;
        }

        // Special handling for Betway Book-a-Bet Results page
        if (source.name === 'Betway Book-a-Bet Results') {
          console.log('Processing Betway Book-a-Bet Results page...');
          console.log('First 1000 chars of HTML:', html.substring(0, 1000));
          
          // Try multiple strategies to find booking codes
          
          // Strategy 1: Look for explicit "Booking Code" text followed by the code
          const bookingCodePattern = /Booking Code[:\s]*#?(BW[A-Z0-9]{8})/gi;
          const bookingMatches = [...html.matchAll(bookingCodePattern)];
          console.log(`Strategy 1 - Found ${bookingMatches.length} codes via "Booking Code" pattern`);
          
          // Strategy 2: Look for #BW pattern
          const hashPattern = /#(BW[A-Z0-9]{8})/gi;
          const hashMatches = [...html.matchAll(hashPattern)];
          console.log(`Strategy 2 - Found ${hashMatches.length} codes with # prefix`);
          
          // Strategy 3: Look for BW pattern in quotes or attributes
          const quotedPattern = /["'](BW[A-Z0-9]{8})["']/gi;
          const quotedMatches = [...html.matchAll(quotedPattern)];
          console.log(`Strategy 3 - Found ${quotedMatches.length} codes in quotes`);
          
          // Strategy 4: Generic BW pattern
          const genericPattern = /\b(BW[A-Z0-9]{8})\b/gi;
          const genericMatches = [...html.matchAll(genericPattern)];
          console.log(`Strategy 4 - Found ${genericMatches.length} codes via generic pattern`);
          
          // Combine all matches
          const allMatches = [...bookingMatches, ...hashMatches, ...quotedMatches, ...genericMatches];
          console.log(`Total matches before deduplication: ${allMatches.length}`);
          
          for (const match of allMatches) {
            const code = match[1].toUpperCase();
            if (foundSet.has(code)) continue;
            
            console.log(`Processing code: ${code}`);
            
            // Find the code's position in the HTML to search nearby for odds and outcomes
            const codeIndex = html.indexOf(code);
            if (codeIndex === -1) continue;
            
            const windowSize = 1000; // Larger window for better context
            const start = Math.max(0, codeIndex - windowSize);
            const end = Math.min(html.length, codeIndex + windowSize);
            const contextText = html.substring(start, end);
            
            let odds: number | undefined;
            let events: number | undefined;
            
            // Extract Outcomes (number of legs) - case insensitive, flexible patterns
            const outcomesPattern = /Outcomes?[:\s]*(\d+)/i;
            const outcomesMatch = contextText.match(outcomesPattern);
            if (outcomesMatch) {
              events = parseInt(outcomesMatch[1]);
              console.log(`Found ${events} outcomes for ${code}`);
            }
            
            // Extract Odds - case insensitive, flexible patterns
            const oddsPattern = /Odds?[:\s]*(\d+(?:\.\d+)?)/i;
            const oddsMatch = contextText.match(oddsPattern);
            if (oddsMatch) {
              odds = parseFloat(oddsMatch[1]);
              console.log(`Found odds ${odds} for ${code}`);
            }
            
            console.log(`Adding code ${code} - Events: ${events || 'unknown'}, Odds: ${odds || 'unknown'}`);
            
            // These are current/active codes, so set time to 0 (just now)
            allScrapedCodes.push({
              code,
              addedTimeText: 'just now',
              addedMinutesAgo: 0,
              events,
              odds,
            });
            foundSet.add(code);
          }
          
          console.log(`Betway Book-a-Bet Results: found ${allScrapedCodes.length} unique codes`);
          continue; // Skip the regular regex/DOM scanning for this source
        }

        // This code is not reached for Betway Book-a-Bet Results anymore
        console.log(`Skipping regex/DOM scan for ${source.name} - not implemented`);

        // Not needed for Betway Book-a-Bet Results
    
    const sourceCount = allScrapedCodes.length;
    console.log(`${source.name} completed scraping`);
    
  } catch (sourceError) {
    console.error(`Error scraping ${source.name}:`, sourceError);
  }
}

console.log('Total found', allScrapedCodes.length, 'Betway-like codes from all sources');

    
    // Filter for codes added within the last 2 hours (120 minutes)
    const recentCodes = allScrapedCodes.filter(item => item.addedMinutesAgo <= 120);
    console.log('Found', recentCodes.length, 'codes added within last 2 hours');
    
    if (recentCodes.length === 0) {
      console.log('No recent BW codes found');
      return {
        success: true,
        message: 'No recent BW codes found',
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
    
    for (const codeItem of recentCodes) {
      const { code, addedTimeText, events, odds } = codeItem;
      
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
      totalFound: allScrapedCodes.length,
      recentFound: recentCodes.length,
      kickoffTime,
      codes: recentCodes.map(c => ({ code: c.code, timeText: c.addedTimeText, minutesAgo: c.addedMinutesAgo }))
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