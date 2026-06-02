// recipes.js — GitHub Search query recipes per domain
// Updated: 2026-06-02 — expanded to 4 deep domains
// {DATE} replaced at runtime with 30-day lookback

export function lookbackDate(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export function resolveQuery(template, days = 30) {
  return template.replace(/{DATE}/g, lookbackDate(days));
}

export const DOMAINS = ['payments', 'markets', 'ai_efficiency', 'growth'];

export const DOMAIN_META = {
  payments:      { label: 'Payments & FinTech',   color: '#2D9B8F' },
  markets:       { label: 'Markets & Investing',   color: '#D98E2B' },
  ai_efficiency: { label: 'AI & Efficiency',       color: '#7C5CFF' },
  growth:        { label: 'Growth & Creator',      color: '#C2476B' },
};

export const QUERY_RECIPES = {

  // ── PAYMENTS & FINTECH ─────────────────────────────────────────
  // ACH/NACHA, Open Banking, ISO 20022, blockchain payments,
  // stablecoins, CBDCs, cross-border rails, RegTech, embedded finance
  payments: [
    'topic:fintech pushed:>{DATE} stars:>100',
    'topic:payments pushed:>{DATE} stars:>100',
    'topic:open-banking pushed:>{DATE} stars:>50',
    'topic:blockchain-payments pushed:>{DATE} stars:>50',
    'topic:stablecoin pushed:>{DATE} stars:>80',
    'topic:cbdc pushed:>{DATE} stars:>30',
    'topic:defi pushed:>{DATE} stars:>150',
    'topic:regtech pushed:>{DATE} stars:>30',
    'topic:iso20022 pushed:>{DATE} stars:>20',
    'topic:embedded-finance pushed:>{DATE} stars:>30',
    'topic:cross-border-payments pushed:>{DATE} stars:>20',
    'topic:web3-payments pushed:>{DATE} stars:>50',
  ],

  // ── MARKETS & INVESTING ────────────────────────────────────────
  // NIFTY options, global equities, quant strategies, portfolio
  // rebalancers, financial advisor tools, macro, crypto trading
  markets: [
    'topic:algorithmic-trading pushed:>{DATE} stars:>50',
    'topic:quantitative-finance pushed:>{DATE} stars:>50',
    'topic:options-trading pushed:>{DATE} stars:>30',
    'topic:portfolio-rebalancing pushed:>{DATE} stars:>20',
    'topic:stock-screener pushed:>{DATE} stars:>50',
    'topic:backtesting pushed:>{DATE} stars:>80',
    'topic:financial-advisor pushed:>{DATE} stars:>20',
    'topic:wealth-management pushed:>{DATE} stars:>20',
    'topic:technical-analysis pushed:>{DATE} stars:>80',
    'topic:trading-bot pushed:>{DATE} stars:>100',
    'topic:market-data pushed:>{DATE} stars:>50',
    'topic:risk-management pushed:>{DATE} stars:>50',
    'topic:crypto-trading pushed:>{DATE} stars:>80',
    'topic:factor-investing pushed:>{DATE} stars:>20',
    'topic:earnings-analysis pushed:>{DATE} stars:>20',
  ],

  // ── AI & EFFICIENCY ────────────────────────────────────────────
  // Claude plugins/MCP servers, multi-agent orchestration,
  // AI for financial services, workflow automation, ops efficiency
  ai_efficiency: [
    'topic:llm-agents pushed:>{DATE} stars:>150',
    'topic:ai-tools pushed:>{DATE} stars:>150',
    'topic:mcp-server pushed:>{DATE} stars:>30',
    'topic:claude pushed:>{DATE} stars:>50',
    'topic:anthropic pushed:>{DATE} stars:>50',
    'topic:multi-agent pushed:>{DATE} stars:>80',
    'topic:workflow-automation pushed:>{DATE} stars:>100',
    'topic:n8n pushed:>{DATE} stars:>50',
    'topic:ai-finance pushed:>{DATE} stars:>30',
    'topic:llm-finance pushed:>{DATE} stars:>20',
    'topic:prompt-engineering pushed:>{DATE} stars:>100',
    'topic:rag pushed:>{DATE} stars:>150',
    'topic:ai-automation pushed:>{DATE} stars:>100',
    'topic:developer-tools pushed:>{DATE} stars:>300',
    'topic:productivity pushed:>{DATE} stars:>200',
  ],

  // ── GROWTH & CREATOR ───────────────────────────────────────────
  // YouTube Shorts, TikTok, Reels analytics, creator intelligence,
  // content repurposing, AI video tools, audience growth, Reel IQ adjacent
  growth: [
    'topic:youtube-analytics pushed:>{DATE} stars:>30',
    'topic:youtube-shorts pushed:>{DATE} stars:>20',
    'topic:tiktok-analytics pushed:>{DATE} stars:>30',
    'topic:content-intelligence pushed:>{DATE} stars:>20',
    'topic:influencer-analytics pushed:>{DATE} stars:>30',
    'topic:social-media-analytics pushed:>{DATE} stars:>80',
    'topic:creator-tools pushed:>{DATE} stars:>20',
    'topic:video-analytics pushed:>{DATE} stars:>30',
    'topic:content-repurposing pushed:>{DATE} stars:>20',
    'topic:ai-video pushed:>{DATE} stars:>50',
    'topic:thumbnail-generator pushed:>{DATE} stars:>20',
    'topic:audience-analytics pushed:>{DATE} stars:>20',
    'topic:newsletter pushed:>{DATE} stars:>100',
    'topic:growth-hacking pushed:>{DATE} stars:>50',
    'topic:seo-tools pushed:>{DATE} stars:>80',
  ],
};
