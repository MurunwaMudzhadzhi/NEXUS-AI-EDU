/* ============================================================
   NEXUS AI — STUDYFORGE MODULE (Content Generator)
   ============================================================ */

const CONTENT_TYPES = [
  { id: "lesson",    icon: "📋", label: "Lesson Plan" },
  { id: "quiz",      icon: "❓", label: "Quiz / MCQ" },
  { id: "notes",     icon: "📝", label: "Study Notes" },
  { id: "flashcards",icon: "🃏", label: "Flashcards" },
  { id: "essay",     icon: "✍️", label: "Essay Outline" },
  { id: "summary",   icon: "🔍", label: "Summary" }
];

const LEVELS = [
  { id: "elementary", label: "Elementary" },
  { id: "middle",     label: "Middle School" },
  { id: "high",       label: "High School" },
  { id: "university", label: "University" }
];

let activeContentType = "notes";
let activeLevel = "high";
let isGenerating = false;
let lastGeneratedContent = "";

const SYSTEM_GENERATOR = `You are StudyForge, an expert educational content creator within NEXUS AI Education Intelligence Platform.

Create high-quality, pedagogically sound educational content. Follow these rules:
- Structure content clearly with headings and sections
- Use appropriate vocabulary for the specified education level
- Make content engaging, accurate, and comprehensive
- For Lesson Plans: include learning objectives, materials, activities, assessment
- For Quizzes: create 8-10 well-crafted multiple choice questions with 4 options each, mark the correct answer
- For Study Notes: cover key concepts, definitions, examples
- For Flashcards: format as "FRONT: [question/term] | BACK: [answer/definition]" on separate lines, create 10-12 cards
- For Essay Outlines: provide thesis, intro hook, body paragraphs, conclusion framework
- For Summaries: concise, hit all key points, easy to review
- Always include a "Key Takeaways" section at the end
- Format well using markdown headers (##, ###), bullet points, bold for key terms`;

// ── Render Generator UI ───────────────────────────────────────
function renderGeneratorUI() {
  const section = document.getElementById("generator-section");
  section.innerHTML = `
    <div class="module-inner">
      <div class="module-header">
        <div class="module-header-icon">📝</div>
        <div class="module-header-text">
          <h1>StudyForge <span style="color:var(--accent-amber)">Generator</span></h1>
          <p>Generate lesson plans, quizzes, study notes, flashcards & more with AI</p>
        </div>
      </div>

      <div class="generator-layout">
        <!-- Controls Sidebar -->
        <div class="generator-controls">
          <div class="controls-panel">
            <div class="controls-panel-title">⚙️ Configuration</div>

            <!-- Content Type -->
            <div class="form-group">
              <label class="form-label">Content Type</label>
              <div class="content-type-grid" id="content-type-grid">
                ${CONTENT_TYPES.map(ct => `
                  <button class="content-type-btn ${ct.id === activeContentType ? "active" : ""}"
                          data-type="${ct.id}">
                    <span class="ct-icon">${ct.icon}</span>
                    <span>${ct.label}</span>
                  </button>
                `).join("")}
              </div>
            </div>

            <!-- Level -->
            <div class="form-group">
              <label class="form-label">Education Level</label>
              <div class="level-chips" id="level-chips">
                ${LEVELS.map(l => `
                  <button class="level-chip ${l.id === activeLevel ? "active" : ""}"
                          data-level="${l.id}">${l.label}</button>
                `).join("")}
              </div>
            </div>

            <!-- Topic -->
            <div class="form-group">
              <label class="form-label">Subject / Topic</label>
              <input
                type="text"
                class="form-input"
                id="topic-input"
                placeholder="e.g. Photosynthesis, World War II, Algebra..."
              />
            </div>

            <!-- Additional Context -->
            <div class="form-group">
              <label class="form-label">Additional Context <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>
              <textarea
                class="form-textarea"
                id="context-input"
                placeholder="e.g. Focus on visual learning, include real-world examples, 45-minute class duration..."
                style="min-height:80px"
              ></textarea>
            </div>

            <!-- Generate Button -->
            <button class="action-btn action-btn-amber" id="generate-btn" style="width:100%">
              <span>✦</span>
              <span>Generate Content</span>
            </button>
          </div>

          <!-- Examples -->
          <div class="controls-panel" style="padding:16px">
            <span class="sidebar-label">💡 Try these topics</span>
            <div style="display:flex;flex-direction:column;gap:5px">
              ${["The Water Cycle", "Quadratic Equations", "The French Revolution",
                 "DNA Replication", "Market Equilibrium", "Object-Oriented Programming"].map(t => `
                <button class="quick-prompt-btn" data-topic="${t}">${t}</button>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Output Area -->
        <div class="generator-output">
          <div class="output-header">
            <div class="output-title" id="output-title">
              <span style="color:var(--text-muted)">Generated content will appear here</span>
            </div>
            <div class="output-actions" id="output-actions"></div>
          </div>
          <div class="output-body glass-panel" id="output-body" style="padding:40px">
            <div class="empty-state">
              <div class="empty-state-icon">✦</div>
              <div class="empty-state-text">
                Configure your settings and click <strong>Generate Content</strong> to create educational material
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  attachGeneratorEvents();
}

// ── Events ────────────────────────────────────────────────────
function attachGeneratorEvents() {
  // Content type selection
  document.querySelectorAll(".content-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".content-type-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeContentType = btn.dataset.type;
    });
  });

  // Level selection
  document.querySelectorAll(".level-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".level-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeLevel = chip.dataset.level;
    });
  });

  // Quick topics
  document.querySelectorAll("[data-topic]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("topic-input").value = btn.dataset.topic;
    });
  });

  // Generate
  document.getElementById("generate-btn").addEventListener("click", generateContent);

  // Enter to generate
  document.getElementById("topic-input").addEventListener("keydown", e => {
    if (e.key === "Enter") generateContent();
  });
}

// ── Generate Content ──────────────────────────────────────────
async function generateContent() {
  const topic = document.getElementById("topic-input").value.trim();
  const context = document.getElementById("context-input").value.trim();

  if (!topic) {
    document.getElementById("topic-input").focus();
    document.getElementById("topic-input").style.borderColor = "rgba(255,69,58,0.5)";
    setTimeout(() => {
      document.getElementById("topic-input").style.borderColor = "";
    }, 2000);
    return;
  }

  if (isGenerating) return;
  isGenerating = true;

  const ct = CONTENT_TYPES.find(c => c.id === activeContentType);
  const lv = LEVELS.find(l => l.id === activeLevel);

  // Update UI
  const generateBtn = document.getElementById("generate-btn");
  generateBtn.disabled = true;
  generateBtn.innerHTML = `<div class="spinner"></div><span>Generating...</span>`;

  const outputTitle = document.getElementById("output-title");
  outputTitle.innerHTML = `<span style="color:var(--accent-amber)">${ct.icon} ${ct.label}</span> — ${topic}`;

  const outputBody = document.getElementById("output-body");
  showLoading(outputBody);

  // Clear actions
  document.getElementById("output-actions").innerHTML = "";

  // Build prompt
  const userPrompt = `Create a ${ct.label} for the following:

Topic: ${topic}
Education Level: ${lv.label}
${context ? `Additional requirements: ${context}` : ""}

Please create comprehensive, high-quality ${ct.label.toLowerCase()} content for this topic at the ${lv.label} level.`;

  try {
    const content = await callClaudeGenerate({
      topic,
      contentType: activeContentType,
      level: activeLevel,
      context
    });
    lastGeneratedContent = content;

    outputBody.innerHTML = `<div class="result-reveal">${renderGeneratedContent(content)}</div>`;

    // Show actions
    document.getElementById("output-actions").innerHTML = `
      <button class="action-btn action-btn-ghost" onclick="copyGeneratedContent()" style="font-size:0.78rem;padding:8px 14px">
        📋 Copy
      </button>
      <button class="action-btn action-btn-amber" onclick="downloadContent('${escapeQuotes(topic)}')" style="font-size:0.78rem;padding:8px 14px">
        ⬇ Download
      </button>
    `;

  } catch (err) {
    outputBody.innerHTML = `
      <div class="empty-state">
        <div style="font-size:2rem">⚠️</div>
        <div class="empty-state-text" style="color:var(--accent-red)">
          Generation failed: ${err.message}<br>
          <small style="color:var(--text-muted)">Please check your connection and try again.</small>
        </div>
      </div>
    `;
  } finally {
    isGenerating = false;
    generateBtn.disabled = false;
    generateBtn.innerHTML = "<span>✦</span><span>Generate Content</span>";
  }
}

function renderGeneratedContent(text) {
  return text
    .replace(/^### (.+)$/gm, `<h3 style="font-family:var(--font-display);color:var(--accent-amber);font-size:0.98rem;margin:20px 0 8px">$1</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-family:var(--font-display);color:var(--accent-amber);font-size:1.2rem;margin:24px 0 10px;padding-bottom:6px;border-bottom:1px solid rgba(255,182,39,0.15)">$1</h2>`)
    .replace(/^# (.+)$/gm, `<h2 style="font-family:var(--font-display);color:var(--accent-amber);font-size:1.3rem;margin:24px 0 12px">$1</h2>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:var(--text-primary)">$1</strong>`)
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, `<code>$1</code>`)
    .replace(/^[-•] (.+)$/gm, `<li style="margin-bottom:5px;color:var(--text-secondary)">$1</li>`)
    .replace(/^(\d+)\. (.+)$/gm, `<li style="margin-bottom:5px;color:var(--text-secondary)"><strong style="color:var(--accent-amber)">$1.</strong> $2</li>`)
    .replace(/\n\n/g, `</p><p style="line-height:1.75;margin-bottom:12px;color:var(--text-primary)">`)
    .replace(/^(?!<[huli])(.{2,})$/gm, `<p style="line-height:1.75;margin-bottom:12px;color:var(--text-primary)">$1</p>`)
    .replace(/<p[^>]*><\/p>/g, "");
}

function copyGeneratedContent() {
  navigator.clipboard.writeText(lastGeneratedContent);
  const btn = document.querySelector("[onclick='copyGeneratedContent()']");
  if (btn) { btn.textContent = "✓ Copied!"; setTimeout(() => btn.innerHTML = "📋 Copy", 2000); }
}

function downloadContent(topic) {
  const blob = new Blob([lastGeneratedContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `NEXUS-AI_${topic.replace(/\s+/g,"-")}_${activeContentType}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeQuotes(s) { return s.replace(/'/g, "\\'").replace(/"/g, '\\"'); }

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("generator-section");
  if (section) renderGeneratorUI();
});
