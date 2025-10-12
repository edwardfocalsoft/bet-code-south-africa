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
    
    // Sources to scrape
    const sources = [
      {
        name: 'ConvertBetCodes',
        url: 'https://convertbetcodes.com/c/free-bet-codes-for-today/Betway'
      },
      {
        name: 'Facebook Group',
        url: 'https://web.facebook.com/groups/424775676342670'
      },
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
          
          // Look for betting code elements - they contain "#BW" followed by code
          const codeElements = doc.querySelectorAll('[class*="booking"], [class*="code"], div, span, p');
          
          for (const element of codeElements) {
            const text = (element.textContent || '').trim();
            
            // Match the booking code pattern (we'll remove the # prefix)
            const codeMatch = text.match(/#(BW[A-Z0-9]{8})\b/i);
            if (!codeMatch) continue;
            
            const code = codeMatch[1].toUpperCase();
            if (foundSet.has(code)) continue;
            
            // Try to find the parent container with all the details
            let currentElement: any = element;
            let odds: number | undefined;
            let events: number | undefined;
            
            // Search up to 5 parents and siblings for odds and outcomes
            for (let i = 0; i < 5 && currentElement; i++) {
              const containerText = (currentElement.textContent || '').toUpperCase();
              
              // Extract Outcomes (number of legs)
              if (!events) {
                const outcomesMatch = containerText.match(/OUTCOMES?[:\s]*(\d+)/);
                if (outcomesMatch) {
                  events = parseInt(outcomesMatch[1]);
                }
              }
              
              // Extract Odds
              if (!odds) {
                const oddsMatch = containerText.match(/ODDS?[:\s]*(\d+(?:\.\d+)?)/);
                if (oddsMatch) {
                  odds = parseFloat(oddsMatch[1]);
                }
              }
              
              currentElement = currentElement.parentElement;
            }
            
            // Also check siblings
            let sibling: any = (element as any).nextElementSibling;
            let siblingChecks = 0;
            while (sibling && siblingChecks < 5 && (!events || !odds)) {
              const siblingText = (sibling.textContent || '').toUpperCase();
              
              if (!events) {
                const outcomesMatch = siblingText.match(/OUTCOMES?[:\s]*(\d+)/);
                if (outcomesMatch) events = parseInt(outcomesMatch[1]);
              }
              
              if (!odds) {
                const oddsMatch = siblingText.match(/ODDS?[:\s]*(\d+(?:\.\d+)?)/);
                if (oddsMatch) odds = parseFloat(oddsMatch[1]);
              }
              
              sibling = sibling.nextElementSibling;
              siblingChecks++;
            }
            
            console.log(`Found code ${code} with ${events || '?'} outcomes and odds ${odds || '?'}`);
            
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
          
          console.log(`Betway Book-a-Bet Results: found ${allScrapedCodes.length} codes`);
          continue; // Skip the regular regex/DOM scanning for this source
        }

        // 1) Regex scan on raw HTML (handles pages rendered with simple templating)
        const normalizedHtml = html.toUpperCase();
        // Look for BW codes that are exactly 10 characters long (BW + 8 characters)
        const codeRegex = /\bBW[A-Z0-9]{8}\b/g;
        const timeWindow = 1200; // Larger window for Facebook posts

        const htmlMatches = [...normalizedHtml.matchAll(codeRegex)];
        console.log(`${source.name} regex scan found`, htmlMatches.length, 'potential Betway codes in HTML');

        for (const match of htmlMatches) {
          const code = match[0];
          if (foundSet.has(code)) continue;

          const idx = match.index ?? 0;
          const start = Math.max(0, idx - timeWindow);
          const end = Math.min(normalizedHtml.length, idx + timeWindow);
          const windowText = normalizedHtml.slice(start, end);

          // Look for nearby time context, events, and odds
          let timeText = '';
          let minutesAgo = 999;
          let events: number | undefined;
          let odds: number | undefined;
          
          const timeMatch =
            windowText.match(/(\d+)\s*(MINUTE|MIN|M|HOUR|HR|H|DAY|D|SECOND|SEC|S)\s*(?:AGO)?/) ||
            windowText.match(/(\d+)(M|H|D|S)(?:\s|$)/) || // Facebook format
            windowText.match(/JUST\s*NOW|NOW/);

          if (timeMatch) {
            timeText = Array.isArray(timeMatch) ? (timeMatch[0] as string) : 'now';
            minutesAgo = parseTimeText(timeText);
          }

          // Extract events and odds from the context - improved patterns
          // Extract events/legs/selections/games near the code
          let eventsMatch = windowText.match(/(\d+)\s*(EVENTS?|LEGS?|SELECTIONS?|MATCHES?|GAMES?)/);
          if (!eventsMatch) {
            eventsMatch = windowText.match(/(EVENTS?|LEGS?|SELECTIONS?|MATCHES?|GAMES?)[:\s]*?(\d+)/);
          }
          if (eventsMatch) {
            const val = eventsMatch[1] && /^\d+$/.test(eventsMatch[1]) ? eventsMatch[1] : eventsMatch[2];
            if (val && !isNaN(parseInt(val))) events = parseInt(val);
          }

          // Extract odds including formats like "ODDS: 5.2", "TOTAL ODDS 5.2", or "@5.2"
          const oddsMatch = windowText.match(/TOTAL\s*ODDS[:\s]*?(\d+(?:\.\d+)?)/) ||
                            windowText.match(/ODDS[:\s]*?(\d+(?:\.\d+)?)/) ||
                            windowText.match(/@(\d+(?:\.\d+)?)/) ||
                            windowText.match(/(\d+(?:\.\d+)?)\s*ODDS?/);
          if (oddsMatch && !isNaN(parseFloat(oddsMatch[1]))) {
            odds = parseFloat(oddsMatch[1]);
          }

          allScrapedCodes.push({
            code,
            addedTimeText: timeText || 'unknown',
            addedMinutesAgo: minutesAgo,
            events,
            odds,
          });
          foundSet.add(code);
        }

        // 2) DOM fallback if no codes found in regex scan
        if (htmlMatches.length === 0) {
          console.log(`${source.name} - trying DOM scan...`);
          const allNodes = doc.querySelectorAll('div, span, p, li, article');
          console.log(`${source.name} DOM scan over`, allNodes.length, 'elements');

  for (const element of allNodes) {
    const text = (element.textContent || '').toUpperCase().trim();
    const matches = text.match(codeRegex);
    if (!matches) continue;

    for (const matchCode of matches) {
      if (foundSet.has(matchCode)) continue;

      let timeText = '';
      let minutesAgo = 999;
      let events: number | undefined;
      let odds: number | undefined;

      // Check current element and up to 3 parents for time info, events, and odds
      let currentElement: any = element;
      for (let i = 0; i < 3 && currentElement; i++) {
        const t = (currentElement.textContent || '').toUpperCase();
        const tm = t.match(/(\d+)\s*(MINUTE|MIN|M|HOUR|HR|H|DAY|D|SECOND|SEC|S)\s*(?:AGO)?|JUST\s*NOW|NOW/);
        if (tm) {
          timeText = Array.isArray(tm) ? (tm[0] as string) : 'now';
          minutesAgo = parseTimeText(timeText);
        }
        
        // Extract events and odds - broadened patterns
        if (!events) {
          let em = t.match(/(\d+)\s*(EVENTS?|LEGS?|SELECTIONS?|MATCHES?|GAMES?)/) ||
                   t.match(/(EVENTS?|LEGS?|SELECTIONS?|MATCHES?|GAMES?)[:\s]*?(\d+)/);
          if (em) {
            const val = em[1] && /^\d+$/.test(em[1]) ? em[1] : em[2];
            if (val) events = parseInt(val);
          }
        }

        if (!odds) {
          const om = t.match(/TOTAL\s*ODDS[:\s]*?(\d+(?:\.\d+)?)/) ||
                     t.match(/ODDS[:\s]*?(\d+(?:\.\d+)?)/) ||
                     t.match(/@(\d+(?:\.\d+)?)/) ||
                     t.match(/(\d+(?:\.\d+)?)\s*ODDS?/);
          if (om) odds = parseFloat(om[1]);
        }
        
        currentElement = currentElement.parentElement;
      }

      // Also check up to 3 next siblings
      if (minutesAgo === 999 || !events || !odds) {
        let sibling: any = (element as any).nextElementSibling;
        let checks = 0;
        while (sibling && checks < 3) {
          const st = (sibling.textContent || '').toUpperCase();
          
          if (minutesAgo === 999) {
            const tm = st.match(/(\d+)\s*(MINUTE|MIN|M|HOUR|HR|H|DAY|D|SECOND|SEC|S)\s*(?:AGO)?|JUST\s*NOW|NOW/);
            if (tm) {
              timeText = Array.isArray(tm) ? (tm[0] as string) : 'now';
              minutesAgo = parseTimeText(timeText);
            }
          }
          
          if (!events) {
            const em = st.match(/(\d+)\s*(EVENTS?|LEGS?|SELECTIONS?|MATCHES?|GAMES?)/) ||
                       st.match(/(EVENTS?|LEGS?|SELECTIONS?|MATCHES?|GAMES?)[:\s]*?(\d+)/);
            if (em) {
              const val = em[1] && /^\d+$/.test(em[1]) ? em[1] : em[2];
              if (val) events = parseInt(val);
            }
          }

          if (!odds) {
            const om = st.match(/TOTAL\s*ODDS[:\s]*?(\d+(?:\.\d+)?)/) || 
                       st.match(/ODDS[:\s]*?(\d+(?:\.\d+)?)/) ||
                       st.match(/@(\d+(?:\.\d+)?)/) ||
                       st.match(/(\d+(?:\.\d+)?)\s*ODDS?/);
            if (om) {
              odds = parseFloat(om[1]);
            }
          }
          
          sibling = sibling.nextElementSibling;
          checks++;
        }
      }

          allScrapedCodes.push({
            code: matchCode,
            addedTimeText: timeText || 'unknown',
            addedMinutesAgo: minutesAgo,
            events,
            odds,
          });
          foundSet.add(matchCode);
        }
      }
    }
    
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