---
name: github-intelligence-station
description: >
  Multi-agent AI talent scouting system for GitHub. ALWAYS use this skill when working on
  the GitHub Intelligence Station project — any session involving agents (Scout, Analyst,
  Connector, Briefer, Learner), GitHub Search API integration, repo scoring, domain query
  recipes, briefing generation, or the React UI. Also triggers for any request to improve,
  extend, debug, or refactor any part of this project. When in doubt about project context,
  architecture decisions, or how agents should behave — consult this skill first.
---

# GitHub Intelligence Station — Project Skill

A multi-agent AI system that scouts GitHub for the best repos, scores them across 4 domains,
maps cross-domain relevance to Vikash's specific workflows, and delivers executive intelligence briefings.

---

## 🔴 Session Start Protocol (ALWAYS DO THIS FIRST)

Before writing a single line of code or making any decision:

1. Read `MEMORY.md` — project state, phase, last session summary
2. Read `SKIP.md` — pick ≥2 improvement items to address this session
3. Read `ARCHITECTURE.md` — agent contracts, design tokens, file structure
4. Confirm current phase + next action with Vikash

**Never skip this. Even for "small" changes.**

---

## 👤 Owner Context

**Vikash** — FinTech COO, Redpin Payments, Mumbai, 21+ years experience

### 4 Active Workflows (agents must always reference these)
| Workflow | Context |
|----------|---------|
| **Redpin** | ACH/NACHA infrastructure, JP Morgan Chase + Cross River Bank integrations |
| **Reel IQ** | Python/Streamlit AI SaaS for influencer content intelligence |
| **NIFTY Trading** | CE/PE framework, first 5-minute candle analysis, options |
| **Automation** | n8n, Google Apps Script, Google Forms/Sheets |

The Connector agent's entire value is bridging *any* repo — even outside Vikash's domain — to one of these 4 workflows.

---

## 🤖 The 5-Agent Pipeline

```
Scout → Analyst → Connector → Briefer → Learner
```

Each agent has ONE job. Do not let scope bleed between agents.

### Agent 1 — Scout
- **Input**: Domain query recipe + date range
- **Job**: Search GitHub, return raw repo list
- **Key rule**: Runs in parallel across all 4 domains — never sequentially
- **Output contract**: See `ARCHITECTURE.md` → Agent Contracts → Scout

### Agent 2 — Analyst
- **Input**: Single repo object from Scout
- **Job**: Score across 4 dimensions with reasoning + confidence
- **Key rule**: Every score MUST have reasoning text — the "why" is the product
- **Output contract**: See `ARCHITECTURE.md` → Agent Contracts → Analyst

### Agent 3 — Connector
- **Input**: Analyst output + Vikash's 4 workflow contexts
- **Job**: Map repo relevance to Vikash's specific workflows — including cross-domain leaps
- **Key rule**: Must reference at least one of the 4 active workflows explicitly
- **Output contract**: See `ARCHITECTURE.md` → Agent Contracts → Connector

### Agent 4 — Briefer
- **Input**: All Analyst + Connector outputs for a batch
- **Job**: Chief of staff — synthesize into one ranked executive briefing
- **Key rule**: Rank by urgency × opportunity, not just score. Write in executive summary style.
- **Output contract**: See `ARCHITECTURE.md` → Agent Contracts → Briefer

### Agent 5 — Learner
- **Input**: User feedback events (thumbs up/down per repo)
- **Job**: Update domain scoring weights based on feedback signals
- **Key rule**: Weights stored in localStorage (v1), upgrade path to Supabase
- **Output contract**: See `ARCHITECTURE.md` → Agent Contracts → Learner

---

## 🎨 Design System (Non-Negotiable)

| Token | Value |
|-------|-------|
| Background | `#07090F` |
| Surface | `#0D1117` |
| Elevated | `#161B22` |
| Border | `#21262D` |
| FinTech (Cyan) | `#00D4FF` |
| Dev (Violet) | `#7C3AED` |
| Trading (Emerald) | `#10B981` |
| Marketing (Amber) | `#F59E0B` |
| UI Font | Outfit (300/400/500/600) |
| Data Font | JetBrains Mono (400/700) |

**Aesthetic**: Bloomberg terminal × mission briefing — data-dense, every pixel intentional, premium feel.

---

## 🏗️ Build Phases

- **Phase 1** — Scout + Analyst agents + React UI shell
- **Phase 2** — Connector agent (cross-domain mapping)
- **Phase 3** — Briefer + full UI (mission briefing format)
- **Phase 4** — Learner + export (PDF, email digest, feedback loop)

**Rule**: Never build Phase N+1 features before Phase N works end-to-end.

---

## 💻 Code Standards

- **Model**: Always `claude-sonnet-4-20250514`
- **Styling**: Tailwind utility classes only — no inline style dumps
- **Colors**: Use design tokens from ARCHITECTURE.md — never hardcode hex values
- **Agent I/O**: Typed JSON contracts — no free-form text passing between agents
- **Error handling**: Every API call needs try/catch + user-visible error state
- **Loading states**: Every async operation needs a loading indicator
- **Comments**: Every function needs a one-line purpose comment
- **No dead code**: Remove unused files, functions, and components immediately

---

## 🔑 GitHub Search Query Recipes

Domain-specific search patterns for the Scout agent:

```javascript
const QUERY_RECIPES = {
  fintech: [
    'topic:fintech pushed:>DATE stars:>100',
    'topic:payments pushed:>DATE stars:>100',
    'topic:open-banking pushed:>DATE stars:>50',
  ],
  dev: [
    'topic:llm-agents pushed:>DATE stars:>200',
    'topic:ai-tools pushed:>DATE stars:>150',
    'topic:developer-tools pushed:>DATE stars:>300',
  ],
  trading: [
    'topic:algorithmic-trading pushed:>DATE stars:>50',
    'topic:quantitative-finance pushed:>DATE stars:>50',
    'topic:options-trading pushed:>DATE stars:>30',
  ],
  marketing: [
    'topic:influencer-analytics pushed:>DATE stars:>50',
    'topic:content-intelligence pushed:>DATE stars:>30',
    'topic:social-media-analytics pushed:>DATE stars:>100',
  ],
}
```

Replace `DATE` with 30-day lookback. Run all recipes in parallel.

---

## ⚡ Performance Rules

- Scout runs all 4 domain queries in **parallel** (Promise.all)
- Cache GitHub API responses for **6 hours** minimum
- Max 10 repos per domain per run (configurable via `MAX_REPOS_PER_DOMAIN`)
- GitHub token required — unauthenticated rate limit is 60 req/hr (too low)

---

## 🔄 Session End Protocol (ALWAYS DO THIS)

1. Update `MEMORY.md` — session log entry, last session summary, phase checkbox ticks
2. Update `SKIP.md` — mark completed items ✅, add 3-5 new improvement items
3. Commit message format: `[Phase X] Description — YYYY-MM-DD`
4. No broken code left uncommitted — wrap incomplete work in clear TODO comments

---

## ❌ Hard Rules — Never Violate

- Never store API keys in code — `.env` always
- Never pass free-form text between agents — typed JSON contracts only
- Never skip session start protocol
- Never build ahead of current phase
- Never use generic UI — everything must feel custom and premium
- Never remove MEMORY.md session log entries

---

## 📁 Key File Locations

| File | Purpose |
|------|---------|
| `MEMORY.md` | Session memory + phase tracker |
| `INSTRUCTIONS.md` | Full Claude Code rules |
| `SKIP.md` | Living improvement backlog |
| `ARCHITECTURE.md` | Agent contracts + design tokens |
| `CLAUDE.md` | 60-second fast-boot |
| `src/agents/` | All 5 agent implementations |
| `src/queries/recipes.js` | GitHub Search query recipes |
| `src/api/github.js` | GitHub API helpers |
| `src/api/claude.js` | Anthropic API helpers |
| `.env.example` | Environment variable template |
