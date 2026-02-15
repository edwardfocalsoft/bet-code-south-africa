import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fetch upcoming fixtures from API-Football
async function fetchFixtures(rapidApiKey: string, leagues?: string[], days = 3): Promise<any[]> {
  const today = new Date();
  const from = today.toISOString().split("T")[0];
  const toDate = new Date(today);
  toDate.setDate(toDate.getDate() + days);
  const to = toDate.toISOString().split("T")[0];

  const baseUrl = "https://v3.football.api-sports.io/fixtures";
  const url = `${baseUrl}?from=${from}&to=${to}&status=NS&timezone=Africa/Johannesburg`;
  
  console.log("Fetching fixtures:", url);

  const resp = await fetch(url, {
    headers: {
      "x-apisports-key": rapidApiKey,
    },
  });

  if (!resp.ok) {
    const t = await resp.text();
    console.error("API-Football error:", resp.status, t);
    throw new Error(`API-Football error: ${resp.status}`);
  }

  const data = await resp.json();
  const fixtures = data.response || [];
  console.log(`Fetched ${fixtures.length} fixtures from API-Football`);

  const allFixtures: any[] = [];
  for (const f of fixtures) {
    allFixtures.push({
      homeTeam: f.teams?.home?.name || "Unknown",
      awayTeam: f.teams?.away?.name || "Unknown",
      league: f.league?.name || "Unknown",
      country: f.league?.country || "Unknown",
      matchDate: f.fixture?.date?.split("T")[0] || from,
      kickoffTime: f.fixture?.date ? new Date(f.fixture.date).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" }) : "TBD",
      fixtureId: f.fixture?.id,
    });
  }

  return allFixtures;
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
    const { query, mode, legs, safeOnly, leagues, goalFilter, cornerFilter } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    
    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    if (!RAPIDAPI_KEY) throw new Error("RAPIDAPI_KEY is not configured");

    // Step 1: Fetch REAL upcoming fixtures from API-Football
    let fixtures = await fetchFixtures(RAPIDAPI_KEY, leagues, 7);
    
    // Filter by selected leagues
    if (leagues && leagues.length > 0) {
      fixtures = filterByLeagues(fixtures, leagues);
    }

    // Limit fixtures to send to AI (avoid token limits)
    const maxFixtures = mode === "auto_pick" ? Math.min(fixtures.length, 150) : Math.min(fixtures.length, 100);
    const fixtureSubset = fixtures.slice(0, maxFixtures);

    if (fixtureSubset.length === 0) {
      return new Response(JSON.stringify({
        predictions: [],
        advice: "No upcoming fixtures found for the selected filters. Try selecting different leagues or removing filters.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`Sending ${fixtureSubset.length} fixtures to Gemini for analysis`);

    // Step 2: Send real fixtures to Gemini for AI analysis
    const today = new Date().toISOString().split("T")[0];
    const fixturesJson = JSON.stringify(fixtureSubset);

    const systemPrompt = `You are the BetCode Oracle — an elite AI football analyst powered by deep knowledge of football teams, leagues, and historical performance.

TODAY IS: ${today}

You have been given REAL upcoming fixtures from a live football API. These are ACTUAL scheduled matches. Your job is to analyze each match using your knowledge of the teams' recent form, historical head-to-head records, league standings, and playing styles.

CRITICAL RULES:
- ONLY analyze the fixtures provided — do NOT invent or add matches
- Use the EXACT team names, league names, dates, and kickoff times from the fixture data
- Provide realistic, data-driven predictions based on your knowledge
- Never show sources or citations
- Include predicted score, win/draw/loss percentages, and a likeliness label

${safeOnly ? "SAFE MODE: Only return predictions with 70%+ confidence (Very High or High likeliness). Skip uncertain matches entirely." : ""}
${goalFilter && goalFilter !== "any" ? `GOAL FILTER: Only include matches likely to have ${goalFilter}.` : ""}
${cornerFilter && cornerFilter !== "any" ? `CORNER FILTER: Only include matches likely to have ${cornerFilter}.` : ""}
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
