# NEXUS AI — Education Intelligence Platform

> AI-powered education platform powered by **Groq LLaMA 3.3 70B**

---

## 🚀 Deploy to Render

### 1 — Push your repo to GitHub
Make sure all these files are at the **root** of your repo (no nested folders):
```
package.json   index.html   render.yaml   backend/   css/   js/   assets/
```

### 2 — Create a Web Service on Render
- [render.com](https://render.com) → **New → Web Service** → connect your repo
- Render auto-detects `render.yaml` — no manual build settings needed

### 3 — Add your Groq key
Render Dashboard → your service → **Environment** tab → **Add Environment Variable**:

| Key | Value |
|---|---|
| `GROQ_API_KEY` | `gsk_...` from [console.groq.com](https://console.groq.com) |

### 4 — Deploy
Click **Save Changes** — Render redeploys automatically. Done.

---

## 💻 Run Locally

```bash
git clone https://github.com/MurunwaMudzhadzhi/NEXUS-AI-EDU
cd NEXUS-AI-EDU
cp .env.example .env          # then add: GROQ_API_KEY=gsk_...
npm install
npm start                      # → http://localhost:3001
```

**No server needed?** Open `index.html` → ⚙️ Settings → paste Groq key → Save.

---

## 📁 Structure

```
/                              ← repo root (package.json lives here)
├── package.json
├── render.yaml
├── .env.example
├── index.html
├── assets/icon.svg
├── css/   js/
└── backend/
    ├── server.js
    ├── routes/   chat.js  generate.js  sentiment.js
    └── middleware/  groq.js
```

---

## 🧩 Four Modules

| # | Module | Tech |
|---|---|---|
| 1 | 🎓 **EduChat** | LLaMA 3.3 70B via Groq |
| 2 | 📝 **StudyForge** | LLaMA 3.3 70B via Groq |
| 3 | 💡 **EmpathyLens** | LLaMA 3.3 70B via Groq |
| 4 | 🧠 **AcademIQ** | Cosine Similarity · MLR · Classification · Q-RL |

---

## 🔑 Get a Free Groq Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free) → **API Keys** → **Create API Key**
3. Copy the `gsk_...` key
4. Paste it in Settings (browser) or `.env` (backend)

*NEXUS AI v2.2 · Groq Edition*
