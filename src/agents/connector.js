// connector.js — Agent 3: The Connector
// Job: Take Analyst output and map each repo to Vikash's 4 active workflows.
// This is the "so what for me specifically" layer — the secret weapon.
// Even repos outside Vikash's domain must yield at least one concrete connection.

import { callClaudeJSON } from '../api/claude.js';

const CONNECTOR_SYSTEM = `You are the Connector agent in a GitHub intelligence system built exclusively for Vikash Rajan — FinTech COO at Redpin Payments, Mumbai, 21+ years in payments, operations and compliance.

Your job is to read a scored GitHub repository and write CONCRETE, SPECIFIC connections to Vikash's 4 active workflows. Not generic observations — actual workflow-level insights a COO would act on.

THE 4 WORKFLOWS YOU MUST REASON AGAINST:

1. REDPIN (FinTech operations)
   - ACH/NACHA payment infrastructure
   - JP Morgan Chase + Cross River Bank integrations
   - Compliance, KYC, AML, reconciliation
   - Payment ops: settlement, disputes, exception handling
   - Real-time fraud detection and anomaly scoring

2. NIFTY TRADING (Personal options trading)
   - CE/PE options framework on NIFTY index
   - First 5-minute candle analysis as signal trigger
   - Intraday momentum and volatility reading
   - Trade journaling and performance review

3. REEL IQ (AI SaaS product)
   - Python + Streamlit frontend
   - Content intelligence for social media influencers
   - Engagement scoring, trend detection, audience analytics
   - Claude API for content analysis
   - Scaling from prototype to product

4. AUTOMATION STACK (Personal productivity)
   - n8n workflow automation
   - Google Apps Script + Forms + Sheets
   - Connecting tools without engineering overhead
   - Reducing manual ops work at Redpin

RULES:
- Every connection must name the specific workflow (redpin/nifty/reel_iq/automation)
- insight must be ONE specific sentence: "Could X to Y" or "Enables Z in your W workflow"
- cross_domain_leap: the non-obvious connection — where a repo outside Vikash's domain still matters
- If a repo has no real connection to a workflow, skip that workflow (don't force it)
- impact: high = directly actionable this week, medium = worth a prototype, low = awareness only
- Minimum 1 connection, maximum 4 (one per workflow)

Respond ONLY with valid JSON, no markdown:
{
  "repo_id": "owner/repo",
  "connections": [
    {
      "workflow": "redpin|nifty|reel_iq|automation",
      "insight": "one specific actionable sentence",
      "impact": "high|medium|low"
    }
  ],
  "cross_domain": true,
  "cross_domain_leap": "the non-obvious bridge explained in one sentence, or null if same-domain"
}`;

/** Connect a single repo's analysis to Vikash's workflows. */
export async function connectRepo(repo, analysis) {
  const userContent = `Repository: ${repo.id}
Description: ${repo.description || '(none)'}
Language: ${repo.language || '(unknown)'}
Topics: ${(repo.topics || []).join(', ') || '(none)'}
Stars: ${repo.stars}

Analyst summary: ${analysis.summary}
Primary domain: ${analysis.primary_domain} (score: ${analysis.scores[analysis.primary_domain].score})
Urgency: ${analysis.urgency}

Scores:
- FinTech: ${analysis.scores.fintech.score} — ${analysis.scores.fintech.reasoning}
- Dev/AI: ${analysis.scores.dev.score} — ${analysis.scores.dev.reasoning}
- Trading: ${analysis.scores.trading.score} — ${analysis.scores.trading.reasoning}
- Growth: ${analysis.scores.marketing.score} — ${analysis.scores.marketing.reasoning}

Write the specific workflow connections for Vikash.`;

  const result = await callClaudeJSON(CONNECTOR_SYSTEM, userContent, 1000);
  result.repo_id = repo.id;
  return result;
}

/** Connect a batch of repos. Runs in parallel chunks. */
export async function connectBatch(repos, analyses, { chunkSize = 4, onProgress } = {}) {
  const out = [];
  for (let i = 0; i < repos.length; i += chunkSize) {
    const chunk = repos.slice(i, i + chunkSize);
    const settled = await Promise.allSettled(
      chunk.map((repo, j) => connectRepo(repo, analyses[i + j]))
    );
    settled.forEach((s, j) => {
      if (s.status === 'fulfilled') out.push(s.value);
      else out.push(failedConnection(chunk[j], s.reason));
    });
    if (onProgress) onProgress(Math.min(i + chunkSize, repos.length), repos.length);
  }
  return out;
}

/** Fallback when connection fails. */
function failedConnection(repo, reason) {
  return {
    repo_id: repo.id,
    connections: [],
    cross_domain: false,
    cross_domain_leap: null,
    _error: true,
    _reason: reason?.message,
  };
}
