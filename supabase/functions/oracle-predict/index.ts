import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildFilterInstructions(goalFilter?: string, cornerFilter?: string, bttsFilter?: string, doubleChanceFilter?: string): string {
  let instructions = "";
  if (goalFilter && goalFilter !== "any") {
    instructions += `\nGOAL FILTER (STRICT): You MUST ONLY include matches likely to have ${goalFilter}. Every prediction must match this. This is a hard requirement.`;
  }
  if (cornerFilter && cornerFilter !== "any") {
    instructions += `\nCORNER FILTER (STRICT): You MUST ONLY include matches likely to have ${cornerFilter}. This is a hard requirement.`;
  }
  if (bttsFilter && bttsFilter !== "any") {
    instructions += `\nBTTS FILTER (STRICT): ${bttsFilter === "btts yes" ? "Both teams must be likely to score." : "At least one team must be likely to keep a clean sheet."} This is a hard requirement.`;
  }
  if (doubleChanceFilter && doubleChanceFilter !== "any") {
    const dcMap: Record<string, string> = { "1X": "Home Win or Draw", "X2": "Draw or Away Win", "12": "Home Win or Away Win" };
    instructions += `\nDOUBLE CHANCE FILTER (STRICT): Only include matches where the likely outcome fits ${dcMap[doubleChanceFilter] || doubleChanceFilter}. This is a hard requirement.`;
  }
  return instructions;
}

const RESPONSE_FORMAT = `Response MUST be valid JSON (no markdown, no code blocks):
{
  "predictions": [
    {
      "homeTeam": "Team A",
      "awayTeam": "Team B",
      "league": "League Name",
      "matchDate": "YYYY-MM-DD",
      "kickoffTime": "HH:MM",
      "predictedScore": "2-1",
      "homeWinPct": 65,
      "drawPct": 20,
      "awayWinPct": 15,
      "likeliness": "High",
      "prediction": "Home Win",
      "expectedGoals": 3.1,
      "expectedCorners": 9.5,
      "reasoning": "Brief analysis including game type context (league/cup/friendly)"
    }
  ],
  "advice": "Overall betting advice summary"
}`;

async function fetchRealFixtures(leagues: string[] | null, dateFrom: string, dateTo: string): Promise<string> {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  if (!FIRECRAWL_API_KEY) {
    console.warn("FIRECRAWL_API_KEY not configured, falling back to AI-only mode");
    return "";
  }

  try {
    const leagueQuery = leagues && leagues.length > 0 
      ? leagues.join(" OR ") 
      : "Premier League OR La Liga OR Serie A OR Bundesliga OR Ligue 1 OR Champions League";
    
    const searchQuery = `football fixtures schedule ${leagueQuery} ${dateFrom} to ${dateTo}`;
    console.log("Firecrawl search query:", searchQuery);

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 5,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Firecrawl search error:", response.status, errText);
      return "";
    }

    const data = await response.json();
    
    if (!data.success || !data.data || data.data.length === 0) {
      console.warn("No Firecrawl results found");
      return "";
    }

    // Combine markdown content from search results
    let fixturesText = "";
    for (const result of data.data) {
      if (result.markdown) {
        fixturesText += `\n--- Source: ${result.url || "unknown"} ---\n`;
        fixturesText += result.markdown.substring(0, 3000); // Limit per source
      }
    }

    console.log(`Fetched ${data.data.length} fixture sources, total chars: ${fixturesText.length}`);
    return fixturesText.substring(0, 12000); // Total limit
  } catch (error) {
    console.error("Error fetching real fixtures:", error);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { query, mode, legs, safeOnly, leagues, goalFilter, cornerFilter, bttsFilter, doubleChanceFilter, dateFrom, dateTo, imageBase64 } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toISOString().split("T")[1].substring(0, 5); // HH:MM
    const filterInstructions = buildFilterInstructions(goalFilter, cornerFilter, bttsFilter, doubleChanceFilter);
    const numLegs = legs || 5;

    const safeThreshold = 80;
    const safeInstruction = safeOnly
      ? `SAFE MODE (STRICT): ONLY include predictions where your confidence (the highest of homeWinPct, drawPct, awayWinPct) is ${safeThreshold}% or above. Do NOT include any prediction below ${safeThreshold}% confidence.`
      : "";

    // ===== IMAGE MODE =====
    if (mode === "image" && imageBase64) {
      console.log("Image mode: analyzing uploaded image");

      const imageSystemPrompt = `You are the BetCode Oracle — an elite AI football analyst.

TODAY IS: ${today} and current time is ${currentTime} UTC.

The user uploaded a screenshot showing football matches. Your job:
1. READ and IDENTIFY all teams, leagues, dates, and kickoff times visible.
2. STRICTLY EXCLUDE any games that have ALREADY PLAYED or ALREADY STARTED. A game has started if its date is before ${today}, OR if its date is ${today} and its kickoff time is at or before ${currentTime}.
3. ONLY predict matches that have NOT YET kicked off.
4. ANALYZE each upcoming match and provide predictions.

${safeInstruction}
${filterInstructions}

IMPORTANT: Only predict UPCOMING matches that have NOT started yet. Extract all visible upcoming matches, then provide predictions for up to ${numLegs}.

${RESPONSE_FORMAT}`;

      const messages: any[] = [
        { role: "system", content: imageSystemPrompt },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageBase64 } },
            { type: "text", text: `Analyze ONLY upcoming games visible in this image. Today is ${today}. ${query || ""}` },
          ],
        },
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("AI gateway error (image):", response.status, t);
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "AI service payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      let parsed;
      try {
        parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
      } catch {
        console.error("Failed to parse AI image response:", content);
        parsed = { predictions: [], advice: "Failed to parse predictions from image." };
      }

      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ===== AUTO PICK MODE — scrape real fixtures, then AI analyzes =====
    const effectiveDateFrom = dateFrom || today;
    const effectiveDateTo = dateTo || new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

    console.log(`Auto pick: fetching real fixtures from ${effectiveDateFrom} to ${effectiveDateTo}`);
    const realFixtures = await fetchRealFixtures(leagues, effectiveDateFrom, effectiveDateTo);

    const leagueInstruction = leagues && leagues.length > 0
      ? `LEAGUE FILTER (STRICT): ONLY include matches from: ${leagues.join(", ")}.`
      : "You may pick matches from any major football league.";

    const fixturesContext = realFixtures
      ? `\n\nBELOW IS REAL FIXTURE DATA SCRAPED FROM THE WEB. You MUST use ONLY these real matches for your predictions. Do NOT invent or fabricate any fixtures. If a match appears in the data below, use the exact team names, dates, and kickoff times shown.\n\n--- REAL FIXTURE DATA ---\n${realFixtures}\n--- END FIXTURE DATA ---\n\nIMPORTANT: Only predict matches that appear in the fixture data above. Use the exact team names and dates from the data. Do NOT make up matches.`
      : "\n\nNote: Could not fetch live fixture data. Use your best knowledge of currently scheduled real matches. Be as accurate as possible with team names, dates, and kickoff times.";

    const systemPrompt = `You are the BetCode Oracle — an elite AI football analyst.

TODAY IS: ${today}

Your task: Analyze REAL upcoming football fixtures and provide expert predictions.
${fixturesContext}

${leagueInstruction}
DATE RANGE: Only matches between ${effectiveDateFrom} and ${effectiveDateTo}.

CRITICAL RULES:
1. ONLY predict matches from the real fixture data provided above. Do NOT invent fixtures.
2. Use EXACT team names, league names, dates and kickoff times from the data.
3. Base predictions on team form, historical data, home/away records, and tactical analysis.

${safeInstruction}
${filterInstructions}

LEGS REQUIREMENT (STRICT): Return EXACTLY ${numLegs} predictions — no more, no less. Pick the ${numLegs} matches where you have the HIGHEST confidence.

${RESPONSE_FORMAT}`;

    const userMessage = `From the real fixture data provided, select EXACTLY ${numLegs} upcoming football matches and provide your best predictions.${safeOnly ? ` Only include predictions with ${safeThreshold}%+ confidence.` : ""}${query ? `\n\nAdditional: ${query}` : ""}`;

    console.log(`Auto pick mode: AI analyzing real fixtures for ${numLegs} predictions`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI service payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      parsed = { predictions: [], advice: "Failed to parse predictions. Please try again." };
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Oracle error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
