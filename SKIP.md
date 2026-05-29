# SKIP.md — Session Improvement Log
> This file MUST be updated at the end of every session.
> Claude Code reads this at session start and must address ≥2 items per session.
> Items are never deleted — they are marked DONE with date and moved to the archive.

---

## 🔴 Current Improvement Queue

### UX & Design
- [ ] `UX-001` — Design the mission briefing layout before writing any component code. Wireframe first, build second.
- [ ] `UX-002` — Every score must display its *reasoning text*, not just a number. The "why" is the product.
- [ ] `UX-003` — Add a repo "ignore" button so Vikash can train the scout to never surface certain repos again

### Agent Quality
- [x] `AGT-001` — Write and test the GitHub Search query recipes for all 4 domains before wiring to Scout agent ✅ 2026-05-30
- [ ] `AGT-002` — Connector agent prompt needs Vikash's 4 active workflow contexts baked in explicitly (Redpin, Reel IQ, NIFTY, automation)
- [ ] `AGT-003` — Briefer agent must rank by urgency × opportunity, not just score. Define the formula.
- [x] `AGT-004` — Add a "confidence score" to Analyst output — how much signal did the agent actually have to work with? ✅ 2026-05-30

### Architecture
- [ ] `ARC-001` — Define the typed JSON output contract for each agent before writing any agent code
- [ ] `ARC-002` — GitHub Search API rate limits — plan the batching and caching strategy from day 1
- [ ] `ARC-003` — Plan the `.env` variable structure and document it in ARCHITECTURE.md

### Performance
- [x] `PRF-001` — Scout agent should run in parallel across all 4 domain query recipes, not sequentially ✅ 2026-05-30 (Promise.allSettled)
- [x] `PRF-002` — Cache GitHub API responses for 6 hours minimum — avoid redundant calls ✅ 2026-05-30 (localStorage cache in github.js)

### Phase 2+ (Parking Lot)
- [ ] `P2-001` — Learner agent: design the feedback schema (what signal does thumbs up/down capture?)
- [ ] `P2-002` — Export: PDF briefing format — decide layout before Phase 4
- [ ] `P2-003` — Email digest: weekly summary format

---

### 🆕 Added 2026-05-30 (post Phase 1 build)
- [ ] `NEW-001` — Wire App.jsx to call real runScout() + analyzeBatch() with a token-entry UI (secure, not localStorage for keys)
- [ ] `NEW-002` — Add error-state UI in App.jsx when GitHub rate limit hit or Claude call fails
- [ ] `NEW-003` — Test Analyst prompt against 5 real diverse repos; tune scoring so cross-domain repos don't get artificially low primary scores
- [ ] `NEW-004` — Build Phase 2 Connector agent (connector.js) per ARCHITECTURE.md contract
- [ ] `NEW-005` — Add a "confidence < 50" visual warning on RepoCard so low-signal scores are flagged

## ✅ Completed Items Archive

| ID | Item | Done Date | Session Notes |
|----|------|-----------|---------------|
| AGT-001 | GitHub Search query recipes for 4 domains | 2026-05-30 | recipes.js — 3 patterns per domain |
| AGT-004 | Confidence score in Analyst output | 2026-05-30 | 0-100 per dimension |
| PRF-001 | Parallel Scout execution | 2026-05-30 | Promise.allSettled across all recipes |
| PRF-002 | 6-hour GitHub response cache | 2026-05-30 | localStorage-backed in github.js |

---

## 📋 How to Use This File

**Claude Code at session start:**
1. Read all 🔴 Current items
2. Pick the 2-3 most relevant to the current phase
3. Address them during the session
4. At session end: mark done items ✅, move to archive, add 3-5 new items

**Vikash:**
- Add items here anytime you notice something to improve
- Flag priority items with 🔥 prefix
- This file is your running product backlog for code quality
