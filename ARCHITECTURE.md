# ARCHITECTURE.md — GitHub Intelligence Station
> Source of truth for system design. Update when architecture changes.

---

## 🗺️ System Overview

```
GitHub Search API
       ↓
  [Agent 1: Scout] ─────────────────────────────────────────────
       ↓                                                        |
  Raw Repo List (JSON)                                    Query Recipes
       ↓                                                  (per domain)
  [Agent 2: Analyst]
       ↓
  Scored Repo Report (JSON)
       ↓
  [Agent 3: Connector]
       ↓
  Cross-Domain Insight Report (JSON)
       ↓
  [Agent 4: Briefer]
       ↓
  Executive Briefing (JSON → UI)
       ↓
  [Agent 5: Learner] ← User feedback (thumbs up/down)
       ↓
  Updated scoring weights (localStorage → future: Supabase)
```

---

## 🤖 Agent Contracts

### Agent 1 — Scout
**Input**: Domain query recipe (string) + date range
**Output**:
```json
{
  "query_used": "string",
  "domain": "fintech | dev | trading | marketing",
  "repos": [
    {
      "id": "owner/repo",
      "name": "string",
      "owner": "string",
      "description": "string",
      "stars": 0,
      "forks": 0,
      "last_pushed": "ISO date",
      "topics": ["string"],
      "language": "string",
      "url": "string",
      "readme_excerpt": "string (first 500 chars)"
    }
  ]
}
```

### Agent 2 — Analyst
**Input**: Single repo object from Scout output
**Output**:
```json
{
  "repo_id": "owner/repo",
  "scores": {
    "fintech": { "score": 0, "reasoning": "string", "confidence": 0 },
    "dev": { "score": 0, "reasoning": "string", "confidence": 0 },
    "trading": { "score": 0, "reasoning": "string", "confidence": 0 },
    "marketing": { "score": 0, "reasoning": "string", "confidence": 0 }
  },
  "primary_domain": "fintech | dev | trading | marketing",
  "urgency": "high | medium | low",
  "summary": "string (2-3 sentences)"
}
```
*Scores 0-100. Confidence 0-100 (how much signal agent had).*

### Agent 3 — Connector
**Input**: Analyst output + Vikash's active workflow contexts
**Output**:
```json
{
  "repo_id": "owner/repo",
  "connections": [
    {
      "workflow": "redpin | reel_iq | nifty | automation",
      "insight": "string — specific actionable connection",
      "impact": "high | medium | low"
    }
  ],
  "cross_domain": true,
  "cross_domain_leap": "string — the non-obvious connection explained"
}
```

### Agent 4 — Briefer
**Input**: All Analyst + Connector outputs for a batch
**Output**:
```json
{
  "briefing_date": "ISO date",
  "executive_summary": "string (3-5 sentences)",
  "top_picks": [
    {
      "rank": 1,
      "repo_id": "owner/repo",
      "headline": "string (one punchy line)",
      "why_now": "string",
      "action": "string — what Vikash should do with this"
    }
  ],
  "total_scanned": 0,
  "domains_covered": ["string"]
}
```

### Agent 5 — Learner
**Input**: User feedback event `{ repo_id, signal: "up|down", domain, score_at_feedback }`
**Output**: Updated domain weight adjustments stored to localStorage
```json
{
  "weights": {
    "fintech": 1.0,
    "dev": 1.0,
    "trading": 1.0,
    "marketing": 1.0
  },
  "feedback_count": 0,
  "last_updated": "ISO date"
}
```

---

## 🎨 Design System — "Editorial Discovery"
> The product scouts ALL of GitHub, not just finance. The UI is editorial/discovery,
> NOT a finance terminal. Typography-led, calm, light+dark.

```javascript
const THEMES = {
  dark:  { bg:'#0E0D13', panel:'#16151D', raised:'#1E1C28', line:'#2A2833',
           ink:'#F4F1EA', sub:'#A8A2B8', faint:'#6B6578' },
  light: { bg:'#F7F4EE', panel:'#FFFFFF', raised:'#FBF9F4', line:'#E4DFD4',
           ink:'#1A1822', sub:'#5C5668', faint:'#9A93A6' },
};
// Domain colors tuned to read on BOTH themes
const DOMAIN = {
  fintech:   '#2D9B8F',  // teal
  dev:       '#7C5CFF',  // violet
  trading:   '#D98E2B',  // amber
  marketing: '#C2476B',  // rose
};
```

## 🔤 Typography
- **Display/Body**: `Spectral` (serif) — editorial voice, italic for emphasis
- **Data/Labels**: `IBM Plex Mono` — metadata, scores, agent status
- NO Inter/Roboto/Arial/system fonts. NO finance-terminal aesthetic.

---

## 📁 File Structure
```
github-intel-station/
├── MEMORY.md           ← Session memory (read first)
├── INSTRUCTIONS.md     ← Claude Code rules
├── SKIP.md             ← Improvement backlog
├── ARCHITECTURE.md     ← This file
├── CLAUDE.md           ← Claude Code session continuity
├── .env.example        ← Environment variable template
├── .env                ← Never commit
├── .gitignore
│
├── src/
│   ├── agents/
│   │   ├── scout.js        ← Agent 1
│   │   ├── analyst.js      ← Agent 2
│   │   ├── connector.js    ← Agent 3
│   │   ├── briefer.js      ← Agent 4
│   │   └── learner.js      ← Agent 5
│   │
│   ├── api/
│   │   ├── github.js       ← GitHub Search + REST API helpers
│   │   └── claude.js       ← Anthropic API helper
│   │
│   ├── queries/
│   │   └── recipes.js      ← GitHub Search query recipes per domain
│   │
│   ├── components/
│   │   ├── ScoreRing.jsx
│   │   ├── ScoreBar.jsx
│   │   ├── UrgencyBadge.jsx
│   │   ├── RepoCard.jsx
│   │   └── BriefingPanel.jsx
│   │
│   ├── views/
│   │   ├── ScoutTab.jsx
│   │   ├── BriefingTab.jsx
│   │   ├── InsightsTab.jsx
│   │   └── FeedbackTab.jsx
│   │
│   └── App.jsx
│
├── poller/
│   └── index.js        ← Node.js server-side poller
│
└── .github/
    └── workflows/
        └── scout.yml   ← GitHub Actions dispatch trigger
```

---

## 🔑 Environment Variables
```
GITHUB_TOKEN=           # Personal access token (read:public_repo)
ANTHROPIC_API_KEY=      # Claude API key
SCOUT_INTERVAL_HOURS=6  # How often Scout runs
MAX_REPOS_PER_DOMAIN=10 # Repos to analyze per domain per run
```

---

## 📡 GitHub Search Query Recipes
*(Full recipes in `src/queries/recipes.js`)*

| Domain | Example Query |
|--------|--------------|
| FinTech | `topic:fintech pushed:>2026-04-01 stars:>100` |
| Dev/AI | `topic:llm-agents pushed:>2026-04-01 stars:>200` |
| Trading | `topic:algorithmic-trading pushed:>2026-04-01 stars:>50` |
| Marketing | `topic:influencer-analytics pushed:>2026-04-01 stars:>50` |
