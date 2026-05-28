/* ============================================================
   NEXUS AI — EMPATHYLENS MODULE (Sentiment Analyser)
   ============================================================ */

const SENTIMENT_SYSTEM = `You are EmpathyLens, a precision sentiment analysis engine within NEXUS AI Education Intelligence Platform.

Analyse student feedback, course reviews, and academic text. Return your analysis ONLY as valid JSON in this exact format (no markdown, no preamble):

{
  "overall": "positive" | "negative" | "neutral" | "mixed",
  "score": <0-100 integer — 0=most negative, 50=neutral, 100=most positive>,
  "confidence": <60-98 integer>,
  "verdict": "<2-4 word emotional descriptor, e.g. 'Highly Enthusiastic', 'Deeply Frustrated', 'Cautiously Optimistic'>",
  "emotions": {
    "joy": <0-100>,
    "frustration": <0-100>,
    "confusion": <0-100>,
    "motivation": <0-100>,
    "anxiety": <0-100>,
    "satisfaction": <0-100>
  },
  "keywords": ["<word1>", "<word2>", "<word3>", "<word4>", "<word5>"],
  "insights": [
    "<Actionable insight 1 for educators — specific and useful>",
    "<Actionable insight 2>",
    "<Actionable insight 3>"
  ],
  "summary": "<1-2 sentence natural language summary of the sentiment>"
}

Be accurate, nuanced, and insightful. Numbers must be integers.`;

const SAMPLE_FEEDBACKS = [
  {
    label: "😊 Positive Review",
    text: "This course completely changed how I think about mathematics. The professor's explanations were crystal clear, and the way each concept built on the last made everything click. I used to dread math, but now I actually look forward to studying. The practical examples really helped me see the real-world applications."
  },
  {
    label: "😤 Negative Feedback",
    text: "I'm really struggling with this class. The lectures go too fast and there's never enough time to ask questions. The assignments are confusing and the instructions aren't clear at all. I've emailed the professor three times and got no reply. I feel completely lost and I'm worried I'm going to fail."
  },
  {
    label: "😐 Mixed Feelings",
    text: "The content is interesting and the materials are well-organised, but the workload is overwhelming. I enjoy the topics but I'm constantly stressed about deadlines. Some modules were excellent while others felt rushed. The group projects were frustrating because not everyone contributed equally."
  },
  {
    label: "🤔 Confused Student",
    text: "I genuinely want to do well in this subject but I don't understand what's expected of me. The rubric is vague and I'm unsure whether my answers are the right kind of detailed. I've tried reading extra materials but somehow that makes me more confused. I think I need more structured guidance."
  }
];

let isAnalysing = false;

// ── Render Sentiment UI ───────────────────────────────────────
function renderSentimentUI() {
  const section = document.getElementById("sentiment-section");
  section.innerHTML = `
    <div class="module-inner">
      <div class="module-header">
        <div class="module-header-icon">💡</div>
        <div class="module-header-text">
          <h1>EmpathyLens <span style="color:var(--accent-purple)">Analyser</span></h1>
          <p>Decode student emotions — analyse feedback, reviews & academic responses</p>
        </div>
      </div>

      <div class="sentiment-layout">
        <!-- Input Panel -->
        <div class="sentiment-input-panel">
          <div class="glass-panel">
            <div class="form-group">
              <label class="form-label">Student Feedback or Academic Text</label>
              <textarea
                class="form-textarea sentiment-textarea"
                id="sentiment-input"
                placeholder="Paste student feedback, course review, or any educational text here..."
                style="min-height:220px"
              ></textarea>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <button class="action-btn action-btn-purple" id="analyse-btn" style="flex:1">
                <span>◉</span>
                <span>Analyse Sentiment</span>
              </button>
              <button class="action-btn action-btn-ghost" id="clear-sentiment-btn" style="padding:12px 16px">
                ✕
              </button>
            </div>

            <!-- Sample feedbacks -->
            <div class="sample-feedbacks">
              <span class="sample-label">Try a sample:</span>
              ${SAMPLE_FEEDBACKS.map((s, i) => `
                <button class="sample-btn" data-sample="${i}">${s.label}</button>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Results Panel -->
        <div class="sentiment-results-panel" id="sentiment-results">
          <div class="glass-panel" style="padding:40px">
            <div class="empty-state">
              <div class="empty-state-icon">◉</div>
              <div class="empty-state-text">
                Enter student feedback above and click <strong>Analyse Sentiment</strong> to reveal emotional insights
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  attachSentimentEvents();
}

// ── Events ────────────────────────────────────────────────────
function attachSentimentEvents() {
  document.getElementById("analyse-btn").addEventListener("click", analyseSentiment);
  document.getElementById("clear-sentiment-btn").addEventListener("click", () => {
    document.getElementById("sentiment-input").value = "";
    document.getElementById("sentiment-input").focus();
  });

  document.querySelectorAll(".sample-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sample = SAMPLE_FEEDBACKS[parseInt(btn.dataset.sample)];
      document.getElementById("sentiment-input").value = sample.text;
    });
  });
}

// ── Analyse ───────────────────────────────────────────────────
async function analyseSentiment() {
  const text = document.getElementById("sentiment-input").value.trim();
  if (!text || text.length < 20) {
    document.getElementById("sentiment-input").focus();
    return;
  }

  if (isAnalysing) return;
  isAnalysing = true;

  const btn = document.getElementById("analyse-btn");
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div><span>Analysing...</span>`;

  const resultsPanel = document.getElementById("sentiment-results");
  resultsPanel.innerHTML = `
    <div class="glass-panel" style="padding:32px">
      <div class="shimmer-line full"></div>
      <div class="shimmer-line med" style="margin-top:16px"></div>
      <div class="shimmer-line short"></div>
      <div class="shimmer-line full" style="margin-top:24px"></div>
      <div class="shimmer-line med"></div>
      <div class="shimmer-line full"></div>
    </div>
  `;

  try {
    const data = await callClaudeSentiment(text);
    renderSentimentResults(data);

  } catch (err) {
    resultsPanel.innerHTML = `
      <div class="glass-panel" style="padding:32px">
        <div class="empty-state">
          <div style="font-size:2rem">⚠️</div>
          <div class="empty-state-text" style="color:var(--accent-red)">
            Analysis failed: ${err.message}
          </div>
        </div>
      </div>
    `;
  } finally {
    isAnalysing = false;
    btn.disabled = false;
    btn.innerHTML = "<span>◉</span><span>Analyse Sentiment</span>";
  }
}

// ── Render Results ────────────────────────────────────────────
function renderSentimentResults(data) {
  const resultsPanel = document.getElementById("sentiment-results");

  const colorMap = {
    positive: "var(--accent-green)",
    negative: "var(--accent-red)",
    neutral:  "var(--accent-amber)",
    mixed:    "var(--accent-purple)"
  };
  const bgMap = {
    positive: "rgba(48,209,88,0.12)",
    negative: "rgba(255,69,58,0.12)",
    neutral:  "rgba(255,182,39,0.12)",
    mixed:    "rgba(191,90,242,0.12)"
  };

  const ringColor = colorMap[data.overall] || "var(--accent-purple)";
  const score = Math.max(0, Math.min(100, data.score));

  // SVG ring
  const r = 54, circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (1 - score / 100);

  const emotionColors = {
    joy:          "var(--accent-amber)",
    frustration:  "var(--accent-red)",
    confusion:    "#ff9500",
    motivation:   "var(--accent-teal)",
    anxiety:      "var(--accent-purple)",
    satisfaction: "var(--accent-green)"
  };

  resultsPanel.innerHTML = `
    <div class="animate-scale-in" style="display:flex;flex-direction:column;gap:14px">

      <!-- Score card -->
      <div class="sentiment-score-card">
        <div class="sentiment-ring">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <!-- Track -->
            <circle cx="70" cy="70" r="${r}" fill="none"
                    stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
            <!-- Fill -->
            <circle cx="70" cy="70" r="${r}" fill="none"
                    stroke="${ringColor}" stroke-width="10"
                    stroke-linecap="round"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${circumference}"
                    style="transition:stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)"
                    id="score-ring-fill"
                    transform="rotate(-90 70 70)"/>
          </svg>
          <div class="sentiment-ring-value">
            <div class="ring-score" style="color:${ringColor}">${score}</div>
            <div class="ring-label">Score</div>
          </div>
        </div>

        <div class="sentiment-verdict" style="color:${ringColor}">${data.verdict || "Analysis Complete"}</div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
          <span class="tag-pill" style="background:${bgMap[data.overall]};color:${ringColor};border:1px solid ${ringColor}33">
            ${data.overall?.toUpperCase()}
          </span>
          <span class="tag-pill tag-info">
            ${data.confidence}% confidence
          </span>
        </div>

        <p style="font-size:0.82rem;color:var(--text-secondary);text-align:center;max-width:340px;line-height:1.6">
          ${data.summary}
        </p>
      </div>

      <!-- Emotion breakdown -->
      <div class="sentiment-details">
        <div style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px">
          Emotional Breakdown
        </div>
        <div class="emotion-bars">
          ${Object.entries(data.emotions || {}).map(([emotion, value]) => `
            <div class="emotion-row">
              <div class="emotion-name">${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</div>
              <div class="emotion-bar-wrap">
                <div class="emotion-bar-fill"
                     style="width:0%;background:${emotionColors[emotion] || "var(--accent-teal)"}"
                     data-target="${value}"></div>
              </div>
              <div class="emotion-pct">${value}%</div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Keywords -->
      <div class="glass-panel" style="padding:18px">
        <div style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px">
          Key Signals
        </div>
        <div class="keywords-cloud">
          ${(data.keywords || []).map(kw => `
            <span class="keyword-tag">${kw}</span>
          `).join("")}
        </div>
      </div>

      <!-- Insights -->
      <div class="glass-panel" style="padding:18px">
        <div style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px">
          💡 Educator Insights
        </div>
        <div class="insights-list">
          ${(data.insights || []).map(ins => `
            <div class="insight-item">
              <div class="insight-bullet"></div>
              <div>${ins}</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  // Animate ring after render
  requestAnimationFrame(() => {
    const ring = document.getElementById("score-ring-fill");
    if (ring) {
      const circumference = 2 * Math.PI * 54;
      ring.style.strokeDashoffset = circumference * (1 - score / 100);
    }

    // Animate emotion bars
    document.querySelectorAll(".emotion-bar-fill[data-target]").forEach(bar => {
      setTimeout(() => {
        bar.style.transition = "width 0.9s cubic-bezier(0.16,1,0.3,1)";
        bar.style.width = bar.dataset.target + "%";
      }, 100);
    });
  });
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("sentiment-section");
  if (section) renderSentimentUI();
});
