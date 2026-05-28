"use strict";
const { Router }   = require("express");
const rateLimit    = require("express-rate-limit");
const { callGroq } = require("../middleware/groq");

const router = Router();
router.use(rateLimit({ windowMs:5*60*1000, max:20,
  message:{error:"Generation rate limit reached. Please wait 5 minutes."} }));

const LEVELS = {
  elementary: "Age 6-10. Very simple language, short sentences, everyday examples.",
  middle:     "Age 11-13. Clear language with some subject vocabulary.",
  high:       "Age 14-17. Academic vocabulary, analytical thinking, real-world examples.",
  university: "Undergraduate. Technical language, depth, nuance."
};

const TYPES = {
  lesson:     "a comprehensive Lesson Plan with: Learning Objectives, Materials, Warm-Up (5 min), Main Instruction (25-30 min), Activities, Assessment, and Differentiation strategies.",
  quiz:       "exactly 10 multiple-choice questions. For each: clear question, 4 options (A-D), mark correct answer with ✓, brief explanation.",
  notes:      "comprehensive Study Notes with: Introduction, Key Concepts & Definitions, Examples, Common Misconceptions, and Summary.",
  flashcards: "exactly 12 flashcards. Format each as:\nFRONT: [term/question]\nBACK: [definition/answer with example]\n---",
  essay:      "a structured Essay Outline with: hook, thesis, 3-4 body paragraph plans (topic sentence + evidence), counter-argument, conclusion strategy.",
  summary:    "a concise Summary covering all key points: overview, main ideas, critical details, real-world relevance."
};

router.post("/", async (req, res) => {
  try {
    const { topic, contentType = "notes", level = "high", context = "" } = req.body;
    if (!topic?.trim()) return res.status(400).json({ error: "topic is required" });

    const system = `You are StudyForge, an expert educational content creator in NEXUS AI.
Create high-quality, pedagogically sound content using markdown formatting.
Always end with a ## Key Takeaways section (3-5 bullet points).`;

    const prompt = `Create ${TYPES[contentType] || TYPES.notes}

Topic: ${topic}
Education Level: ${LEVELS[level] || LEVELS.high}
${context ? `Additional requirements: ${context}` : ""}`;

    const content = await callGroq({ system, messages: [{ role:"user", content:prompt }], max_tokens: 1500 });
    res.json({ content, contentType, level, topic: topic.trim() });
  } catch (err) {
    console.error("[/api/generate]", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
