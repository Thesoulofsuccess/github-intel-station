# INSTRUCTIONS.md — GitHub Intelligence Station
> Rules Claude Code must follow in every single session. Non-negotiable.

---

## 🔴 Session Start Protocol (MANDATORY)
Every time a new Claude Code session begins, you MUST:
1. Read `MEMORY.md` — understand project state, owner context, last session
2. Read `SKIP.md` — check what to improve this session
3. Read `ARCHITECTURE.md` — understand system design before touching any file
4. Confirm current phase and next action before writing any code
5. Never assume — ask Vikash if context is ambiguous

---

## 🧠 Who You Are Building For
You are building for **Vikash** — a FinTech COO with 21+ years experience.
- He thinks in systems, not features
- He values *contextual intelligence* over raw data dumps
- He wants to know "so what does this mean for me" — always
- He cares about aesthetics as much as function — premium feel is non-negotiable
- He is building this to scale his decision-making, not to learn to code

Translate everything into his four domains:
- FinTech / COO fit (Redpin, ACH/NACHA, compliance)
- Dev & Innovation (tooling, AI, infra)
- Trading (NIFTY CE/PE, quant signals)
- Marketing & People (Reel IQ, influencer tools, growth)

---

## 💻 Code Standards
- **Language**: React (JSX) for frontend, Node.js for backend/orchestration
- **AI Model**: Always use `claude-sonnet-4-20250514`
- **Styling**: Tailwind utility classes only. No inline style dumps.
- **Colors**: Use design tokens from ARCHITECTURE.md — never hardcode hex outside tokens
- **Fonts**: Outfit for UI text, JetBrains Mono for data/code/scores
- **No dead code**: Remove any file, function, or component that isn't actively used
- **Comments**: Every function must have a one-line purpose comment
- **Error handling**: Every API call must have try/catch with a user-visible error state

---

## 🤖 Agent Prompting Rules
When writing prompts for the 5 agents:
- Be **specific about Vikash's context** in every system prompt
- Each agent gets ONE job — no scope creep between agents
- Output contracts must be **typed JSON** — no free-form text between agents
- Connector agent must always reference at least one of Vikash's 4 active workflows
- Briefer must write in **executive summary style** — concise, ranked, actionable

---

## 🎨 UI/UX Rules
- Dark background: `#07090F` always
- Bloomberg terminal meets mission briefing — data-dense but intentional
- Every piece of data shown must answer: "why does Vikash need to see this?"
- Loading states must exist for every async operation
- Mobile-responsive is nice-to-have, desktop-first is the priority

---

## 🔄 Session End Protocol (MANDATORY)
At the end of every session, you MUST:
1. Update `MEMORY.md` — add session to log, update last session summary, tick phase checkboxes
2. Update `SKIP.md` — add 3-5 specific improvement items for next session
3. Commit message format: `[Phase X] Brief description — Session YYYY-MM-DD`
4. Never leave broken code — if something is incomplete, wrap it in a clear TODO comment

---

## ❌ Never Do
- Never use `localStorage` for sensitive tokens (GitHub PAT, Anthropic API key)
- Never hardcode API keys anywhere — use `.env` always
- Never skip the session start protocol even if "just making a small change"
- Never build Phase 2+ features before Phase 1 is working end-to-end
- Never use generic UI components — everything should feel custom and premium
- Never remove the MEMORY.md session log entry

---

## ✅ Always Do
- Read SKIP.md improvement items and address at least 2 per session
- Test every agent prompt with a real GitHub repo before shipping
- Keep agent output contracts in sync with ARCHITECTURE.md
- Update the phase checklist in MEMORY.md when milestones are hit
