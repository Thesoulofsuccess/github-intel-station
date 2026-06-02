# 🔭 GitHub Intelligence Station

> *"What's worth your attention today."*

A fully autonomous, 5-agent AI system that scouts all of GitHub every Monday morning, scores the best repos across your domains, maps them to your specific workflows, and delivers one ranked executive brief — before your standup.

Built by **Vikash Rajan** · FinTech COO, Redpin Payments, Mumbai.

---

## How It Works

```
Every Monday 6:30 AM IST
        ↓
┌─────────────────────────────────────────────┐
│  Agent 1 — Scout                            │
│  Searches GitHub across 4 domains in        │
│  parallel. Finds the best repos from the    │
│  last 30 days. Not just what you follow —   │
│  all of GitHub.                             │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Agent 2 — Analyst                          │
│  Scores each repo 0-100 across 4 dimensions │
│  with reasoning + confidence. Powered by    │
│  Claude Opus 4.                             │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Agent 3 — Connector                        │
│  Maps each repo to your 4 active workflows: │
│  Redpin · NIFTY · Reel IQ · Automation.     │
│  The "so what for me" layer.                │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Agent 4 — Briefer                          │
│  Chief of staff. Ranks by urgency ×         │
│  opportunity. Writes one decisive executive │
│  brief with specific actions.               │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  Agent 5 — Learner                          │
│  Thumbs up/down on picks updates domain     │
│  weights. Every signal makes next week's    │
│  brief smarter.                             │
└──────────────────┬──────────────────────────┘
                   ↓
         public/brief.json
         (committed to repo)
                   ↓
         React UI reads it
         Brief is waiting for you
```

---

## The 4 Scoring Domains

| Domain | Color | What It Covers |
|--------|-------|---------------|
| FinTech / COO | 🩵 Teal | ACH/NACHA, payments, banking integrations, compliance, fraud |
| Dev & AI | 💜 Violet | LLM agents, developer tooling, infrastructure, automation |
| Trading | 🟡 Amber | NIFTY options, CE/PE, quant, algorithmic trading |
| Growth | 🌸 Rose | Influencer analytics, content intelligence, audience tools |

---

## Your 4 Active Workflows

Every repo is mapped to at least one of these:

- **Redpin** — ACH/NACHA infrastructure, JP Morgan Chase + Cross River Bank integrations, KYC, fraud scoring, reconciliation
- **NIFTY** — CE/PE options framework, first 5-minute candle analysis, trade journaling
- **Reel IQ** — Python/Streamlit content intelligence SaaS for influencers, Claude API
- **Automation** — n8n, Google Apps Script, Google Forms/Sheets, reducing manual ops

---

## Where to Find Your Brief

### Option 1 — GitHub Actions (automatic every Monday)
```
github.com/Thesoulofsuccess/github-intel-station
→ Actions tab
→ Latest "Weekly Scout" run
→ See logs from all 5 agents live
```

### Option 2 — brief.json (raw output)
```
github.com/Thesoulofsuccess/github-intel-station
→ public/brief.json
→ Updated every Monday automatically
```

### Option 3 — React UI (coming: GitHub Pages deploy)
```
thesoulofsuccess.github.io/github-intel-station
→ Morning Brief view (default)
→ Repo Feed with filters
→ Export to clipboard / markdown
```

### Option 4 — Run manually anytime
```
github.com/Thesoulofsuccess/github-intel-station
→ Actions tab
→ "Intelligence Station — Weekly Scout"
→ "Run workflow" button → Run
```

---

## Project Structure

```
github-intel-station/
│
├── .github/workflows/
│   └── scout.yml              ← GitHub Actions scheduler (Mon 6:30 AM IST)
│
├── scripts/
│   └── run_pipeline.py        ← Full 5-agent pipeline (pure Python, no deps)
│
├── src/
│   ├── App.jsx                ← React UI (Editorial Discovery design)
│   ├── agents/
│   │   ├── scout.js           ← Agent 1: GitHub Search
│   │   ├── analyst.js         ← Agent 2: Scoring
│   │   ├── connector.js       ← Agent 3: Workflow mapping
│   │   ├── briefer.js         ← Agent 4: Executive brief
│   │   └── learner.js         ← Agent 5: Feedback weights
│   ├── api/
│   │   ├── github.js          ← GitHub API helper + cache
│   │   └── claude.js          ← Anthropic API helper
│   ├── queries/
│   │   └── recipes.js         ← GitHub Search query recipes
│   └── utils/
│       └── export.js          ← Clipboard / markdown / txt export
│
├── public/
│   ├── brief.json             ← Latest brief (auto-updated every Monday)
│   └── weights.json           ← Learner domain weights
│
├── MEMORY.md                  ← Session memory for Claude Code
├── INSTRUCTIONS.md            ← Claude Code rules
├── SKIP.md                    ← Self-improving backlog
├── ARCHITECTURE.md            ← System design + agent contracts
├── CLAUDE.md                  ← Claude Code fast-boot
├── SKILL.md                   ← Auto-trigger skill
└── .env.example               ← Environment variable template
```

---

## Setup (run once on your machine)

### 1. Clone
```bash
git clone https://github.com/Thesoulofsuccess/github-intel-station
cd github-intel-station
```

### 2. Create .env
```bash
cp .env.example .env
# Fill in your keys:
GITHUB_TOKEN=your_github_classic_token   # needs: repo + workflow scope
ANTHROPIC_API_KEY=your_anthropic_key
```

### 3. Run pipeline manually
```bash
python3 scripts/run_pipeline.py
# Brief saved to public/brief.json
```

### 4. View the UI
```bash
npm install
npm start
# Opens at localhost:3000
```

---

## GitHub Actions Setup (already done ✅)

Two secrets are set in the repo:

| Secret | What it is |
|--------|-----------|
| `GH_SCOUT_TOKEN` | GitHub PAT (repo + workflow scope) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Opus 4 |

Schedule: **Every Monday at 1:00 AM UTC (6:30 AM IST)**

To change the schedule, edit `.github/workflows/scout.yml` → `cron` value.

---

## Session Continuity (Claude Code)

This project uses a 5-file protocol for Claude Code sessions:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | 60-second fast-boot |
| `MEMORY.md` | Session log + phase tracker |
| `INSTRUCTIONS.md` | Rules for every session |
| `SKIP.md` | Self-improving backlog |
| `ARCHITECTURE.md` | Agent contracts + design tokens |

Every Claude Code session starts by reading these. Every session ends by updating them.

---

## Design

**"Editorial Discovery"** — not a finance terminal. Typography-led, calm, adaptive.

- **Display font**: Spectral (serif) — editorial voice
- **Data font**: IBM Plex Mono — scores, metadata, agent status
- **Themes**: Light + Dark toggle
- **Motion**: Tasteful — staggered reveals, pulsing agent dots, hover lifts

---

## Roadmap

- [x] Phase 1 — Scout + Analyst agents + React UI shell
- [x] Phase 2 — Connector agent (workflow mapping)
- [x] Phase 3 — Briefer + Morning Brief hero view
- [x] Phase 4 — Learner + Export (clipboard, markdown, txt)
- [x] Phase 5 — GitHub Actions scheduler + weekly dispatch
- [ ] Phase 6 — GitHub Pages deploy (public URL)
- [ ] Phase 7 — Email digest (brief to inbox every Monday)
- [ ] Phase 8 — Streamlit companion app

---

*Progress > perfection. Behavior over ambition.*
