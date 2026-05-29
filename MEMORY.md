# MEMORY.md — GitHub Intelligence Station
> Persistent project memory. Updated at the end of every session.
> Claude Code must read this FIRST before any action.

---

## 👤 Owner
- **Name**: Vikash
- **Role**: Senior FinTech Leader (COO/VP Operations level)
- **Company**: Redpin Payments, Mumbai
- **Experience**: 21+ years in payments, operations, compliance

## 🏗️ What This Project Is
A **multi-agent AI talent scouting system** that:
- Scans all of GitHub (not just starred repos) for the best, most relevant new work
- Uses 5 specialized AI agents to discover, analyze, connect, brief, and learn
- Delivers personalized intelligence briefings: "here's what this means *for Vikash specifically*"
- Surfaces cross-domain insights (e.g. ML advances → FinTech fraud detection relevance)

## 🎯 4 Scoring Dimensions
| Dimension | Color | Domain |
|---|---|---|
| FinTech / COO Fit | Cyan `#00D4FF` | Payments, ACH/NACHA, compliance, ops |
| Dev & Innovation | Violet `#7C3AED` | Engineering, AI tooling, infra |
| Trading & Investing | Emerald `#10B981` | NIFTY options, CE/PE, quant |
| Marketing & People | Amber `#F59E0B` | Growth, content, influencer tools |

## 🤖 5-Agent Architecture
1. **Scout** — GitHub Search API → finds best repos by domain query recipes
2. **Analyst** — Reads README + commits + issues → scores across 4 dimensions with reasoning
3. **Connector** — Cross-domain mapping → "why this ML repo matters for your FinTech ops"
4. **Briefer** — Chief of staff → synthesizes all agent outputs into one executive briefing
5. **Learner** — Feedback loop → improves scoring weights based on thumbs up/down signals

## 🖥️ Tech Stack
- **Frontend**: React (dark UI, Bloomberg terminal aesthetic)
- **Fonts**: Outfit (UI) + JetBrains Mono (data/code)
- **Background**: `#07090F`
- **Backend/Orchestration**: Node.js
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Data Source**: GitHub Search API + GitHub REST API
- **Automation**: GitHub Actions dispatch
- **Persistence**: localStorage (v1), upgrade path to Supabase

## 📦 Active Contexts (Vikash's workflows the agents must understand)
- **Redpin Payments**: ACH/NACHA, JP Morgan Chase + Cross River Bank integrations
- **Reel IQ**: Python/Streamlit AI SaaS for content influencers
- **NIFTY Trading**: CE/PE framework, first 5-minute candle analysis
- **Automation Stack**: Google Forms/Sheets/Apps Script, n8n

## 🗓️ Build Sequence
- [~] **Phase 1**: Scout + Analyst — GitHub Search → Score (with UI) *(in progress — agents + UI built, live-key wiring pending)*
- [ ] **Phase 2**: Connector agent — cross-domain mapping
- [ ] **Phase 3**: Briefer + full UI (mission briefing format, premium feel)
- [ ] **Phase 4**: Learner + export (PDF, email digest, feedback loop)

## 📌 Last Session Summary
- Phase 1 built: Scout agent (parallel GitHub Search, dedupe, README enrichment), Analyst agent (4-dimension scoring with reasoning + confidence)
- API helpers built: github.js (search + readme + 6hr cache), claude.js (JSON parsing, model constant flagged for Opus 4.8 swap under Claude Code)
- Query recipes built for all 4 domains (recipes.js)
- React UI shell built (App.jsx): Bloomberg-terminal aesthetic, ScoreRing/ScoreBar/UrgencyBadge/RepoCard, domain filtering, live Scout→Analyst status pipeline, demo-data preview mode
- Model note: in-artifact API uses claude-sonnet-4-20250514; swap MODEL constant in claude.js to Opus 4.8 when running on own keys
- UI fully redesigned: dropped finance-terminal aesthetic for "Editorial Discovery" (Spectral serif + IBM Plex Mono), light/dark toggle, tasteful staggered motion, adaptive cards
- Design tokens updated in ARCHITECTURE.md; domain colors retuned to read on both themes
- Next action: Push Phase 1 to GitHub, then build Phase 2 Connector agent

## 🔁 Session Log
| Date | What Was Done |
|------|--------------|
| 2026-05-30 | Project reset. Architecture decided. Foundation docs created. |
| 2026-05-30 | Phase 1 built: Scout + Analyst agents, github/claude API helpers, query recipes, React UI shell with live pipeline visualization. |
| 2026-05-30 | UI redesigned to Editorial Discovery (light/dark, Spectral + IBM Plex Mono). Finance-terminal aesthetic dropped. Tokens updated. |
