
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    if (!googleApiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Cloud API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract base64 image data
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;

    console.log('Calling Google Vision API...');

    // Call Google Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Data,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 50,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Google Vision API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'OCR processing failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const visionData = await visionResponse.json();
    console.log('Vision API response received');

    if (!visionData.responses || !visionData.responses[0]) {
      return new Response(
        JSON.stringify({ detectedCodes: [], fullText: '' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const textAnnotations = visionData.responses[0].textAnnotations;
    
    if (!textAnnotations || textAnnotations.length === 0) {
      return new Response(
        JSON.stringify({ detectedCodes: [], fullText: '' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Full detected text
    const fullText = textAnnotations[0].description || '';
    console.log('Detected text length:', fullText.length);

    // Extract potential ticket codes
    const detectedCodes = extractTicketCodes(fullText);
    console.log('Extracted codes:', detectedCodes);

    return new Response(
      JSON.stringify({ 
        detectedCodes,
        fullText: fullText.trim(),
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OCR function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'OCR processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractTicketCodes(text: string): string[] {
  const codes: string[] = [];
  
  // Clean up the text and split into lines and words
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const words = text.split(/\s+/).map(word => word.trim()).filter(word => word.length > 0);
  
  // Combine lines and words for processing
  const allTextSegments = [...lines, ...words];
  
  for (const segment of allTextSegments) {
    // Enhanced patterns for ticket codes
    const patterns = [
      // Basic alphanumeric patterns
      /\b[A-Z0-9]{4,20}\b/g,
      /\b[A-Za-z0-9]{4,20}\b/g,
      
      // Common ticket code patterns
      /\b[A-Z]{1,4}[0-9]{3,12}\b/g,  // Letters followed by numbers (e.g., ABC123456)
      /\b[0-9]{3,12}[A-Z]{1,4}\b/g,  // Numbers followed by letters (e.g., 123456ABC)
      /\b[A-Z0-9]{6,15}\b/g,         // Mixed uppercase and numbers
      
      // Handle common OCR errors (0/O, 1/l/I confusion)
      /\b[A-Z0-9lI]{4,20}\b/g,
      
      // Sequences with possible separators that should be removed
      /\b[A-Z0-9]{2,}[-_\s]*[A-Z0-9]{2,}\b/g,
    ];
    
    for (const pattern of patterns) {
      const matches = segment.match(pattern);
      if (matches) {
        for (let match of matches) {
          // Clean the match - remove separators and normalize
          let cleanCode = match.replace(/[-_\s]/g, '').toUpperCase();
          
          // Replace common OCR confusion characters
          cleanCode = cleanCode.replace(/[lI]/g, '1');
          cleanCode = cleanCode.replace(/O/g, '0');
          
          // Validate code length and format
          if (cleanCode.length >= 4 && cleanCode.length <= 20) {
            // Must contain both letters and numbers for most ticket codes
            const hasLetters = /[A-Z]/.test(cleanCode);
            const hasNumbers = /[0-9]/.test(cleanCode);
            
            // Accept if it has both letters and numbers, or if it's longer (could be all numeric)
            if ((hasLetters && hasNumbers) || cleanCode.length >= 6) {
              // Avoid obvious non-codes (like dates, common words)
              if (!isCommonWord(cleanCode) && !isDate(cleanCode)) {
                codes.push(cleanCode);
              }
            }
          }
        }
      }
    }
  }
  
  // Remove duplicates and return
  return [...new Set(codes)];
}

function isCommonWord(code: string): boolean {
  const commonWords = [
    'TICKET', 'CODE', 'BETWAY', 'HOLLYWOODBETS', 'SUPABETS', 
    'SPORT', 'BET', 'WIN', 'DRAW', 'SOCCER', 'FOOTBALL',
    'TOTAL', 'ODDS', 'STAKE', 'RETURN', 'DATE', 'TIME'
  ];
  return commonWords.includes(code.toUpperCase());
}

function isDate(code: string): boolean {
  // Check for date-like patterns (DDMMYYYY, YYYYMMDD, etc.)
  const datePatterns = [
    /^[0-3][0-9][0-1][0-9][2][0-9][0-9][0-9]$/, // DDMMYYYY
    /^[2][0-9][0-9][0-9][0-1][0-9][0-3][0-9]$/, // YYYYMMDD
    /^[0-1][0-9][0-3][0-9][2][0-9]$/, // MMDDYY
  ];
  
  return datePatterns.some(pattern => pattern.test(code));
}
