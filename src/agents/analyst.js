// analyst.js — Agent 2: The Analyst
// Job: Score a single repo across all 4 dimensions WITH reasoning + confidence.
// Key rule (SKILL.md): every score must carry reasoning text. The "why" is the product.

import { callClaudeJSON } from '../api/claude.js';

const ANALYST_SYSTEM = `You are the Analyst agent in a GitHub intelligence system built for Vikash, a FinTech COO at Redpin Payments (Mumbai, 21+ years in payments/ops/compliance).

You score GitHub repositories across 4 dimensions, each 0-100, each with a short reasoning sentence and a confidence score (0-100 = how much signal you actually had from the repo data provided).

The 4 dimensions:
- fintech: relevance to payments, ACH/NACHA, banking integrations, compliance, financial operations
- dev: relevance to engineering, AI/LLM tooling, developer infrastructure, automation
- trading: relevance to algorithmic/quant trading, options, market data, NIFTY-style strategies
- marketing: relevance to growth, content intelligence, influencer/social analytics, audience tools

Rules:
- Score honestly. A pure ML library may score low on fintech directly but that's fine — the Connector agent handles cross-domain leaps later.
- primary_domain = the single highest-scoring dimension.
- urgency = high if the repo is fast-moving/novel/high-momentum, else medium or low.
- summary = 2-3 sentences, plain executive English, no dev jargon dumps.

Respond with ONLY valid JSON, no markdown, no preamble:
{
  "repo_id": "owner/repo",
  "scores": {
    "fintech": { "score": 0, "reasoning": "", "confidence": 0 },
    "dev": { "score": 0, "reasoning": "", "confidence": 0 },
    "trading": { "score": 0, "reasoning": "", "confidence": 0 },
    "marketing": { "score": 0, "reasoning": "", "confidence": 0 }
  },
  "primary_domain": "fintech|dev|trading|marketing",
  "urgency": "high|medium|low",
  "summary": ""
}`;

/** Analyze (score) a single repo. Returns the typed Analyst contract object. */
export async function analyzeRepo(repo) {
  const userContent = `Score this repository:

Name: ${repo.id}
Description: ${repo.description || '(none)'}
Language: ${repo.language || '(unknown)'}
Stars: ${repo.stars} | Forks: ${repo.forks}
Topics: ${(repo.topics || []).join(', ') || '(none)'}
Last pushed: ${repo.last_pushed}
README excerpt: ${repo.readme_excerpt || '(none)'}`;

  const result = await callClaudeJSON(ANALYST_SYSTEM, userContent, 1200);
  result.repo_id = repo.id; // enforce correct id regardless of model output
  return result;
}

/**
 * Analyze a batch of repos. Runs sequentially in small chunks to respect
 * API limits, but chunks run in parallel internally.
 */
export async function analyzeBatch(repos, { chunkSize = 4, onProgress } = {}) {
  const out = [];
  for (let i = 0; i < repos.length; i += chunkSize) {
    const chunk = repos.slice(i, i + chunkSize);
    const settled = await Promise.allSettled(chunk.map(analyzeRepo));
    settled.forEach((s, j) => {
      if (s.status === 'fulfilled') out.push(s.value);
      else out.push(failedAnalysis(chunk[j], s.reason));
    });
    if (onProgress) onProgress(Math.min(i + chunkSize, repos.length), repos.length);
  }
  return out;
}

/** Fallback analysis object when the API call fails for a repo. */
function failedAnalysis(repo, reason) {
  const blank = { score: 0, reasoning: 'Analysis unavailable', confidence: 0 };
  return {
    repo_id: repo.id,
    scores: { fintech: { ...blank }, dev: { ...blank }, trading: { ...blank }, marketing: { ...blank } },
    primary_domain: 'dev',
    urgency: 'low',
    summary: `Could not analyze: ${reason?.message || 'unknown error'}`,
    _error: true,
  };
}
