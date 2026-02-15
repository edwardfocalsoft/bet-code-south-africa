import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fetch upcoming fixtures from SofaScore API (sportapi7)
async function fetchFixtures(rapidApiKey: string, dateFrom?: string, dateTo?: string): Promise<any[]> {
  const today = new Date();
  const allFixtures: any[] = [];
  const baseUrl = "https://sportapi7.p.rapidapi.com/api/v1/sport/football/scheduled-events";

  // Determine date range
  const startDate = dateFrom ? new Date(dateFrom) : today;
  const endDate = dateTo ? new Date(dateTo) : new Date(today);
  if (!dateTo) endDate.setDate(endDate.getDate() + 2); // default: today + 2 days

  // Clamp to max 7 days
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysToFetch = Math.min(diffDays, 7);

  for (let d = 0; d < daysToFetch; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    
    const url = `${baseUrl}/${dateStr}`;
    console.log(`Fetching fixtures for ${dateStr}:`, url);

    try {
      const resp = await fetch(url, {
        headers: {
          "x-rapidapi-host": "sportapi7.p.rapidapi.com",
          "x-rapidapi-key": rapidApiKey,
        },
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.error(`SofaScore API error for ${dateStr}:`, resp.status, t);
        continue;
      }

      const data = await resp.json();
      const events = data.events || [];
      console.log(`${dateStr}: ${events.length} events found`);

      for (const e of events) {
        // Only include not-started matches
        const statusType = e.status?.type;
        if (statusType === "notstarted") {
          allFixtures.push(e);
        }
      }
    } catch (err) {
      console.error(`Error fetching ${dateStr}:`, err);
      continue;
    }
  }

  console.log(`Total upcoming fixtures: ${allFixtures.length}`);

  // Map SofaScore format to our standard format
  const mapped: any[] = [];
  for (const e of allFixtures) {
    const startTimestamp = e.startTimestamp;
    const matchDate = startTimestamp
      ? new Date(startTimestamp * 1000).toISOString().split("T")[0]
      : "";
    const kickoffTime = startTimestamp
      ? new Date(startTimestamp * 1000).toLocaleTimeString("en-ZA", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Africa/Johannesburg",
        })
      : "TBD";

    mapped.push({
      homeTeam: e.homeTeam?.name || e.homeTeam?.shortName || "Unknown",
      awayTeam: e.awayTeam?.name || e.awayTeam?.shortName || "Unknown",
      league: e.tournament?.name || "Unknown",
      country: e.tournament?.category?.name || "Unknown",
      matchDate,
      kickoffTime,
      fixtureId: e.id,
    });
  }

  return mapped;
}

// Filter fixtures by league names if specified
function filterByLeagues(fixtures: any[], leagues?: string[]): any[] {
  if (!leagues || leagues.length === 0) return fixtures;
  const lowerLeagues = leagues.map(l => l.toLowerCase());
  return fixtures.filter(f => {
    const name = (f.league || "").toLowerCase();
    const country = (f.country || "").toLowerCase();
    return lowerLeagues.some(l => name.includes(l) || l.includes(name) || country.includes(l));
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, mode, legs, safeOnly, leagues, goalFilter, cornerFilter, bttsFilter, doubleChanceFilter, dateFrom, dateTo } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    
    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    if (!RAPIDAPI_KEY) throw new Error("RAPIDAPI_KEY is not configured");

    // Step 1: Fetch REAL upcoming fixtures from SofaScore
    let fixtures = await fetchFixtures(RAPIDAPI_KEY, dateFrom, dateTo);
    
    if (leagues && leagues.length > 0) {
      fixtures = filterByLeagues(fixtures, leagues);
    }

    const maxFixtures = mode === "auto_pick" ? Math.min(fixtures.length, 150) : Math.min(fixtures.length, 100);
    const fixtureSubset = fixtures.slice(0, maxFixtures);

    if (fixtureSubset.length === 0) {
      return new Response(JSON.stringify({
        predictions: [],
        advice: "No upcoming fixtures found for the selected filters. Try selecting different leagues, removing filters, or expanding the date range.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`Sending ${fixtureSubset.length} fixtures to Gemini for analysis`);

    const today = new Date().toISOString().split("T")[0];
    const fixturesJson = JSON.stringify(fixtureSubset);

    // Build filter instructions
    let filterInstructions = "";
    if (goalFilter && goalFilter !== "any") {
      filterInstructions += `\nGOAL PREFERENCE: Prioritize and highlight matches likely to have ${goalFilter}. Include the expectedGoals value for all matches. You MUST still return matches even if not all perfectly match this filter — rank them by how likely they are to meet this criteria, with the best matches first.`;
    }
    if (cornerFilter && cornerFilter !== "any") {
      filterInstructions += `\nCORNER PREFERENCE: Prioritize and highlight matches likely to have ${cornerFilter}. Include the expectedCorners value for all matches. You MUST still return matches even if not all perfectly match this filter — rank them by how likely they are to meet this criteria, with the best matches first.`;
    }
    if (bttsFilter && bttsFilter !== "any") {
      filterInstructions += `\nBTTS PREFERENCE: Prioritize matches where both teams to score is likely "${bttsFilter === "btts yes" ? "Yes" : "No"}". Rank matches by how likely they are to have ${bttsFilter === "btts yes" ? "both teams scoring" : "at least one team keeping a clean sheet"}.`;
    }
    if (doubleChanceFilter && doubleChanceFilter !== "any") {
      const dcMap: Record<string, string> = { "1X": "Home Win or Draw", "X2": "Draw or Away Win", "12": "Home Win or Away Win (no draw)" };
      filterInstructions += `\nDOUBLE CHANCE PREFERENCE: Prioritize matches where the most likely outcome is ${dcMap[doubleChanceFilter] || doubleChanceFilter}. Rank matches by how well they fit this double chance market.`;
    }

    const systemPrompt = `You are the BetCode Oracle — an elite AI football analyst powered by deep knowledge of football teams, leagues, and historical performance.

TODAY IS: ${today}

You have been given REAL upcoming fixtures from a live football API. These are ACTUAL scheduled matches. Your job is to analyze each match using your knowledge of the teams' recent form, historical head-to-head records, league standings, and playing styles.

CRITICAL RULES:
- ONLY analyze the fixtures provided — do NOT invent or add matches
- Use the EXACT team names, league names, dates, and kickoff times from the fixture data
- Provide realistic, data-driven predictions based on your knowledge
- Never show sources or citations
- Include predicted score, win/draw/loss percentages, and a likeliness label
- You MUST ALWAYS return at least some predictions — never return an empty array

${safeOnly ? "SAFE MODE: Prefer predictions with 70%+ confidence (Very High or High likeliness). Prioritize safe picks but still return results." : ""}
${filterInstructions}
${mode === "auto_pick" ? `AUTO PICK MODE: From the fixtures provided, select exactly ${legs || 5} matches with the HIGHEST winning probability. Pick the safest, most obvious outcomes. Be specific about which team to back and why.` : ""}

Response MUST be valid JSON with this exact structure (no markdown, no code blocks):
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
      "reasoning": "Brief analysis"
    }
  ],
  "advice": "Overall betting advice summary"
}`;

    const userMessage = mode === "auto_pick"
      ? `Here are the real upcoming fixtures. Pick the ${legs || 5} safest bets:\n\n${fixturesJson}\n\n${query || ""}`
      : `Here are real upcoming fixtures. Analyze them and provide predictions:\n\n${fixturesJson}\n\n${query || "Provide predictions for the most interesting matches."}`;

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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      parsed = { predictions: [], advice: "Failed to parse predictions. Please try again." };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Oracle error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
