# CLAUDE.md — GitHub Intelligence Station
> Claude Code reads this automatically at session start.
> This is the fast-boot file. Full detail is in MEMORY.md and INSTRUCTIONS.md.

---

## ⚡ Fast Boot (read this first, 60 seconds)

**Project**: GitHub Intelligence Station
**Owner**: Vikash — FinTech COO, Redpin Payments, Mumbai
**What it does**: Multi-agent AI talent scout for GitHub — finds best repos, scores them across 4 domains, explains what they mean for Vikash's specific workflows
**Current Phase**: Phase 1 — Scout + Analyst agents + React UI shell

## 🔴 Mandatory Session Start
1. Read `MEMORY.md` → current state + session log
2. Read `SKIP.md` → improvement items to address this session
3. Read `ARCHITECTURE.md` → agent contracts + file structure
4. Confirm phase + next action with Vikash before coding

## 🤖 5 Agents (in order)
Scout → Analyst → Connector → Briefer → Learner

## 4 Scoring Domains
- FinTech/COO → Cyan `#00D4FF`
- Dev & Innovation → Violet `#7C3AED`
- Trading → Emerald `#10B981`
- Marketing & People → Amber `#F59E0B`

## Vikash's Active Workflows (agents must reference these)
- **Redpin**: ACH/NACHA, JP Morgan Chase, Cross River Bank
- **Reel IQ**: Python/Streamlit, influencer content intelligence
- **NIFTY**: CE/PE, first 5-min candle, options trading
- **Automation**: n8n, Google Apps Script, Forms/Sheets

## 🔴 Session End (mandatory)
- Update `MEMORY.md` session log
- Add 3-5 items to `SKIP.md`
- No broken code left uncommitted

## Stack
React + Node.js + GitHub Search API + Anthropic Claude API
Model: `claude-sonnet-4-20250514`
Background: `#07090F` | Fonts: Outfit + JetBrains Mono
