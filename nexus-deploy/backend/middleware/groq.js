/**
 * NEXUS AI — Groq Middleware v2.3
 * Model fallback: tries each model until one succeeds
 */
"use strict";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama3-70b-8192",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
  "llama3-8b-8192"
];

async function callGroq({ system, messages, max_tokens = 1000 }) {
  const key = (process.env.GROQ_API_KEY || "").trim();
  if (!key) throw Object.assign(new Error("GROQ_API_KEY not set in .env"), { status: 503 });
  if (!key.startsWith("gsk_")) throw Object.assign(new Error("GROQ_API_KEY must start with gsk_"), { status: 503 });

  const body = {
    max_tokens,
    temperature: 0.7,
    messages: [
      { role: "system", content: system },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ]
  };

  let lastErr;

  for (const model of GROQ_MODELS) {
    try {
      const fetchFn = globalThis.fetch || (await import("node-fetch")).default;
      const response = await fetchFn(GROQ_API, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body:    JSON.stringify({ ...body, model })
      });

      // Auth errors — stop immediately, no point trying more models
      if (response.status === 401 || response.status === 403) {
        const e = await response.json().catch(() => ({}));
        throw Object.assign(
          new Error(`Groq auth error (${response.status}): ${e.error?.message || "Invalid API key"}`),
          { status: response.status }
        );
      }

      if (!response.ok) {
        const e = await response.json().catch(() => ({}));
        lastErr = new Error(`Model ${model} (${response.status}): ${e.error?.message || "failed"}`);
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) { lastErr = new Error(`Model ${model} returned empty content`); continue; }

      return text;

    } catch (err) {
      if (err.status === 401 || err.status === 403) throw err;
      lastErr = err;
    }
  }

  throw lastErr || new Error("All Groq models failed. Check your key and Groq service status.");
}

module.exports = { callGroq };
