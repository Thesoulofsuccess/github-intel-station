# 🔭 GitHub Intelligence Station

> *"What's worth your attention today."*

A fully autonomous, 5-agent AI system that scouts all of GitHub every Monday morning across 4 deep domains, scores the best repos with reasoning, maps each one to your specific workflows, and emails you one ranked executive brief — before your standup.

Built by **Vikash Rajan** · FinTech COO, Redpin Payments, Mumbai.
Powered by **Claude Opus 4** · Deployed on **GitHub Actions** + **GitHub Pages**.

🌐 **Live app:** [thesoulofsuccess.github.io/github-intel-station](https://thesoulofsuccess.github.io/github-intel-station)

---

## How It Works

```
Every Monday 6:30 AM IST
        ↓
┌─────────────────────────────────────────────┐
│  Agent 1 — Scout                            │
│  49 query recipes across 4 domains, run     │
│  in parallel. Scans last 30 days of GitHub  │
│  activity. Not what you follow — all of it. │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Agent 2 — Analyst                          │
│  Scores every repo 0-100 across 4 domains   │
│  with reasoning + confidence. Powered by    │
│  Claude Opus 4.                             │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Agent 3 — Connector                        │
│  Maps each repo to your 4 active workflows: │
│  Redpin · NIFTY+Markets · Reel IQ ·         │
│  Automation. The "so what for me" layer.    │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Agent 4 — Briefer                          │
│  Chief of staff. Ranks by urgency ×         │
│  opportunity. Writes one decisive brief     │
│  with specific actions you can do this week.│
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Agent 5 — Learner                          │
│  Thumbs up/down on picks updates domain     │
│  weights. Every signal makes next week's    │
│  brief smarter.                             │
└──────────────────┬──────────────────────────┘
                   ↓
       📧 Email digest to your inbox
       🌐 Full brief live on the web app
       📁 brief.json committed to repo
```

---

## The 4 Domains (49 query recipes total)

### 💳 Payments & FinTech
ACH/NACHA, Open Banking, ISO 20022, blockchain payments, stablecoins, CBDCs, cross-border rails, RegTech, embedded finance, DeFi infrastructure.

### 📈 Markets & Investing
NIFTY options (CE/PE, 5-min candle), global equities, portfolio rebalancers, quant strategies, financial advisor tools, backtesting frameworks, risk management, crypto trading, factor investing, earnings analysis.

### 🤖 AI & Efficiency
Claude plugins, MCP servers, multi-agent orchestration, AI for financial services, workflow automation, n8n, RAG systems, prompt engineering, developer productivity.

### 🎬 Growth & Creator
YouTube Shorts, TikTok analytics, Instagram Reels, creator intelligence, content repurposing, AI video tools, audience analytics, newsletter growth, SEO tools — everything that powers Reel IQ.

---

## Your 4 Active Workflows

Every repo is mapped by the Connector agent to at least one of these:

| Workflow | What It Covers |
|----------|---------------|
| **Redpin** | ACH/NACHA infrastructure, JP Morgan Chase + Cross River Bank integrations, KYC/AML, fraud scoring, reconciliation, payment ops |
| **NIFTY + Markets** | CE/PE options framework, first 5-min candle analysis, global equities, portfolio rebalancing, financial advisor tools |
| **Reel IQ** | Python/Streamlit content intelligence SaaS, YouTube Shorts + TikTok + Reels analytics, creator engagement scoring |
| **Automation** | n8n, Google Apps Script, Forms/Sheets, ops efficiency tools |

---

## Where You Find Your Brief

### 📧 Your inbox (automatic every Monday)
Beautiful HTML email digest lands in:
- `zikash@gmail.com`
- `vikash.rajan@redpincompany.com`

Subject: `◆ Intelligence Brief · YYYY-MM-DD · [SIGNAL] · N picks`

### 🌐 Live web app
**[thesoulofsuccess.github.io/github-intel-station](https://thesoulofsuccess.github.io/github-intel-station)**

Mobile + desktop. Light + dark mode. Read the brief, browse the repo feed, rate picks to teach the Learner.

### 📁 Raw JSON
[`public/brief.json`](public/brief.json) — auto-committed every Monday.

### 🔘 Manual dispatch
[GitHub Actions tab](https://github.com/Thesoulofsuccess/github-intel-station/actions) → "Intelligence Station — Weekly Scout" → Run workflow.

---

## Project Structure

```
github-intel-station/
│
├── .github/workflows/
│   └── scout.yml              ← Weekly scheduler (Mon 6:30 AM IST)
│
├── scripts/
│   ├── run_pipeline.py        ← Full 5-agent pipeline
│   └── send_brief.py          ← HTML email digest sender
│
├── src/
│   ├── App.jsx                ← React UI (Editorial Discovery)
│   ├── main.jsx               ← React entry point
│   ├── agents/
│   │   ├── scout.js           ← Agent 1: GitHub Search (JS reference)
│   │   ├── analyst.js         ← Agent 2: Scoring
│   │   ├── connector.js       ← Agent 3: Workflow mapping
│   │   ├── briefer.js         ← Agent 4: Executive brief
│   │   └── learner.js         ← Agent 5: Feedback weights
│   ├── api/
│   │   ├── github.js          ← GitHub API helper + 6hr cache
│   │   └── claude.js          ← Anthropic API helper
│   ├── queries/
│   │   └── recipes.js         ← 49 GitHub Search query recipes
│   └── utils/
│       └── export.js          ← Clipboard / markdown / txt export
│
├── public/
│   ├── brief.json             ← Latest brief (auto-updated weekly)
│   ├── weights.json           ← Learner domain weights
│   └── favicon.svg
│
├── package.json               ← Vite + React build config
├── vite.config.js             ← Vite config (GitHub Pages base)
├── index.html                 ← Vite HTML entry
│
├── MEMORY.md                  ← Session memory (Claude Code)
├── INSTRUCTIONS.md            ← Claude Code rules
├── SKIP.md                    ← Self-improving backlog
├── ARCHITECTURE.md            ← System design + agent contracts
├── CLAUDE.md                  ← Claude Code fast-boot
├── SKILL.md                   ← Auto-trigger skill
└── .env.example               ← Environment variable template
```

---

## Tech Stack

| Layer | Tool |
|-------|------|
| **AI brain** | Claude Opus 4 (`claude-opus-4-5`) |
| **Repo discovery** | GitHub Search REST API |
| **Pipeline** | Python 3.11 (pure stdlib + PyNaCl for secret encryption) |
| **Scheduler** | GitHub Actions (cron + manual dispatch) |
| **Email** | Gmail SMTP via App Password |
| **Frontend** | React 18 + Vite |
| **Hosting** | GitHub Pages |
| **Persistence** | localStorage (Learner weights) + repo-committed `brief.json` |

---

## Setup (run on your machine)

### 1. Clone
```bash
git clone https://github.com/Thesoulofsuccess/github-intel-station
cd github-intel-station
```

### 2. Create `.env`
```bash
cp .env.example .env
# Fill in:
GITHUB_TOKEN=ghp_...          # needs repo + workflow scope
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run pipeline manually
```bash
python3 scripts/run_pipeline.py
# Brief saved to public/brief.json
```

### 4. Run the UI locally
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

### 5. Deploy to GitHub Pages
```bash
npm run deploy
```

---

## GitHub Actions Setup (already done ✅)

Four secrets are stored in the repo:

| Secret | What it is |
|--------|-----------|
| `GH_SCOUT_TOKEN` | GitHub PAT (repo + workflow scope) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Opus 4 |
| `GMAIL_USER` | Your Gmail address (sender) |
| `GMAIL_APP_PASSWORD` | Gmail App Password (16-char) |

**Schedule:** Every Monday at 1:00 AM UTC (6:30 AM IST)

To change the cron, edit `.github/workflows/scout.yml`.

---

## Session Continuity (Claude Code)

This project uses a 6-file protocol for seamless Claude Code sessions:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | 60-second fast-boot at session start |
| `MEMORY.md` | Session log + phase tracker |
| `INSTRUCTIONS.md` | Rules every Claude Code session must follow |
| `SKIP.md` | Self-improving backlog — ≥2 items addressed per session |
| `ARCHITECTURE.md` | Agent contracts + design tokens |
| `SKILL.md` | Auto-trigger skill metadata |

Every Claude Code session reads these first. Every session ends by updating them.

---

## Design — "Editorial Discovery"

Typography-led, calm, adaptive. Not a finance terminal — the Scout covers all of GitHub.

- **Display font:** Spectral (serif) — editorial voice
- **Data font:** IBM Plex Mono — scores, metadata, agent status
- **Themes:** Light + Dark toggle
- **Motion:** Tasteful — staggered card reveals, pulsing agent dots, hover lifts
- **Colours:** Teal (Payments), Amber (Markets), Violet (AI), Rose (Growth)

---

## Phases Shipped

- [x] **Phase 1** — Scout + Analyst agents + React UI shell
- [x] **Phase 2** — Connector agent (workflow mapping)
- [x] **Phase 3** — Briefer + Morning Brief hero view
- [x] **Phase 4** — Learner + Export (clipboard, markdown, txt)
- [x] **Phase 5** — GitHub Actions scheduler + weekly dispatch
- [x] **Phase 6** — Production Vite build + GitHub Pages deploy
- [x] **Phase 7** — Gmail email digest to both inboxes
- [x] **Phase 8** — Expanded 4-domain coverage (49 query recipes)

### Roadmap
- [ ] Phase 9 — Streamlit companion CLI
- [ ] Phase 10 — Notion / Slack webhook integrations
- [ ] Phase 11 — Skip-list training (auto-filter junk repos)
- [ ] Phase 12 — Per-domain confidence calibration

---

## The Story Behind It

I run payments operations at Redpin. I trade NIFTY options. I'm building Reel IQ on the side. I automate everything I can.

Four domains. One brain. Not enough hours in the day.

Most AI tools give you more information. I needed something that tells me what to act on. So I built the Intelligence Station — the AI equivalent of a chief of staff who actually knows my business.

It runs every Monday before I'm awake. By 6:30 AM, my brief is waiting.

That's the compounding edge.

---

*Progress > perfection. Behavior over ambition.*

🔗 [github.com/Thesoulofsuccess/github-intel-station](https://github.com/Thesoulofsuccess/github-intel-station)
🌐 [thesoulofsuccess.github.io/github-intel-station](https://thesoulofsuccess.github.io/github-intel-station)
