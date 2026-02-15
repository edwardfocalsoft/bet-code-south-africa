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

  const startDate = dateFrom ? new Date(dateFrom) : today;
  const endDate = dateTo ? new Date(dateTo) : new Date(today);
  if (!dateTo) endDate.setDate(endDate.getDate() + 2);

  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysToFetch = Math.min(diffDays, 7);

  for (let d = 0; d < daysToFetch; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    const url = `${baseUrl}/${dateStr}`;

    try {
      const resp = await fetch(url, {
        headers: {
          "x-rapidapi-host": "sportapi7.p.rapidapi.com",
          "x-rapidapi-key": rapidApiKey,
        },
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      for (const e of (data.events || [])) {
        if (e.status?.type === "notstarted") allFixtures.push(e);
      }
    } catch { continue; }
  }

  return allFixtures.map(e => {
    const ts = e.startTimestamp;
    return {
      homeTeam: e.homeTeam?.name || "Unknown",
      awayTeam: e.awayTeam?.name || "Unknown",
      league: e.tournament?.name || "Unknown",
      country: e.tournament?.category?.name || "Unknown",
      matchDate: ts ? new Date(ts * 1000).toISOString().split("T")[0] : "",
      kickoffTime: ts ? new Date(ts * 1000).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" }) : "TBD",
      fixtureId: e.id,
    };
  });
}

function filterByLeagues(fixtures: any[], leagues?: string[]): any[] {
  if (!leagues || leagues.length === 0) return fixtures;
  const lowerLeagues = leagues.map(l => l.toLowerCase());
  return fixtures.filter(f => {
    const name = (f.league || "").toLowerCase();
    const country = (f.country || "").toLowerCase();
    return lowerLeagues.some(l => name.includes(l) || l.includes(name) || country.includes(l));
  });
}

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { query, mode, legs, safeOnly, leagues, goalFilter, cornerFilter, bttsFilter, doubleChanceFilter, dateFrom, dateTo, imageBase64 } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date().toISOString().split("T")[0];
    const filterInstructions = buildFilterInstructions(goalFilter, cornerFilter, bttsFilter, doubleChanceFilter);
    const numLegs = legs || 5;

    // ===== IMAGE MODE =====
    if (mode === "image" && imageBase64) {
      console.log("Image mode: analyzing uploaded image");

      const imageSystemPrompt = `You are the BetCode Oracle — an elite AI football analyst.

TODAY IS: ${today}

The user has uploaded a screenshot/picture showing football matches. Your job:
1. READ and IDENTIFY all the teams, leagues, dates, and kickoff times visible in the image.
2. EXCLUDE any games that have ALREADY been played. Only predict UPCOMING matches that have NOT kicked off yet. If a match date/time is in the past relative to today (${today}), skip it entirely.
3. DETERMINE the game type for each remaining match: Is it a league match, cup match (FA Cup, Champions League, Europa League, etc.), international friendly, qualifier, or other? This is CRITICAL for your analysis.
4. ANALYZE each match using your deep knowledge of:
   - How teams perform differently in league vs cup vs friendly matches
   - Teams that raise their game in knockout/cup competitions
   - Teams that rotate squads for friendlies or less important matches
   - Historical performance in specific competitions (e.g., teams with strong Champions League records)
   - Home/away form in different competition types
4. PROVIDE clear, confident predictions with reasoning that explains the game type context.

GAME TYPE AWARENESS:
- CUP MATCHES: Teams often play more cautiously, fewer goals, upsets more common. Consider the round (early vs final).
- CHAMPIONS LEAGUE: Elite teams raise performance, home advantage is amplified. Group stage vs knockout matters.
- LEAGUE MATCHES: Most predictable, form and table position matter most.
- FRIENDLIES: Experimental lineups, results less predictable, often more goals.
- QUALIFIERS: National pride factor, underdogs can surprise, consider travel fatigue.

${safeOnly ? "SAFE MODE: Prefer predictions with 70%+ confidence." : ""}
${filterInstructions}

IMPORTANT: 
- EXCLUDE any matches that have already been played (past dates/times relative to ${today}).
- Only predict UPCOMING matches that haven't started yet.
- Extract all visible upcoming matches, then provide predictions for them (or up to ${numLegs} if there are many).

${RESPONSE_FORMAT}`;

      const messages: any[] = [
        { role: "system", content: imageSystemPrompt },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageBase64 },
            },
            {
              type: "text",
              text: `Analyze ONLY upcoming (not yet played) games visible in this image. Today is ${today}. Skip any matches already played. Identify each match, determine the game type (league/cup/friendly/qualifier), and provide detailed predictions. ${query || ""}`
            },
          ],
        },
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("AI gateway error (image):", response.status, t);
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
        console.error("Failed to parse AI image response:", content);
        parsed = { predictions: [], advice: "Failed to parse predictions from image. Please try a clearer image." };
      }

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== AUTO PICK MODE =====
    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    if (!RAPIDAPI_KEY) throw new Error("RAPIDAPI_KEY is not configured");

    let fixtures = await fetchFixtures(RAPIDAPI_KEY, dateFrom, dateTo);
    if (leagues && leagues.length > 0) fixtures = filterByLeagues(fixtures, leagues);

    const fixtureSubset = fixtures.slice(0, 150);

    if (fixtureSubset.length === 0) {
      return new Response(JSON.stringify({
        predictions: [],
        advice: "No upcoming fixtures found. Try different leagues or expand the date range.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`Sending ${fixtureSubset.length} fixtures to Gemini`);

    const systemPrompt = `You are the BetCode Oracle — an elite AI football analyst.

TODAY IS: ${today}

You have REAL upcoming fixtures from a live API. Analyze each match using your knowledge of teams' form, head-to-head, league standings, and playing styles.

GAME TYPE AWARENESS (CRITICAL):
- Identify whether each match is a league match, cup match, Champions League, Europa League, friendly, or qualifier
- Cup/knockout matches: teams play more cautiously, upsets more common
- Champions League: elite teams raise performance, home advantage amplified
- League matches: most predictable, form matters most
- Friendlies: experimental lineups, less predictable

RULES:
- ONLY analyze fixtures provided — do NOT invent matches
- Use EXACT team names, leagues, dates, kickoff times from the data
- Never show sources or citations
- Include game type context in your reasoning

${safeOnly ? "SAFE MODE: Prefer 70%+ confidence predictions." : ""}
${filterInstructions}

LEGS REQUIREMENT (STRICT): Return EXACTLY ${numLegs} predictions — no more, no less.

Pick ${numLegs} matches with the HIGHEST winning probability matching ALL active filters.

${RESPONSE_FORMAT}`;

    const userMessage = `Pick EXACTLY ${numLegs} safest bets from these fixtures:\n\n${JSON.stringify(fixtureSubset)}\n\n${query || ""}`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
