// briefer.js — Agent 4: The Briefer
// Job: Chief of staff. Reads all Analyst + Connector outputs for a batch,
// ranks by urgency × opportunity, writes ONE executive briefing.
// Output is what Vikash reads first — decisive, ranked, actionable.

import { callClaudeJSON } from '../api/claude.js';

const BRIEFER_SYSTEM = `You are the Briefer — the chief of staff agent in a GitHub intelligence system built for Vikash Rajan, FinTech COO at Redpin Payments, Mumbai.

You receive a batch of scored and connected GitHub repositories. Your job is to synthesise everything into ONE ranked executive briefing that Vikash reads in under 2 minutes.

VIKASH'S CONTEXT (always factor this in):
- Running Redpin Payments: ACH/NACHA, JP Morgan Chase + Cross River Bank integrations, compliance, fraud ops
- NIFTY options trading: CE/PE framework, first 5-minute candle signal
- Building Reel IQ: Python/Streamlit content intelligence SaaS for influencers
- Automation stack: n8n + Google Apps Script + Sheets

RANKING FORMULA — rank top picks by: urgency × opportunity
- urgency: high=3, medium=2, low=1
- opportunity: primary domain score / 100
- multiply and sort descending

RULES:
- executive_summary: 3-4 sentences. What week is this, overall signal quality, the single most important thing.
- top_picks: max 5. Each gets ONE punchy headline (under 12 words), a why_now, and a concrete action.
- action must be specific: "Fork and test against your ACH reconciliation data" not "Consider evaluating"
- skip_list: repos not worth Vikash's attention this cycle, with a one-line reason each
- Write as if briefing a COO before their morning standup — precise, no filler, no hedging

Respond ONLY with valid JSON, no markdown:
{
  "briefing_date": "ISO date string",
  "executive_summary": "string",
  "signal_quality": "strong|moderate|weak",
  "top_picks": [
    {
      "rank": 1,
      "repo_id": "owner/repo",
      "headline": "short punchy headline",
      "why_now": "one sentence",
      "action": "specific thing to do",
      "urgency": "high|medium|low",
      "primary_workflow": "redpin|nifty|reel_iq|automation|general"
    }
  ],
  "skip_list": [
    { "repo_id": "owner/repo", "reason": "one line" }
  ],
  "total_scanned": 0,
  "domains_covered": ["string"]
}`;

/** Generate a full briefing from a batch of scored + connected repos. */
export async function generateBriefing(repos, analyses, connections) {
  const repoSummaries = repos.map((repo, i) => {
    const a = analyses[i];
    const conn = connections[i];
    const topConn = conn?.connections?.[0];
    return `---
Repo: ${repo.id} | Stars: ${repo.stars} | Language: ${repo.language}
Urgency: ${a.urgency} | Primary domain: ${a.primary_domain} (score: ${a.scores[a.primary_domain].score})
Summary: ${a.summary}
Top workflow connection: ${topConn ? `[${topConn.workflow}/${topConn.impact}] ${topConn.insight}` : 'none'}
Cross-domain: ${conn?.cross_domain ? conn.cross_domain_leap : 'no'}`;
  }).join('\n');

  const userContent = `Today is ${new Date().toISOString().split('T')[0]}.
Batch of ${repos.length} repositories scouted and scored across FinTech, Dev/AI, Trading, and Growth domains.

${repoSummaries}

Write the executive briefing for Vikash.`;

  const result = await callClaudeJSON(BRIEFER_SYSTEM, userContent, 1500);
  result.briefing_date = new Date().toISOString().split('T')[0];
  result.total_scanned = repos.length;
  return result;
}

/** Compute urgency × opportunity rank score for a repo. */
export function rankScore(analysis) {
  const urgencyWeight = { high: 3, medium: 2, low: 1 };
  const u = urgencyWeight[analysis.urgency] || 1;
  const o = analysis.scores[analysis.primary_domain].score / 100;
  return u * o;
}
