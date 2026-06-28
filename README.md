# 🔭 GitHub Intelligence Station

> *"What's worth your attention today."*

A fully autonomous, 5-agent AI system that scouts all of GitHub every Monday morning, scores the best repos with reasoning, maps each one to your specific workflows, finds the **capability gaps in your own stack**, and emails you one ranked executive brief — before your standup.

Discovery is no longer caged to topic tags: it runs **three lanes** (topic + full-text keyword + velocity/wildcard), scores a **notability** axis so off-thesis brilliance still surfaces, and ships **one-click install commands** for Claude Code, Codex, or any other tool.

Built by **Vikash Rajan** · FinTech COO, Redpin Payments, Mumbai.
Powered by **Claude Opus** (`claude-opus-4-5`, configurable via `ANTHROPIC_MODEL`) · Deployed on **GitHub Actions** + **GitHub Pages**.

🌐 **Live app:** [thesoulofsuccess.github.io/github-intel-station](https://thesoulofsuccess.github.io/github-intel-station)

---

## How It Works

```
Every Monday 6:30 AM IST
        ↓
┌─────────────────────────────────────────────┐
│  Agent 1 — Scout                            │
│  3 discovery lanes: topic tags + full-text  │
│  keyword (finds UNTAGGED repos) + velocity/ │
│  wildcard (just-shipped rockets). Ranked by │
│  overlap × star-velocity × log(stars).      │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Agent 2 — Analyst                          │
│  Scores 0-100 across 4 domains + a 5th      │
│  NOTABILITY axis (impressive even if it     │
│  fits no domain). Reasoning + confidence.   │
│  Off-thesis greatness survives the filter.  │
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
│  Agent 5 — Gap Scout                        │
│  Holds the week's most notable repos up     │
│  against YOUR stack (systems_manifest.json) │
│  → capability gaps + how to close them,     │
│  with install commands per tool.            │
└──────────────────┬──────────────────────────┘
                   ↓
       📧 Email digest to your inbox
       🌐 Full brief + Gap Scout panel on the web app
       📁 brief.json + adoption.md committed to repo
```

> The frontend still has a thumbs-up/down **Learner** panel that nudges local domain weights (`localStorage`). Agent 5 in the pipeline is now **Gap Scout** — the gap-analysis + adoption engine.

---

## Discovery — 3 lanes, not just topic tags

The old scout could only see repos a maintainer had manually tagged with one of our topics, and only if they were already popular. v3 fixes that:

| Lane | What it catches |
|------|-----------------|
| **Topic** | On-thesis repos tagged with our domain topics (the established players). |
| **Keyword** | Full-text search over name/description/readme with a low star floor — finds **untagged** gems the topic lane is blind to. |
| **Velocity / Wildcard** | Domain-agnostic, recently-created repos with traction — **just-shipped rockets**, regardless of category. |

Results merge, dedupe, and rank by `overlap × star-velocity × log(stars)` — so a fast-rising 80-star launch can beat a stale 5k-star repo. All queries live in a single source of truth: [`scripts/recipes.json`](scripts/recipes.json) (re-exported by the UI via `src/queries/recipes.js`, so the two never drift).

## The 4 Domains

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

## Gap Scout — find what your own stack is missing

Most repo tools tell you what exists. Gap Scout tells you **what you don't have yet.** It compares the week's most notable repos against [`scripts/systems_manifest.json`](scripts/systems_manifest.json) — a manifest of your actual systems (Redpin ops, this Intelligence Station, Reel IQ, NIFTY tooling, Automation stack) — and reports concrete **capability gaps**: what these repos do that yours don't, which system it upgrades, and the specific enhancement to make.

Keep `systems_manifest.json` honest and current — it's the mirror the gap analysis holds up.

## One-click adoption — install into any tool

Every recommended repo **and** every gap ships copy-able install commands, with the right mechanism auto-detected (MCP server / plugin / skill / clone):

| Target | Example |
|--------|---------|
| **Claude Code** | `claude mcp add <name> -- npx -y <pkg>` · `/plugin install …` · clone into `~/.claude/skills/` |
| **Codex** | MCP entry in `~/.codex/config.toml`, or clone + reference in `AGENTS.md` |
| **Any tool** | `git clone …` (+ `pip install -e .` / `npm install` by language) |

These land in `public/brief.json` (per repo + per gap), in a generated [`public/adoption.md`](public/adoption.md) drop-in sheet, and behind an **`install +`** toggle on every card in the web app.

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
│   ├── run_pipeline.py        ← Full 5-agent pipeline (Scout→…→Gap Scout)
│   ├── recipes.json           ← SINGLE SOURCE OF TRUTH: all discovery queries + config
│   ├── systems_manifest.json  ← Your stack — what Gap Scout measures gaps against
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
│   │   └── recipes.js         ← thin re-export of scripts/recipes.json (no drift)
│   └── utils/
│       └── export.js          ← Clipboard / markdown / txt export
│
├── public/
│   ├── brief.json             ← Latest brief (auto-updated weekly)
│   ├── adoption.md            ← Generated install/adoption sheet
│   ├── weights.json           ← Learner domain weights (UI)
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
- [x] **Phase 8** — Expanded 4-domain coverage
- [x] **Phase 9 (v3)** — Multi-lane discovery (topic + keyword + velocity/wildcard), notability axis, Gap Scout, per-tool install/adoption, single-source `recipes.json`

### Roadmap
- [ ] Phase 10 — Persistent memory of past picks (never resurface the same repo; feedback-driven weights server-side)
- [ ] Phase 11 — Auto-discover new topics from top repos (self-growing taxonomy)
- [ ] Phase 12 — Notion / Slack webhook integrations + Streamlit companion CLI

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
