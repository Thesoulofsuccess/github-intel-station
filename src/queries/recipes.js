// recipes.js — GitHub Search query recipes per domain
// Each domain has multiple query patterns. {DATE} is replaced with a lookback date.

/** Build a lookback date string (YYYY-MM-DD) N days ago. */
export function lookbackDate(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

/** Domain query recipes. {DATE} placeholder replaced at runtime. */
export const QUERY_RECIPES = {
  fintech: [
    'topic:fintech pushed:>{DATE} stars:>100',
    'topic:payments pushed:>{DATE} stars:>100',
    'topic:open-banking pushed:>{DATE} stars:>50',
  ],
  dev: [
    'topic:llm-agents pushed:>{DATE} stars:>200',
    'topic:ai-tools pushed:>{DATE} stars:>150',
    'topic:developer-tools pushed:>{DATE} stars:>300',
  ],
  trading: [
    'topic:algorithmic-trading pushed:>{DATE} stars:>50',
    'topic:quantitative-finance pushed:>{DATE} stars:>50',
    'topic:options-trading pushed:>{DATE} stars:>30',
  ],
  marketing: [
    'topic:influencer-analytics pushed:>{DATE} stars:>50',
    'topic:content-intelligence pushed:>{DATE} stars:>30',
    'topic:social-media-analytics pushed:>{DATE} stars:>100',
  ],
};

/** Resolve a recipe template into a runnable query string. */
export function resolveQuery(template, days = 30) {
  return template.replace('{DATE}', lookbackDate(days));
}

export const DOMAINS = ['fintech', 'dev', 'trading', 'marketing'];

export const DOMAIN_META = {
  fintech:   { label: 'FinTech / COO',     color: '#00D4FF' },
  dev:       { label: 'Dev & Innovation',  color: '#7C3AED' },
  trading:   { label: 'Trading & Investing', color: '#10B981' },
  marketing: { label: 'Marketing & People', color: '#F59E0B' },
};
