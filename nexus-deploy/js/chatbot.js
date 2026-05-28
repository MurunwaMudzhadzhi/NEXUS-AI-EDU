/* ============================================================
   NEXUS AI — EDUCHAT MODULE (AI Tutor Chatbot)
   ============================================================ */

const EDUCHAT_SYSTEM = `You are EduChat, an expert AI tutor embedded in NEXUS AI — an Education Intelligence Platform.

Your purpose is to help students understand concepts across all academic subjects with clarity, depth, and encouragement.

Guidelines:
- Explain concepts clearly at the appropriate level (adjust based on context clues)
- Use analogies, examples, and step-by-step breakdowns
- For math/science, show working where helpful
- Encourage curiosity and deeper thinking
- Keep answers focused but thorough (2-4 paragraphs or structured steps)
- If asked about a specific subject, stay on-topic but connect concepts
- Use formatting when it aids understanding (numbered steps, bullet points)
- End complex explanations with a "💡 Key Takeaway" summary line
- Be warm, encouraging, and never condescending

You're an expert in: Mathematics, Physics, Chemistry, Biology, History, Literature, Computer Science, Economics, Psychology, and more.`;

const SUBJECTS = [
  { icon: "🔢", name: "Mathematics" },
  { icon: "⚛️", name: "Physics" },
  { icon: "🧪", name: "Chemistry" },
  { icon: "🧬", name: "Biology" },
  { icon: "💻", name: "Computer Science" },
  { icon: "📜", name: "History" },
  { icon: "📖", name: "Literature" },
  { icon: "📊", name: "Economics" },
  { icon: "🧠", name: "Psychology" }
];

const QUICK_PROMPTS = [
  "Explain the Pythagorean theorem with examples",
  "How does photosynthesis work step by step?",
  "What caused World War I?",
  "Explain recursion in programming simply",
  "How do vaccines work?",
  "What is supply and demand?"
];

let chatHistory = [];
let activeSubject = null;
let isChatLoading = false;

// ── Render Chat UI ────────────────────────────────────────────
function renderChatUI() {
  const section = document.getElementById("chatbot-section");
  section.innerHTML = `
    <div class="module-inner">
      <div class="module-header">
        <div class="module-header-icon">🎓</div>
        <div class="module-header-text">
          <h1>EduChat <span style="color:var(--accent-teal)">Tutor</span></h1>
          <p>Your AI-powered tutor for any subject, any level, any question</p>
        </div>
      </div>

      <div class="chat-layout">
        <!-- Sidebar -->
        <aside class="chat-sidebar">
          <div class="chat-sidebar-panel">
            <span class="sidebar-label">📚 Subjects</span>
            <div class="subject-list" id="subject-list">
              ${SUBJECTS.map(s => `
                <button class="subject-btn" data-subject="${s.name}">
                  <span>${s.icon}</span>
                  <span>${s.name}</span>
                </button>
              `).join("")}
            </div>
          </div>

          <div class="chat-sidebar-panel">
            <span class="sidebar-label">⚡ Quick Start</span>
            <div class="quick-prompts-list">
              ${QUICK_PROMPTS.map(q => `
                <button class="quick-prompt-btn" data-prompt="${q}">${q}</button>
              `).join("")}
            </div>
          </div>
        </aside>

        <!-- Chat Main -->
        <div class="chat-main">
          <div class="chat-header">
            <div class="chat-header-info">
              <div class="chat-avatar">E</div>
              <div>
                <div class="chat-status-name">EduChat AI Tutor</div>
                <div class="chat-status-line">
                  <span class="status-dot"></span>
                  <span>Online — Ready to teach</span>
                </div>
              </div>
            </div>
            <button class="chat-clear-btn" id="chat-clear-btn">Clear Chat</button>
          </div>

          <div class="chat-messages" id="chat-messages">
            <!-- Welcome message -->
            <div class="chat-message ai animate-fade-up">
              <div class="message-avatar">E</div>
              <div>
                <div class="message-bubble">
                  👋 <strong>Welcome to EduChat!</strong> I'm your personal AI tutor, ready to help with any subject.<br><br>
                  Ask me to explain a concept, solve a problem, or break down a topic step by step. You can select a subject from the sidebar or just start typing!<br><br>
                  <em>What would you like to learn today?</em>
                </div>
                <div class="message-time">${formatTime()}</div>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <div class="chat-input-wrap">
              <textarea
                class="chat-input"
                id="chat-input"
                placeholder="Ask anything... e.g. 'Explain Newton's laws of motion'"
                rows="1"
              ></textarea>
            </div>
            <button class="chat-send-btn" id="chat-send-btn" title="Send (Enter)">
              <span>↑</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  attachChatEvents();
}

// ── Attach Events ─────────────────────────────────────────────
function attachChatEvents() {
  // Subject buttons
  document.querySelectorAll(".subject-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".subject-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeSubject = btn.dataset.subject;
      const input = document.getElementById("chat-input");
      input.focus();
      input.placeholder = `Ask about ${activeSubject}...`;
    });
  });

  // Quick prompts
  document.querySelectorAll(".quick-prompt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById("chat-input");
      input.value = btn.dataset.prompt;
      input.focus();
      autoResizeTextarea(input);
    });
  });

  // Send button
  document.getElementById("chat-send-btn").addEventListener("click", sendChatMessage);

  // Enter key
  const input = document.getElementById("chat-input");
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
  input.addEventListener("input", () => autoResizeTextarea(input));

  // Clear
  document.getElementById("chat-clear-btn").addEventListener("click", clearChat);
}

function autoResizeTextarea(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

// ── Send Message ──────────────────────────────────────────────
async function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text || isChatLoading) return;

  isChatLoading = true;
  input.value = "";
  input.style.height = "auto";
  document.getElementById("chat-send-btn").disabled = true;

  // Add user message
  addChatMessage("user", text);

  // Add to history
  chatHistory.push({ role: "user", content: text });

  // Show typing
  const typingId = showTypingIndicator();

  try {
    // Build messages from history (keep last 10 turns)
    const messages = chatHistory.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    const reply = await callClaudeChat(
      EDUCHAT_SYSTEM + (activeSubject ? `\n\nCurrent subject context: ${activeSubject}` : ""),
      messages
    );

    removeTypingIndicator(typingId);
    addChatMessage("ai", reply);
    chatHistory.push({ role: "assistant", content: reply });

  } catch (err) {
    removeTypingIndicator(typingId);
    addChatMessage("ai", `⚠️ **Connection Error** — Unable to reach the AI tutor. Please check your connection and try again.\n\n*Error: ${err.message}*`);
  } finally {
    isChatLoading = false;
    document.getElementById("chat-send-btn").disabled = false;
    document.getElementById("chat-input").focus();
  }
}

// ── Message Rendering ──────────────────────────────────────────
function addChatMessage(role, text) {
  const container = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = `chat-message ${role} animate-fade-up`;
  div.innerHTML = `
    ${role === "ai" ? `<div class="message-avatar">E</div>` : `<div class="message-avatar">👤</div>`}
    <div>
      <div class="message-bubble">${renderMessageText(text)}</div>
      <div class="message-time">${formatTime()}</div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function renderMessageText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, `<code style="background:rgba(255,255,255,0.1);padding:2px 5px;border-radius:3px;font-family:var(--font-mono);font-size:0.85em">$1</code>`)
    .replace(/\n/g, "<br>");
}

function showTypingIndicator() {
  const id = "typing-" + Date.now();
  const container = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.id = id;
  div.className = "typing-bubble animate-fade-up";
  div.innerHTML = `
    <div class="message-avatar" style="background:linear-gradient(135deg,var(--accent-teal),var(--accent-blue));color:var(--text-inverse);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;">E</div>
    <div class="message-bubble">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function clearChat() {
  chatHistory = [];
  const container = document.getElementById("chat-messages");
  container.innerHTML = "";
  addChatMessage("ai", "Chat cleared! ✨ Ready for a fresh start. What would you like to learn?");
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("chatbot-section");
  if (section) {
    renderChatUI();
  }
});
