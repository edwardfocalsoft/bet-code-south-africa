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
  // Normalize text
  const cleanText = (timeText || '').trim().toLowerCase();

  if (!cleanText) return 999;

  // Handle common phrases
  if (/(just\s*now|now)/i.test(cleanText)) {
    return 0;
  }

  // Accept short and long units: minute/min/m, hour/hr/h, day/d, second/sec/s
  const matches = cleanText.match(/(\d+)\s*(minute|min|m|hour|hr|h|day|d|second|sec|s)/);
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
    
// Robust code discovery: regex over raw HTML first, then DOM fallback
const scrapedCodes: ScrapedCode[] = [];
const foundSet = new Set<string>();

// 1) Regex scan on raw HTML (handles pages rendered with simple templating)
const normalizedHtml = html.toUpperCase();
// Betway codes typically start with 'B', include at least one digit, 6-12 chars total
const codeRegex = /\bB(?=[A-Z0-9]*\d)[A-Z0-9]{5,12}\b/g;
const timeWindow = 220;

const htmlMatches = [...normalizedHtml.matchAll(codeRegex)];
console.log('Regex scan found', htmlMatches.length, 'potential Betway codes in HTML');

for (const match of htmlMatches) {
  const code = match[0];
  if (foundSet.has(code)) continue;

  const idx = match.index ?? 0;
  const start = Math.max(0, idx - timeWindow);
  const end = Math.min(normalizedHtml.length, idx + timeWindow);
  const windowText = normalizedHtml.slice(start, end);

  // Look for nearby time context
  let timeText = '';
  let minutesAgo = 999;
  const timeMatch =
    windowText.match(/(\d+)\s*(MINUTE|MIN|M|HOUR|HR|H|DAY|D|SECOND|SEC|S)\s*(?:AGO)?/) ||
    windowText.match(/JUST\s*NOW|NOW/);

  if (timeMatch) {
    timeText = Array.isArray(timeMatch) ? (timeMatch[0] as string) : 'now';
    minutesAgo = parseTimeText(timeText);
  }

  scrapedCodes.push({
    code,
    addedTimeText: timeText || 'unknown',
    addedMinutesAgo: minutesAgo,
  });
  foundSet.add(code);
}

// 2) DOM fallback if regex scan found nothing
if (scrapedCodes.length === 0) {
  const allNodes = doc.querySelectorAll('div, span, p, li');
  console.log('DOM scan over', allNodes.length, 'elements');

  for (const element of allNodes) {
    const text = (element.textContent || '').toUpperCase().trim();
    const matches = text.match(codeRegex);
    if (!matches) continue;

    for (const matchCode of matches) {
      if (foundSet.has(matchCode)) continue;

      let timeText = '';
      let minutesAgo = 999;

      // Check current element and up to 3 parents for time info
      let currentElement: any = element;
      for (let i = 0; i < 3 && currentElement; i++) {
        const t = (currentElement.textContent || '').toUpperCase();
        const tm = t.match(/(\d+)\s*(MINUTE|MIN|M|HOUR|HR|H|DAY|D|SECOND|SEC|S)\s*(?:AGO)?|JUST\s*NOW|NOW/);
        if (tm) {
          timeText = Array.isArray(tm) ? (tm[0] as string) : 'now';
          minutesAgo = parseTimeText(timeText);
          break;
        }
        currentElement = currentElement.parentElement;
      }

      // Also check up to 3 next siblings
      if (minutesAgo === 999) {
        let sibling: any = (element as any).nextElementSibling;
        let checks = 0;
        while (sibling && checks < 3) {
          const st = (sibling.textContent || '').toUpperCase();
          const tm = st.match(/(\d+)\s*(MINUTE|MIN|M|HOUR|HR|H|DAY|D|SECOND|SEC|S)\s*(?:AGO)?|JUST\s*NOW|NOW/);
          if (tm) {
            timeText = Array.isArray(tm) ? (tm[0] as string) : 'now';
            minutesAgo = parseTimeText(timeText);
            break;
          }
          sibling = sibling.nextElementSibling;
          checks++;
        }
      }

      scrapedCodes.push({
        code: matchCode,
        addedTimeText: timeText || 'unknown',
        addedMinutesAgo: minutesAgo,
      });
      foundSet.add(matchCode);
    }
  }
}

console.log('Found', scrapedCodes.length, 'Betway-like codes total');

    
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