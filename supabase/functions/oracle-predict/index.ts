import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, mode, legs, safeOnly, leagues, goalFilter, cornerFilter } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are the BetCode Oracle — an elite AI football analyst. You analyze football matches across ALL leagues worldwide (not just top leagues) and provide data-driven predictions.

CRITICAL RULES:
- Never show sources or citations
- Always include match date and kickoff time
- Always include predicted score
- Always include win/draw/loss percentages
- Always include a "likeliness" label (Very High / High / Medium / Low)
- Include the league name for each match
- Format response as valid JSON only, no markdown, no code blocks

${safeOnly ? "SAFE MODE: Only return predictions with 70%+ confidence (Very High or High likeliness). Skip anything uncertain." : ""}

${goalFilter ? `GOAL FILTER: Only show matches likely to have ${goalFilter}.` : ""}
${cornerFilter ? `CORNER FILTER: Only show matches likely to have ${cornerFilter}.` : ""}
${leagues && leagues.length > 0 && !leagues.includes("All") ? `LEAGUE FILTER: Only show matches from these leagues: ${leagues.join(", ")}.` : "Include matches from ALL football leagues worldwide — lower divisions, cups, international friendlies, youth leagues, women's leagues, everything."}

${mode === "auto_pick" ? `AUTO PICK MODE: Select exactly ${legs || 5} matches that are the MOST LIKELY to win. Pick the safest, most obvious outcomes. Advise the user on what to play — be specific about which team to back and why.` : ""}

Response must be a JSON object with this exact structure:
{
  "predictions": [
    {
      "homeTeam": "Team A",
      "awayTeam": "Team B",
      "league": "League Name",
      "matchDate": "2025-10-20",
      "kickoffTime": "15:00",
      "predictedScore": "2-1",
      "homeWinPct": 65,
      "drawPct": 20,
      "awayWinPct": 15,
      "likeliness": "High",
      "prediction": "Home Win",
      "expectedGoals": 3.1,
      "expectedCorners": 9.5,
      "reasoning": "Brief analysis of why"
    }
  ],
  "advice": "Overall betting advice summary"
}`;

    const userMessage = mode === "auto_pick" 
      ? `Auto-pick ${legs || 5} upcoming football matches with the highest winning probability. I want the safest bets possible. ${query || ""}`
      : query || "Show me upcoming football match predictions for today and tomorrow";

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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse the JSON from the response
    let parsed;
    try {
      // Remove potential markdown code fences
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      parsed = { predictions: [], advice: content };
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
