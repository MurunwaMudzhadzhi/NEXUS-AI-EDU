"use strict";
const { Router }   = require("express");
const rateLimit    = require("express-rate-limit");
const { callGroq } = require("../middleware/groq");

const router = Router();
router.use(rateLimit({ windowMs:5*60*1000, max:40,
  message:{error:"Sentiment rate limit reached. Please wait 5 minutes."} }));

const SYSTEM = `You are EmpathyLens, a sentiment analysis engine in NEXUS AI.
Return ONLY valid JSON — no markdown, no preamble, no explanation outside the JSON.

Schema (all fields required, all numbers must be integers):
{"overall":"positive"|"negative"|"neutral"|"mixed","score":<0-100>,"confidence":<60-98>,"verdict":"<2-4 word descriptor>","emotions":{"joy":<0-100>,"frustration":<0-100>,"confusion":<0-100>,"motivation":<0-100>,"anxiety":<0-100>,"satisfaction":<0-100>},"keywords":["w1","w2","w3","w4","w5"],"insights":["educator insight 1","insight 2","insight 3"],"summary":"<1-2 sentences>"}`;

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim() || text.length < 10) return res.status(400).json({ error: "text must be at least 10 characters" });
    if (text.length > 5000) return res.status(400).json({ error: "text must be under 5000 characters" });

    const raw = await callGroq({
      system,
      messages: [{ role:"user", content:`Analyse this student feedback:\n\n"${text.trim()}"` }],
      max_tokens: 700
    });

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: "Invalid AI response. Please try again." });

    const parsed = JSON.parse(match[0]);
    const safe = {
      overall:    ["positive","negative","neutral","mixed"].includes(parsed.overall) ? parsed.overall : "neutral",
      score:      Math.max(0, Math.min(100, parseInt(parsed.score) || 50)),
      confidence: Math.max(0, Math.min(100, parseInt(parsed.confidence) || 75)),
      verdict:    typeof parsed.verdict === "string" ? parsed.verdict : "Analysis Complete",
      emotions:   {},
      keywords:   Array.isArray(parsed.keywords) ? parsed.keywords.slice(0,8) : [],
      insights:   Array.isArray(parsed.insights) ? parsed.insights.slice(0,5) : [],
      summary:    typeof parsed.summary === "string" ? parsed.summary : ""
    };
    for (const k of ["joy","frustration","confusion","motivation","anxiety","satisfaction"]) {
      safe.emotions[k] = Math.max(0, Math.min(100, parseInt(parsed.emotions?.[k]) || 0));
    }

    res.json({ analysis: safe });
  } catch (err) {
    console.error("[/api/sentiment]", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
