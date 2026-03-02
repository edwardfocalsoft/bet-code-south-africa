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

    const safeThreshold = 80;
    const safeInstruction = safeOnly
      ? `SAFE MODE (STRICT): ONLY include predictions where your confidence (the highest of homeWinPct, drawPct, awayWinPct) is ${safeThreshold}% or above. Do NOT include any prediction below ${safeThreshold}% confidence.`
      : "";

    // ===== IMAGE MODE =====
    if (mode === "image" && imageBase64) {
      console.log("Image mode: analyzing uploaded image");

      const imageSystemPrompt = `You are the BetCode Oracle — an elite AI football analyst with deep knowledge of all football leagues worldwide.

TODAY IS: ${today}

The user has uploaded a screenshot/picture showing football matches. Your job:
1. READ and IDENTIFY all the teams, leagues, dates, and kickoff times visible in the image.
2. EXCLUDE any games that have ALREADY been played. Only predict UPCOMING matches that have NOT kicked off yet. If a match date/time is in the past relative to today (${today}), skip it entirely.
3. DETERMINE the game type for each remaining match: Is it a league match, cup match (FA Cup, Champions League, Europa League, etc.), international friendly, qualifier, or other? This is CRITICAL for your analysis.
4. ANALYZE each match using your deep knowledge of:
   - How teams perform differently in league vs cup vs friendly matches
   - Teams that raise their game in knockout/cup competitions
   - Teams that rotate squads for friendlies or less important matches
   - Historical performance in specific competitions
   - Home/away form in different competition types
5. PROVIDE clear, confident predictions with reasoning that explains the game type context.

GAME TYPE AWARENESS:
- CUP MATCHES: Teams often play more cautiously, fewer goals, upsets more common.
- CHAMPIONS LEAGUE: Elite teams raise performance, home advantage is amplified.
- LEAGUE MATCHES: Most predictable, form and table position matter most.
- FRIENDLIES: Experimental lineups, results less predictable, often more goals.
- QUALIFIERS: National pride factor, underdogs can surprise.

${safeInstruction}
${filterInstructions}

IMPORTANT: 
- EXCLUDE any matches that have already been played.
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
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI service payment required. Please contact support." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
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

    // ===== AUTO PICK MODE (AI-powered, no external API) =====
    const leagueInstruction = leagues && leagues.length > 0
      ? `LEAGUE FILTER (STRICT): ONLY include matches from these leagues/competitions: ${leagues.join(", ")}. Do NOT include matches from other leagues.`
      : "You may pick matches from any major football league worldwide.";

    const dateInstruction = dateFrom && dateTo
      ? `DATE RANGE: Only include matches scheduled between ${dateFrom} and ${dateTo} (inclusive).`
      : dateFrom
        ? `DATE RANGE: Only include matches from ${dateFrom} onwards (up to 3 days ahead).`
        : `DATE RANGE: Only include matches from ${today} to the next 2-3 days.`;

    const systemPrompt = `You are the BetCode Oracle — an elite AI football analyst with comprehensive, up-to-date knowledge of football worldwide.

TODAY IS: ${today}

Your task: Using your extensive knowledge of football schedules, team form, head-to-head records, league standings, injuries, and playing styles, identify REAL upcoming fixtures and provide expert predictions.

CRITICAL RULES:
1. Only predict REAL matches that are actually scheduled to be played. Do NOT invent or fabricate fixtures.
2. Use accurate team names, league names, and realistic kickoff times.
3. Base predictions on current team form, historical data, home/away records, and tactical analysis.
4. Include the game type context in your reasoning (league, cup, friendly, qualifier, etc.).

${leagueInstruction}
${dateInstruction}

GAME TYPE AWARENESS (CRITICAL):
- Identify whether each match is a league match, cup match, Champions League, Europa League, friendly, or qualifier
- Cup/knockout matches: teams play more cautiously, upsets more common
- Champions League: elite teams raise performance, home advantage amplified
- League matches: most predictable, form matters most
- Friendlies: experimental lineups, less predictable

${safeInstruction}
${filterInstructions}

LEGS REQUIREMENT (STRICT): Return EXACTLY ${numLegs} predictions — no more, no less.

Pick the ${numLegs} matches where you have the HIGHEST confidence, matching ALL active filters.

${RESPONSE_FORMAT}`;

    const userMessage = `Find EXACTLY ${numLegs} real upcoming football matches${leagues && leagues.length > 0 ? ` from: ${leagues.join(", ")}` : ""} between ${dateFrom || today} and ${dateTo || "the next 2-3 days"}, and provide your best predictions.${safeOnly ? ` Only include predictions with ${safeThreshold}%+ confidence.` : ""}${query ? `\n\nAdditional instructions: ${query}` : ""}`;

    console.log(`Auto pick mode: AI generating ${numLegs} predictions`);

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
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service payment required. Please contact support." }), {
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
