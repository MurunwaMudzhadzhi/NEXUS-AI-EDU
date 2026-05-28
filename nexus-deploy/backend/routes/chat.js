"use strict";
const { Router }  = require("express");
const rateLimit   = require("express-rate-limit");
const { callGroq } = require("../middleware/groq");

const router = Router();
router.use(rateLimit({ windowMs:5*60*1000, max:30,
  message:{error:"Chat rate limit reached. Please wait 5 minutes."} }));

const SYSTEM = `You are EduChat, an expert AI tutor in NEXUS AI — Education Intelligence Platform.
Help students understand any academic subject with clarity, depth, and encouragement.
- Adjust explanation level to the student's context
- Use analogies, examples, and step-by-step breakdowns
- Show working for math and science problems
- End complex explanations with a 💡 Key Takeaway line
- Be warm, patient, and never condescending`;

router.post("/", async (req, res) => {
  try {
    const { messages, system } = req.body;
    if (!messages || !Array.isArray(messages) || !messages.length)
      return res.status(400).json({ error: "messages array required" });

    const valid = messages
      .filter(m => m?.content?.trim())
      .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content.trim() }))
      .slice(-20);

    const reply = await callGroq({ system: system || SYSTEM, messages: valid, max_tokens: 1000 });
    res.json({ reply, provider: "groq" });
  } catch (err) {
    console.error("[/api/chat]", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
