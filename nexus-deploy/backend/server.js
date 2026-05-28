"use strict";
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");
const path      = require("path");

const chatRoute      = require("./routes/chat");
const generateRoute  = require("./routes/generate");
const sentimentRoute = require("./routes/sentiment");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      styleSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "fonts.gstatic.com"],
      fontSrc:    ["'self'", "fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.groq.com"],
      imgSrc:     ["'self'", "data:", "blob:"],
      frameSrc:   ["'none'"]
    }
  }
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*").split(",").map(s => s.trim());
app.use(cors({
  origin: (origin, cb) =>
    (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin))
      ? cb(null, true) : cb(new Error(`CORS blocked: ${origin}`)),
  credentials: true
}));

app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many requests — please wait 15 minutes." }
}));

app.use((req, _res, next) => {
  if (req.path.startsWith("/api/")) console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Groq key guard
app.use("/api/", (req, res, next) => {
  if (req.path === "/health") return next();
  if (!process.env.GROQ_API_KEY?.startsWith("gsk_")) {
    return res.status(503).json({
      error: "GROQ_API_KEY not configured. Add it to your environment variables.",
      docs: "https://console.groq.com"
    });
  }
  next();
});

app.use("/api/chat",      chatRoute);
app.use("/api/generate",  generateRoute);
app.use("/api/sentiment", sentimentRoute);

app.get("/api/health", (_req, res) => res.json({
  status:     "ok",
  platform:   "NEXUS AI Education Intelligence",
  version:    "2.1.0",
  timestamp:  new Date().toISOString(),
  groqKeySet: !!process.env.GROQ_API_KEY?.startsWith("gsk_"),
  provider:   "groq"
}));

const FRONTEND = path.join(__dirname, "..");
app.use(express.static(FRONTEND, { maxAge: "1h", etag: true }));
app.get("*", (_req, res) => res.sendFile(path.join(FRONTEND, "index.html")));

app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║   NEXUS AI — Education Intelligence  ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
  console.log(`  🚀  http://localhost:${PORT}`);
  console.log(`  ⚡  Groq Key  → ${process.env.GROQ_API_KEY?.startsWith("gsk_") ? "✓ Set" : "✗ Missing"}`);
  console.log(`  🤖  Model     → llama-3.3-70b-versatile\n`);
});

module.exports = app;
