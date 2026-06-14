# ⚖ Council of Minds

> *"Watch history's greatest thinkers debate the questions that define our era."*

**Microsoft Agents League Hackathon 2026 — Creative Apps Track**

[![Hackathon](https://img.shields.io/badge/Microsoft-Agents%20League%202026-blue)](https://devpost.com)
[![Track](https://img.shields.io/badge/Track-Creative%20Apps-purple)](https://devpost.com)
[![IQ Layer](https://img.shields.io/badge/IQ-Foundry%20IQ%20Pattern-gold)](https://devpost.com)
[![Model](https://img.shields.io/badge/Model-GPT--4.1%20via%20GitHub-green)](https://github.com/marketplace/models)

---

## What It Does

Council of Minds is a **multi-agent AI debate arena**. Enter any modern question and a council of history's greatest thinkers debates it across three structured rounds — producing grounded reasoning, cross-examination, and a synthesised consensus.

Each thinker reasons **only from their documented principles and works**. Every claim cites a real source. The debate unfolds step by step, powered entirely by GitHub Models (GPT-4.1) with your existing GitHub token — no extra accounts or API keys required.

---

## 📸 Examples

See [`examples/README.md`](examples/README.md) for full debate screenshots and suggested topics to run.

| Topic | Council | Confidence |
|---|---|---|
| Should AI be regulated? | Turing · Aristotle · Einstein · Gandhi | 90% |
| Can AI art be truly creative? | Lovelace · Aristotle · Da Vinci · Turing | — |
| Growth vs environment? | Gandhi · Curie · Aristotle · Einstein | — |
| Does democracy still work? | Aristotle · Gandhi · Turing · Nietzsche | — |

---

## Demo

> 📹 [Watch the demo video](#) ← *add your video link here before submitting*

---

## Microsoft IQ Integration — Foundry IQ Pattern

This project implements the **Microsoft Foundry IQ knowledge grounding pattern**.

Before each thinker responds, a dedicated **Research Agent** retrieves and structures grounded context:

- Documented principles relevant to the debate topic
- Applicable works and primary sources  
- Historical context and known positions
- Predicted stance based on evidence

This prevents hallucination and ensures every claim is traceable to real historical record — exactly what Foundry IQ enables at enterprise scale.

```
Research Agent (Foundry IQ pattern)
  ↓ retrieves grounded context per thinker (parallel)
Thinker Agents × 4
  ↓ each responds using ONLY documented principles
Consensus Agent
  ↓ agreements · disagreements · verdict · confidence score
```

**Production path:** Replace the GitHub Models research call in `backend/agents/research.py`:
```python
# Current (hackathon)
result = call_model(system, user)

# Production with Foundry IQ SDK
from foundry_iq import KnowledgeBase
kb = KnowledgeBase(endpoint=os.environ["FOUNDRY_ENDPOINT"])
context = kb.retrieve(query=f"{thinker['name']} on {topic}", top_k=5)
```

---

## Agent Architecture

```
User Input: "Should AI be regulated?"
        │
        ▼
┌──────────────────┐
│  Moderator Agent │  Breaks topic into 4 sub-questions
│                  │  Selects 4 most relevant thinkers
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Research Agent  │  ← Foundry IQ grounding pattern
│  (per thinker)   │  Retrieves documented principles,
│                  │  works, historical context
└────────┬─────────┘
         │  (sequential, rate-limit safe)
         ▼
┌──────────────────┐
│ Thinker Agents   │  Round I   — Opening positions
│    × 4           │  Round II  — Cross-examination
│                  │  Round III — Final rebuttals
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Consensus Agent  │  Agreements · Disagreements
│                  │  Verdict · Confidence score
└──────────────────┘
         │
         ▼
┌──────────────────┐
│  React Frontend  │  Dark cinematic UI
│                  │  Wikipedia portraits
│                  │  PDF export · Share
└──────────────────┘
```

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| All AI inference | GitHub Models (GPT-4.1) | Free with GitHub token, no extra signup |
| Backend | Python Flask | Clean API orchestration |
| Frontend | React + Vite | Fast, Node 22 compatible |
| Portraits | Wikipedia Commons | Free, reliable, historically accurate |
| Dev environment | GitHub Codespaces + Copilot | Student Developer Pack |

**Zero extra accounts needed.** `$GITHUB_TOKEN` is already set in every Codespace automatically.

---

## Thinker Roster

| Thinker | Era | Domain |
|---|---|---|
| Albert Einstein | 1879–1955 | Physics & Ethics |
| Alan Turing | 1912–1954 | Computing & AI |
| Mahatma Gandhi | 1869–1948 | Ethics & Nonviolent Change |
| Ada Lovelace | 1815–1852 | Mathematics & Computing |
| Marie Curie | 1867–1934 | Science & Perseverance |
| Aristotle | 384–322 BC | Philosophy, Logic & Ethics |
| Nikola Tesla | 1856–1943 | Innovation & Technology |
| Leonardo da Vinci | 1452–1519 | Creativity & Science |
| Friedrich Nietzsche | 1844–1900 | Philosophy & Morality |
| Rabindranath Tagore | 1861–1941 | Humanism & Education |

The **Moderator Agent** automatically selects the 4 most relevant thinkers per topic. You can also choose manually.

---

## Project Structure

```
council-of-minds/
├── backend/
│   ├── app.py                  # Flask orchestrator — all routes
│   ├── agents/
│   │   ├── moderator.py        # Selects thinkers, frames debate
│   │   ├── research.py         # Foundry IQ grounding pattern ⭐
│   │   ├── thinker.py          # Generates each thinker's position
│   │   └── consensus.py        # Final synthesis + confidence score
│   ├── data/
│   │   ├── thinkers.json       # 10 thinkers with documented principles
│   │   └── portraits.json      # Wikipedia portrait URLs
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Complete React app (single file)
│   │   ├── index.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── examples/
│   ├── README.md               # Example debates + screenshot guide
│   └── screenshots/            # Add your debate screenshots here
├── demo/
│   └── sample_debate.json      # Pre-generated debate (offline demo)
├── .devcontainer/
│   └── devcontainer.json       # Auto-setup for Codespaces
├── start.sh                    # One-command startup script
└── README.md
```

---

## Setup & Run

### In GitHub Codespaces (recommended)

```bash
# Everything is pre-configured. Just run:
bash start.sh
```

Or manually:

```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
python app.py

# Terminal 2 — Frontend
cd frontend
npm install
npm start
```

Open the **Ports tab** → click the 🌐 globe icon next to port `3000`.

### Locally

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/council-of-minds
cd council-of-minds

# 2. Set your GitHub token (get from github.com → Settings → Developer Settings → PAT)
export GITHUB_TOKEN=ghp_your_token_here

# 3. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py

# 4. Frontend (new terminal)
cd frontend
npm install
npm start
```

Open `http://localhost:3000`

### Test the API

```bash
# Health check
curl http://localhost:5000/api/health

# Run a debate
curl -X POST http://localhost:5000/api/debate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Should AI be regulated?"}'

# Get thinker roster
curl http://localhost:5000/api/thinkers
```

---

## Features

- **Multi-agent orchestration** — 5 specialised agents (Moderator, Research, Thinker ×4, Consensus)
- **Foundry IQ grounding** — Research Agent grounds every response in documented historical record
- **3-round structured debate** — Opening positions → Cross-examination → Final rebuttals
- **Confidence score** — Consensus Agent rates how strongly the council converged (0–100%)
- **Wikipedia portraits** — Real historical photos for each thinker
- **Particle background** — Subtle animated canvas on all screens
- **PDF export** — Full debate formatted for printing or sharing
- **Share button** — Copies a pre-written message for Discord/Twitter
- **Mobile responsive** — Works on all screen sizes
- **Rate limit resilient** — Automatic retry with exponential backoff on GitHub Models 429s
- **Favicon** — Gold scales ⚖ in the browser tab

---

## Judging Rubric

| Criterion | Weight | Our Approach |
|---|---|---|
| **Accuracy & Relevance** | 20% | Research Agent grounds ALL responses in documented historical principles; zero invented positions |
| **Reasoning & Multi-step** | 20% | 5 agents, 3 structured rounds, moderator→research→debate→consensus pipeline |
| **Creativity & Originality** | 15% | Historical debate arena — not another career coach or study assistant |
| **UX & Presentation** | 15% | Cinematic dark UI, Wikipedia portraits, streaming steps, PDF export |
| **Reliability & Safety** | 20% | Thinkers framed as "inspired by documented principles" — never impersonation; retry logic for resilience |
| **Community Vote** | 10% | Memorable and shareable — post in Discord with debate link |

---

## Upgrades Checklist

Track what's done and what could make this even stronger:

### ✅ Completed
- [x] Multi-agent debate pipeline (5 agents)
- [x] Foundry IQ grounding pattern with Research Agent
- [x] 3-round structured debate (opening → cross → rebuttal)
- [x] Consensus Agent with confidence score
- [x] Dark cinematic React UI with Cinzel/EB Garamond fonts
- [x] Wikipedia portraits for all 10 thinkers
- [x] Particle background animation
- [x] PDF export (browser print)
- [x] Share button (copy to clipboard)
- [x] Mobile responsive layout
- [x] Rate limit retry with exponential backoff
- [x] Favicon (⚖ gold scales)
- [x] Loading screen with animated progress ring
- [x] Suggested topics chips
- [x] Devcontainer for Codespaces auto-setup
- [x] One-command start script
- [x] Example debates folder with screenshot guide
- [x] Pre-generated sample debate JSON

### 🔲 Potential Upgrades (post-submission or stretch)
- [ ] **Thinker selector UI** — let user pick which 4 thinkers to convene before debate starts
- [ ] **Streaming responses** — show each word as it generates (Server-Sent Events) instead of waiting for full response
- [ ] **Debate history** — save past debates to localStorage, browse them
- [ ] **Custom thinker** — user defines a custom persona ("A 2025 AI safety researcher")
- [ ] **Topic suggestions from AI** — Moderator suggests 5 related topics after debate
- [ ] **Thinker detail cards** — click a portrait to see full bio, key works, documented principles
- [ ] **Accessibility** — ARIA labels, keyboard navigation, screen reader support (Accessibility Award)
- [ ] **Real Foundry IQ SDK** — replace GitHub Models research call with actual Foundry IQ when access available
- [ ] **Export as image** — html2canvas screenshot of the consensus panel
- [ ] **Debate comparison** — run same topic twice, compare different council compositions
- [ ] **Add more thinkers** — Simone de Beauvoir, Frederick Douglass, Ibn Khaldun, Naomi Klein
- [ ] **Dark/light mode toggle**
- [ ] **Animated thinker cards** — entrance animations per round reveal

---

## Built With

- **GitHub Copilot** — used throughout development for scaffolding and generation
- **GitHub Models** — GPT-4.1 via `https://models.github.ai`
- **GitHub Codespaces** — development environment (GitHub Student Developer Pack)
- **Wikipedia Commons** — historical portrait images (public domain)
- **Vite** — React build tool (Node 22 compatible)

---

## Contributing

Fork the repo, add a thinker to `thinkers.json` + `portraits.json`, and open a PR.
Follow the format in existing entries — `documented_principles` must be verifiable quotes or paraphrases from real works.

---

*Built for the Microsoft Agents League Hackathon 2026 · Creative Apps Track*
*"Watch history's greatest minds reason through the questions that define our era."*
