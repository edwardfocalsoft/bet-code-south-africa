
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
                content: imageData.split(',')[1], // Remove data:image/png;base64, prefix
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
        JSON.stringify({ error: 'OCR processing failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const visionData = await visionResponse.json();
    console.log('Vision API response:', visionData);

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
    console.log('Full detected text:', fullText);

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
  
  // Clean up the text and split into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (const line of lines) {
    // Look for alphanumeric sequences that could be ticket codes
    // Updated patterns to be more flexible for handwritten text
    const patterns = [
      /\b[A-Za-z0-9]{4,20}\b/g, // Basic alphanumeric 4-20 chars
      /\b[A-Z]{1,3}[0-9]{3,10}\b/g, // Letters followed by numbers
      /\b[0-9]{3,10}[A-Z]{1,3}\b/g, // Numbers followed by letters
      /\b[A-Z0-9]{6,15}\b/g, // Mixed uppercase and numbers
    ];
    
    for (const pattern of patterns) {
      const matches = line.match(pattern);
      if (matches) {
        for (const match of matches) {
          const cleanCode = match.toUpperCase().trim();
          // Filter out codes that are too short or too long
          if (cleanCode.length >= 4 && cleanCode.length <= 20) {
            // Check if it contains both letters and numbers (typical ticket code pattern)
            const hasLetters = /[A-Z]/.test(cleanCode);
            const hasNumbers = /[0-9]/.test(cleanCode);
            
            if (hasLetters && hasNumbers) {
              codes.push(cleanCode);
            } else if (cleanCode.length >= 6) {
              // Include longer codes even if they're all numbers or all letters
              codes.push(cleanCode);
            }
          }
        }
      }
    }
  }
  
  // Remove duplicates and return
  return [...new Set(codes)];
}
