// Vercel serverless function: turns the visitor's answers into a personal build plan with Claude.
// Set ANTHROPIC_API_KEY in Vercel → Project → Settings → Environment Variables.
// If the key is missing or the call fails, the front end falls back to its built-in plan.

const ALLOWED = {
  build: ["ai", "saas", "mobile", "web", "ecom", "chatbot", "automation", "crm", "design", "marketing", "unsure"],
  stage: ["idea", "prototype", "live", "rebuild"],
  priority: ["speed", "scale", "experience", "automation"],
  timeline: ["6w", "3m", "6m", "flex"],
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "AI not configured" });

  const b = req.body || {};
  const a = { name: String(b.name || "").replace(/[^\p{L}\p{M} '-]/gu, "").slice(0, 24) };
  for (const k of Object.keys(ALLOWED)) a[k] = ALLOWED[k].includes(b[k]) ? b[k] : "unsure";

  const prompt = `You are the strategist at The Lincoln Media, a New York studio (est. 2012) that builds AI systems, SaaS platforms and mobile apps.
A visitor answered: name=${a.name || "(none)"}, building=${a.build}, current stage=${a.stage}, top priority=${a.priority}, timeline=${a.timeline}.
Write a short, confident, specific build plan. Return ONLY JSON:
{"archetype": "The <2-word title>", "lede": "2 sentences addressed to the visitor by name if given", "stack": ["4 things we'd build, max 8 words each"], "plan": ["4 phases with week ranges that fit the timeline, max 12 words each"]}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) throw new Error("upstream " + r.status);
    const data = await r.json();
    const text = data.content?.[0]?.text || "";
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(json);
  } catch (e) {
    return res.status(502).json({ error: "AI unavailable" });
  }
}
