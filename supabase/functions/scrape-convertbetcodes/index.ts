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

function parseTimeText(timeText: string): number {
  console.log('Parsing time text:', timeText);
  
  // Clean the text and extract numbers
  const cleanText = timeText.trim().toLowerCase();
  
  // Extract number followed by time unit
  const matches = cleanText.match(/(\d+)\s*(minute|min|hour|hr|day|second|sec)/);
  if (!matches) {
    console.log('No time matches found in:', cleanText);
    return 999; // Return high number for non-matching text
  }
  
  const num = parseInt(matches[1]);
  const unit = matches[2];
  
  let minutesAgo = 0;
  switch (unit) {
    case 'minute':
    case 'min':
      minutesAgo = num;
      break;
    case 'hour':
    case 'hr':
      minutesAgo = num * 60;
      break;
    case 'day':
      minutesAgo = num * 60 * 24;
      break;
    case 'second':
    case 'sec':
      minutesAgo = Math.ceil(num / 60);
      break;
    default:
      minutesAgo = 999;
  }
  
  console.log(`Parsed "${timeText}" as ${minutesAgo} minutes ago`);
  return minutesAgo;
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
    // Fetch the page
    const response = await fetch('https://convertbetcodes.com/c/free-bet-codes-for-today/Betway');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    console.log('Fetched HTML, length:', html.length);
    
    // Parse the HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) {
      throw new Error('Failed to parse HTML');
    }
    
    // Find all betting code entries
    const codeElements = doc.querySelectorAll('.bet-code-item, .code-item, [class*="code"], [data-code]');
    console.log('Found', codeElements.length, 'potential code elements');
    
    const scrapedCodes: ScrapedCode[] = [];
    
    // Try multiple selectors to find codes and times
    const allDivs = doc.querySelectorAll('div, span, p, li');
    console.log('Scanning', allDivs.length, 'elements for BWD codes...');
    
    for (const element of allDivs) {
      const text = element.textContent?.trim() || '';
      
      // Look for BWD codes
      const bwdMatch = text.match(/BWD[A-Z0-9]+/gi);
      if (bwdMatch) {
        for (const code of bwdMatch) {
          console.log('Found BWD code:', code);
          
          // Try to find time information in the same element or nearby
          let timeText = '';
          let minutesAgo = 0;
          
          // Check current element and parent elements for time info
          let currentElement = element;
          for (let i = 0; i < 3 && currentElement; i++) {
            const elementText = currentElement.textContent?.trim() || '';
            const timeMatch = elementText.match(/(\d+)\s*(minute|min|hour|hr|day|second|sec)s?\s*ago/i);
            if (timeMatch) {
              timeText = timeMatch[0];
              minutesAgo = parseTimeText(timeText);
              break;
            }
            currentElement = currentElement.parentElement;
          }
          
          // Also check next siblings
          let sibling = element.nextElementSibling;
          let siblingChecks = 0;
          while (sibling && siblingChecks < 3) {
            const siblingText = sibling.textContent?.trim() || '';
            const timeMatch = siblingText.match(/(\d+)\s*(minute|min|hour|hr|day|second|sec)s?\s*ago/i);
            if (timeMatch) {
              timeText = timeMatch[0];
              minutesAgo = parseTimeText(timeText);
              break;
            }
            sibling = sibling.nextElementSibling;
            siblingChecks++;
          }
          
          scrapedCodes.push({
            code: code.toUpperCase(),
            addedTimeText: timeText || 'unknown',
            addedMinutesAgo: minutesAgo
          });
        }
      }
    }
    
    console.log('Found', scrapedCodes.length, 'BWD codes total');
    
    // Filter for codes added within the last 30 minutes
    const recentCodes = scrapedCodes.filter(item => item.addedMinutesAgo <= 30);
    console.log('Found', recentCodes.length, 'codes added within last 30 minutes');
    
    if (recentCodes.length === 0) {
      console.log('No recent BWD codes found');
      return {
        success: true,
        message: 'No recent BWD codes found',
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
    
    // Get system seller ID from secret
    const systemSellerId = Deno.env.get('SYSTEM_SELLER_ID');
    if (!systemSellerId) {
      throw new Error('SYSTEM_SELLER_ID secret not configured');
    }
    
    console.log('Using system seller ID:', systemSellerId);
    
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    
    const kickoffTime = getKickoffTime();
    console.log('Using kickoff time:', kickoffTime);
    
    for (const codeItem of recentCodes) {
      const { code, addedTimeText } = codeItem;
      
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
        
        // Insert new ticket
        const ticketData = {
          title: `Betway Free Code: ${code}`,
          description: `Free Betway code from convertbetcodes.com. Added ${addedTimeText}. Kickoff time set to 8 hours from scrape time.`,
          seller_id: systemSellerId,
          price: 0,
          is_free: true,
          betting_site: 'Betway',
          kickoff_time: kickoffTime,
          is_hidden: false,
          is_expired: false,
          ticket_code: code
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
      totalFound: scrapedCodes.length,
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