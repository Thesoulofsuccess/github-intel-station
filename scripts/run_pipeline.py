#!/usr/bin/env python3
# run_pipeline.py — Scout→Analyst→Connector→Briefer→brief.json
# Updated: 2026-06-02 — 4 deep domains, 49 query recipes

import urllib.request, urllib.parse, json, ssl, os, base64
from datetime import datetime, timedelta

ctx       = ssl.create_default_context()
GH_TOKEN  = os.environ['GITHUB_TOKEN']
ANT_KEY   = os.environ['ANTHROPIC_API_KEY']
MODEL     = 'claude-opus-4-5'
DATE_FROM = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
MAX_PER   = int(os.environ.get('MAX_REPOS_PER_DOMAIN', '5'))
TOP_N     = 8

QUERIES = {
  'payments': [
    f'topic:fintech pushed:>{DATE_FROM} stars:>100',
    f'topic:payments pushed:>{DATE_FROM} stars:>100',
    f'topic:open-banking pushed:>{DATE_FROM} stars:>50',
    f'topic:blockchain-payments pushed:>{DATE_FROM} stars:>50',
    f'topic:stablecoin pushed:>{DATE_FROM} stars:>80',
    f'topic:cbdc pushed:>{DATE_FROM} stars:>30',
    f'topic:defi pushed:>{DATE_FROM} stars:>150',
    f'topic:regtech pushed:>{DATE_FROM} stars:>30',
    f'topic:iso20022 pushed:>{DATE_FROM} stars:>20',
    f'topic:embedded-finance pushed:>{DATE_FROM} stars:>30',
    f'topic:cross-border-payments pushed:>{DATE_FROM} stars:>20',
    f'topic:web3-payments pushed:>{DATE_FROM} stars:>50',
  ],
  'markets': [
    f'topic:algorithmic-trading pushed:>{DATE_FROM} stars:>50',
    f'topic:quantitative-finance pushed:>{DATE_FROM} stars:>50',
    f'topic:options-trading pushed:>{DATE_FROM} stars:>30',
    f'topic:portfolio-rebalancing pushed:>{DATE_FROM} stars:>20',
    f'topic:stock-screener pushed:>{DATE_FROM} stars:>50',
    f'topic:backtesting pushed:>{DATE_FROM} stars:>80',
    f'topic:financial-advisor pushed:>{DATE_FROM} stars:>20',
    f'topic:wealth-management pushed:>{DATE_FROM} stars:>20',
    f'topic:technical-analysis pushed:>{DATE_FROM} stars:>80',
    f'topic:trading-bot pushed:>{DATE_FROM} stars:>100',
    f'topic:market-data pushed:>{DATE_FROM} stars:>50',
    f'topic:risk-management pushed:>{DATE_FROM} stars:>50',
    f'topic:crypto-trading pushed:>{DATE_FROM} stars:>80',
    f'topic:factor-investing pushed:>{DATE_FROM} stars:>20',
    f'topic:earnings-analysis pushed:>{DATE_FROM} stars:>20',
  ],
  'ai_efficiency': [
    f'topic:llm-agents pushed:>{DATE_FROM} stars:>150',
    f'topic:ai-tools pushed:>{DATE_FROM} stars:>150',
    f'topic:mcp-server pushed:>{DATE_FROM} stars:>30',
    f'topic:claude pushed:>{DATE_FROM} stars:>50',
    f'topic:anthropic pushed:>{DATE_FROM} stars:>50',
    f'topic:multi-agent pushed:>{DATE_FROM} stars:>80',
    f'topic:workflow-automation pushed:>{DATE_FROM} stars:>100',
    f'topic:n8n pushed:>{DATE_FROM} stars:>50',
    f'topic:ai-finance pushed:>{DATE_FROM} stars:>30',
    f'topic:prompt-engineering pushed:>{DATE_FROM} stars:>100',
    f'topic:rag pushed:>{DATE_FROM} stars:>150',
    f'topic:ai-automation pushed:>{DATE_FROM} stars:>100',
    f'topic:developer-tools pushed:>{DATE_FROM} stars:>300',
    f'topic:productivity pushed:>{DATE_FROM} stars:>200',
  ],
  'growth': [
    f'topic:youtube-analytics pushed:>{DATE_FROM} stars:>30',
    f'topic:youtube-shorts pushed:>{DATE_FROM} stars:>20',
    f'topic:tiktok-analytics pushed:>{DATE_FROM} stars:>30',
    f'topic:content-intelligence pushed:>{DATE_FROM} stars:>20',
    f'topic:influencer-analytics pushed:>{DATE_FROM} stars:>30',
    f'topic:social-media-analytics pushed:>{DATE_FROM} stars:>80',
    f'topic:creator-tools pushed:>{DATE_FROM} stars:>20',
    f'topic:video-analytics pushed:>{DATE_FROM} stars:>30',
    f'topic:ai-video pushed:>{DATE_FROM} stars:>50',
    f'topic:content-repurposing pushed:>{DATE_FROM} stars:>20',
    f'topic:audience-analytics pushed:>{DATE_FROM} stars:>20',
    f'topic:newsletter pushed:>{DATE_FROM} stars:>100',
    f'topic:growth-hacking pushed:>{DATE_FROM} stars:>50',
    f'topic:seo-tools pushed:>{DATE_FROM} stars:>80',
  ],
}

DOMAIN_LABELS = {
  'payments':      'Payments & FinTech',
  'markets':       'Markets & Investing',
  'ai_efficiency': 'AI & Efficiency',
  'growth':        'Growth & Creator',
}

def log(msg): print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)

def gh(path):
  req = urllib.request.Request(f'https://api.github.com{path}',
    headers={'Authorization':f'Bearer {GH_TOKEN}','Accept':'application/vnd.github+json'})
  with urllib.request.urlopen(req, context=ctx, timeout=15) as r:
    return json.loads(r.read())

def gh_search(q, n=MAX_PER):
  return gh(f'/search/repositories?q={urllib.parse.quote(q)}&sort=stars&order=desc&per_page={n}').get('items',[])

def gh_readme(name):
  try:
    data = gh(f'/repos/{name}/readme')
    return base64.b64decode(data['content'].replace('\n','')).decode('utf-8','ignore')[:500]
  except: return ''

def claude(system, user, tokens=800):
  payload = json.dumps({'model':MODEL,'max_tokens':tokens,'system':system,
    'messages':[{'role':'user','content':user}]}).encode()
  req = urllib.request.Request('https://api.anthropic.com/v1/messages', data=payload,
    headers={'Content-Type':'application/json','x-api-key':ANT_KEY,'anthropic-version':'2023-06-01'})
  with urllib.request.urlopen(req, context=ctx, timeout=60) as r:
    text = json.loads(r.read())['content'][0]['text']
  return json.loads(text.replace('```json','').replace('```','').strip())

# ── AGENT 1: SCOUT ───────────────────────────────────────────────
log("AGENT 1 — Scout (49 query recipes across 4 domains)")
seen, repos = set(), []
for domain, queries in QUERIES.items():
  for q in queries:
    try:
      for r in gh_search(q):
        if r['full_name'] not in seen:
          seen.add(r['full_name'])
          repos.append({
            'id': r['full_name'], 'name': r['name'], 'owner': r['owner']['login'],
            'description': r.get('description') or '', 'stars': r['stargazers_count'],
            'forks': r['forks_count'], 'language': r.get('language') or '',
            'last_pushed': r['pushed_at'][:10], 'topics': r.get('topics',[]),
            'url': r['html_url'], 'found_via': [domain], 'readme_excerpt': '',
          })
        else:
          for x in repos:
            if x['id']==r['full_name'] and domain not in x['found_via']:
              x['found_via'].append(domain)
    except Exception as e: log(f"  query failed: {q[:50]} — {e}")

repos.sort(key=lambda r:(len(r['found_via']),r['stars']), reverse=True)
repos = repos[:25]
for r in repos:
  try: r['readme_excerpt'] = gh_readme(r['id'])
  except: pass
log(f"  {len(repos)} repos found across {len(QUERIES)} domains")

# ── AGENT 2: ANALYST ─────────────────────────────────────────────
log("AGENT 2 — Analyst")
SYS_A = """Score this GitHub repo for Vikash Rajan — FinTech COO at Redpin Payments, Mumbai.

4 scoring dimensions (0-100 each), each with reasoning (1 sentence) + confidence (0-100):
- payments: relevance to ACH/NACHA, open banking, blockchain payments, stablecoins, CBDCs, cross-border rails, RegTech, embedded finance, ISO 20022
- markets: relevance to NIFTY options CE/PE trading, global equities, quant strategies, portfolio rebalancing, financial advisor tools, backtesting, risk management, crypto trading
- ai_efficiency: relevance to Claude plugins/MCP servers, multi-agent systems, workflow automation, AI for financial services, ops efficiency tools, n8n, developer productivity
- growth: relevance to YouTube Shorts, TikTok, Instagram Reels analytics, creator intelligence, content repurposing, influencer tools, audience growth, Reel IQ (Python/Streamlit content intelligence SaaS)

primary_domain = highest score. urgency = high/medium/low. summary = 2 sentences, executive tone, no jargon.
Return ONLY valid JSON, no markdown:
{"repo_id":"","scores":{"payments":{"score":0,"reasoning":"","confidence":0},"markets":{"score":0,"reasoning":"","confidence":0},"ai_efficiency":{"score":0,"reasoning":"","confidence":0},"growth":{"score":0,"reasoning":"","confidence":0}},"primary_domain":"","urgency":"","summary":""}"""

analyses = []
for r in repos:
  try:
    a = claude(SYS_A, f"Repo:{r['id']}\nDesc:{r['description']}\nLang:{r['language']}\nStars:{r['stars']}\nTopics:{','.join(r['topics'])}\nREADME:{r['readme_excerpt'][:300]}", 700)
    a['repo_id'] = r['id']
    analyses.append(a)
    pd = a['primary_domain']
    log(f"  {r['id']} → {DOMAIN_LABELS.get(pd,pd)} {a['scores'][pd]['score']}/100 · {a['urgency']}")
  except Exception as e:
    log(f"  failed: {r['id']} — {e}")
    analyses.append({'repo_id':r['id'],'urgency':'low','primary_domain':'ai_efficiency','summary':'Analysis unavailable.','_error':True,
      'scores':{d:{'score':0,'reasoning':'','confidence':0} for d in QUERIES.keys()}})

# ── AGENT 3: CONNECTOR ───────────────────────────────────────────
log("AGENT 3 — Connector")
SYS_C = """Map this GitHub repo to Vikash Rajan's 4 active workflows:

1. REDPIN (Payments operations)
   ACH/NACHA infrastructure, JP Morgan Chase + Cross River Bank integrations
   KYC/AML compliance, fraud scoring, reconciliation, real-time payment monitoring
   Exploring: blockchain payments, stablecoins, ISO 20022, cross-border rails

2. NIFTY + GLOBAL MARKETS (Personal investing)
   NIFTY CE/PE options, first 5-minute candle analysis, intraday momentum
   Global equities, portfolio rebalancing, quant strategies
   Financial advisor tools, backtesting frameworks, risk models

3. REEL IQ (AI SaaS product)
   Python/Streamlit content intelligence platform for influencers
   YouTube Shorts, TikTok, Instagram Reels performance analytics
   Claude API for content scoring, engagement prediction, trend detection
   Looking for: tools to expand platform, features to add, tech to integrate

4. AUTOMATION STACK (Personal productivity)
   n8n workflows, Google Apps Script, Forms/Sheets
   Any tool that reduces manual ops at Redpin or speeds up Vikash's workflows

Write specific one-sentence insights per workflow connection.
cross_domain_leap: the non-obvious bridge — where a repo outside its primary domain still matters.
Return ONLY valid JSON:
{"connections":[{"workflow":"redpin|nifty_markets|reel_iq|automation","insight":"specific actionable sentence","impact":"high|medium|low"}],"cross_domain":false,"cross_domain_leap":null}"""

connections = []
for i,r in enumerate(repos):
  try:
    a = analyses[i]
    c = claude(SYS_C,
      f"Repo:{r['id']}\nDesc:{r['description']}\nSummary:{a['summary']}\nPrimary:{DOMAIN_LABELS.get(a['primary_domain'],a['primary_domain'])} {a['scores'][a['primary_domain']]['score']}/100\nTopics:{','.join(r['topics'][:8])}\nFoundVia:{','.join(r['found_via'])}",
      500)
    connections.append(c)
    top = c['connections'][0] if c['connections'] else None
    if top: log(f"  {r['id']} → [{top['workflow']}/{top['impact']}] {top['insight'][:65]}…")
  except Exception as e:
    log(f"  failed: {r['id']} — {e}")
    connections.append({'connections':[],'cross_domain':False,'cross_domain_leap':None})

# ── AGENT 4: BRIEFER ─────────────────────────────────────────────
log("AGENT 4 — Briefer")
scored = sorted([
  (({'high':3,'medium':2,'low':1}.get(analyses[i].get('urgency','low'),1) *
    analyses[i]['scores'][analyses[i].get('primary_domain','ai_efficiency')]['score']/100), i)
  for i in range(len(repos))], reverse=True)
top_idx = [i for _,i in scored[:TOP_N]]

SYS_B = """You are the Briefer for Vikash Rajan, FinTech COO at Redpin Payments, Mumbai.

4 domains this week: Payments & FinTech, Markets & Investing, AI & Efficiency, Growth & Creator.
Vikash's workflows: Redpin (payments ops), NIFTY + global markets (investing), Reel IQ (creator SaaS), Automation (ops efficiency).

Rank picks by urgency × opportunity. Write decisive COO-level brief.
Actions must be specific, immediately doable this week.
signal_quality: strong (3+ high urgency), moderate (1-2 high), weak (0 high).
Return ONLY raw JSON, no markdown:
{"executive_summary":"3-4 sentences covering the week's signal across all 4 domains","signal_quality":"strong|moderate|weak","top_picks":[{"rank":1,"repo_id":"","headline":"punchy under 12 words","why_now":"1 sentence","action":"specific action this week","urgency":"high|medium|low","primary_workflow":"redpin|nifty_markets|reel_iq|automation|general"}],"skip_list":[{"repo_id":"","reason":"1 line"}]}"""

summaries = "\n---\n".join([
  f"Repo:{repos[i]['id']}|Domain:{DOMAIN_LABELS.get(analyses[i]['primary_domain'],analyses[i]['primary_domain'])}({analyses[i]['scores'][analyses[i]['primary_domain']]['score']}/100)|Urgency:{analyses[i]['urgency']}\nSummary:{analyses[i]['summary'][:120]}\nConnection:{connections[i]['connections'][0]['insight'][:100] if connections[i]['connections'] else 'none'}\nCross-domain:{connections[i].get('cross_domain_leap') or 'no'}"
  for i in top_idx])

try:
  brief = claude(SYS_B, f"Date:{datetime.now().strftime('%Y-%m-%d')}\n{summaries}", 1400)
except Exception as e:
  log(f"  Briefer failed: {e}")
  brief = {'executive_summary':'Pipeline error.','signal_quality':'weak','top_picks':[],'skip_list':[]}

# ── AGENT 5: LEARNER ─────────────────────────────────────────────
log("AGENT 5 — Learner")
try:
  weights = json.load(open('public/weights.json'))
  log(f"  Weights: {weights}")
except:
  weights = {'payments':1.0,'markets':1.0,'ai_efficiency':1.0,'growth':1.0}

# ── SAVE ─────────────────────────────────────────────────────────
os.makedirs('public', exist_ok=True)
output = {
  'generated_at': datetime.now().isoformat(),
  'briefing_date': datetime.now().strftime('%Y-%m-%d'),
  'signal_quality': brief.get('signal_quality','moderate'),
  'executive_summary': brief.get('executive_summary',''),
  'top_picks': brief.get('top_picks',[]),
  'skip_list': brief.get('skip_list',[]),
  'total_scanned': len(repos),
  'domains_covered': list(QUERIES.keys()),
  'domain_labels': DOMAIN_LABELS,
  'weights_used': weights,
  'repos': [{**repos[i],'analysis':analyses[i],'connection':connections[i]} for i in range(len(repos))]
}
with open('public/brief.json','w') as f:
  json.dump(output, f, indent=2)

log(f"\n{'━'*55}")
log(f"  BRIEF SAVED · {len(repos)} repos · {brief.get('signal_quality','').upper()} signal")
log(f"  Domains: Payments · Markets · AI & Efficiency · Growth")
for p in brief.get('top_picks',[])[:5]:
  log(f"  {p['rank']}. [{p.get('primary_workflow','').upper()}] {p['headline']}")
log(f"{'━'*55}")
