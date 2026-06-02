#!/usr/bin/env python3
# run_pipeline.py — Scout→Analyst→Connector→Briefer→brief.json
# Triggered by GitHub Actions weekly or on manual dispatch.

import urllib.request, urllib.parse, json, ssl, os, base64
from datetime import datetime, timedelta

ctx       = ssl.create_default_context()
GH_TOKEN  = os.environ['GITHUB_TOKEN']
ANT_KEY   = os.environ['ANTHROPIC_API_KEY']
MODEL     = 'claude-opus-4-5'
DATE_FROM = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
MAX_PER   = int(os.environ.get('MAX_REPOS_PER_DOMAIN', '5'))
TOP_N     = 8  # repos sent to Briefer (keeps prompt small)

QUERIES = {
    'fintech':   [f'topic:fintech pushed:>{DATE_FROM} stars:>100',
                  f'topic:payments pushed:>{DATE_FROM} stars:>100'],
    'dev':       [f'topic:llm-agents pushed:>{DATE_FROM} stars:>100',
                  f'topic:ai-tools pushed:>{DATE_FROM} stars:>150'],
    'trading':   [f'topic:algorithmic-trading pushed:>{DATE_FROM} stars:>50',
                  f'topic:quantitative-finance pushed:>{DATE_FROM} stars:>50'],
    'marketing': [f'topic:influencer-analytics pushed:>{DATE_FROM} stars:>30',
                  f'topic:social-media-analytics pushed:>{DATE_FROM} stars:>50'],
}

def log(msg): print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)

def gh(path):
    req = urllib.request.Request(
        f'https://api.github.com{path}',
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

# ── SCOUT ────────────────────────────────────────────────────────────
log("AGENT 1 — Scout")
seen, repos = set(), []
for domain, queries in QUERIES.items():
    for q in queries:
        try:
            for r in gh_search(q):
                if r['full_name'] not in seen:
                    seen.add(r['full_name'])
                    repos.append({'id':r['full_name'],'name':r['name'],'owner':r['owner']['login'],
                        'description':r.get('description') or '','stars':r['stargazers_count'],
                        'forks':r['forks_count'],'language':r.get('language') or '',
                        'last_pushed':r['pushed_at'][:10],'topics':r.get('topics',[]),
                        'url':r['html_url'],'found_via':[domain],'readme_excerpt':''})
                else:
                    for x in repos:
                        if x['id']==r['full_name'] and domain not in x['found_via']:
                            x['found_via'].append(domain)
        except Exception as e: log(f"  query failed: {e}")

repos.sort(key=lambda r:(len(r['found_via']),r['stars']),reverse=True)
repos = repos[:20]
for r in repos:
    try: r['readme_excerpt'] = gh_readme(r['id'])
    except: pass
log(f"  {len(repos)} repos found")

# ── ANALYST ──────────────────────────────────────────────────────────
log("AGENT 2 — Analyst")
SYS_A = """Score this GitHub repo for Vikash Rajan, FinTech COO, Redpin Payments, Mumbai.
4 dimensions 0-100, each with reasoning (1 sentence) + confidence (0-100):
fintech(ACH/NACHA/payments/compliance), dev(AI/LLM/tooling), trading(NIFTY/quant/options), marketing(influencer/growth)
primary_domain=highest. urgency=high/medium/low. summary=2 sentences no jargon.
Return ONLY valid JSON no markdown:
{"repo_id":"","scores":{"fintech":{"score":0,"reasoning":"","confidence":0},"dev":{"score":0,"reasoning":"","confidence":0},"trading":{"score":0,"reasoning":"","confidence":0},"marketing":{"score":0,"reasoning":"","confidence":0}},"primary_domain":"","urgency":"","summary":""}"""

analyses = []
for r in repos:
    try:
        a = claude(SYS_A, f"Repo:{r['id']}\nDesc:{r['description']}\nLang:{r['language']}\nStars:{r['stars']}\nTopics:{','.join(r['topics'])}\nREADME:{r['readme_excerpt'][:300]}", 700)
        a['repo_id'] = r['id']
        analyses.append(a)
        pd = a['primary_domain']
        log(f"  {r['id']} → {pd} {a['scores'][pd]['score']}/100 · {a['urgency']}")
    except Exception as e:
        log(f"  failed: {r['id']} — {e}")
        analyses.append({'repo_id':r['id'],'urgency':'low','primary_domain':'dev','summary':'Analysis unavailable.','_error':True,
            'scores':{d:{'score':0,'reasoning':'','confidence':0} for d in ['fintech','dev','trading','marketing']}})

# ── CONNECTOR ────────────────────────────────────────────────────────
log("AGENT 3 — Connector")
SYS_C = """Map this GitHub repo to Vikash Rajan's 4 workflows:
redpin(ACH/NACHA,JPMorgan Chase,Cross River Bank,KYC,fraud,reconciliation)
nifty(CE/PE options,first 5-min candle,NIFTY,trade journaling)
reel_iq(Python/Streamlit,influencer content intelligence,Claude API)
automation(n8n,Google Apps Script,Forms/Sheets,reducing manual ops)
Specific one-sentence insights. 1-4 connections. Return ONLY valid JSON:
{"connections":[{"workflow":"redpin|nifty|reel_iq|automation","insight":"specific sentence","impact":"high|medium|low"}],"cross_domain":false,"cross_domain_leap":null}"""

connections = []
for i,r in enumerate(repos):
    try:
        a = analyses[i]
        c = claude(SYS_C, f"Repo:{r['id']}\nDesc:{r['description']}\nSummary:{a['summary']}\nPrimary:{a['primary_domain']} {a['scores'][a['primary_domain']]['score']}/100\nTopics:{','.join(r['topics'])}", 500)
        connections.append(c)
        top = c['connections'][0] if c['connections'] else None
        if top: log(f"  {r['id']} → [{top['workflow']}/{top['impact']}]")
    except Exception as e:
        log(f"  failed: {r['id']} — {e}")
        connections.append({'connections':[],'cross_domain':False,'cross_domain_leap':None})

# ── BRIEFER ──────────────────────────────────────────────────────────
log("AGENT 4 — Briefer")
# Rank by urgency × opportunity, send only TOP_N to avoid token overflow
scored = sorted([(({'high':3,'medium':2,'low':1}.get(analyses[i].get('urgency','low'),1) *
    analyses[i]['scores'][analyses[i].get('primary_domain','dev')]['score']/100), i)
    for i in range(len(repos))], reverse=True)
top_idx = [i for _,i in scored[:TOP_N]]

SYS_B = """You are the Briefer for Vikash Rajan, FinTech COO, Redpin Payments.
Decisive COO-level brief. Actions specific and immediately doable this week.
signal_quality: strong(3+ high urgency picks), moderate(1-2), weak(0).
Return ONLY a raw JSON object, no markdown, no explanation:
{"executive_summary":"3-4 sentences","signal_quality":"strong|moderate|weak","top_picks":[{"rank":1,"repo_id":"","headline":"under 12 words","why_now":"1 sentence","action":"specific action","urgency":"high|medium|low","primary_workflow":"redpin|nifty|reel_iq|automation|general"}],"skip_list":[{"repo_id":"","reason":"1 line"}]}"""

summaries = "\n---\n".join([
    f"Repo:{repos[i]['id']}|Urgency:{analyses[i]['urgency']}|Domain:{analyses[i]['primary_domain']}({analyses[i]['scores'][analyses[i]['primary_domain']]['score']}/100)\nSummary:{analyses[i]['summary'][:120]}\nConnection:{connections[i]['connections'][0]['insight'][:100] if connections[i]['connections'] else 'none'}"
    for i in top_idx])

try:
    brief = claude(SYS_B, f"Date:{datetime.now().strftime('%Y-%m-%d')}\n{summaries}", 1200)
except Exception as e:
    log(f"  Briefer failed: {e}")
    brief = {'executive_summary':'Pipeline error — check logs.','signal_quality':'weak','top_picks':[],'skip_list':[]}

# ── LEARNER weights ───────────────────────────────────────────────────
log("AGENT 5 — Learner")
try:
    weights = json.load(open('public/weights.json'))
    log(f"  Weights: {weights}")
except:
    weights = {'fintech':1.0,'dev':1.0,'trading':1.0,'marketing':1.0}

# ── SAVE OUTPUT ───────────────────────────────────────────────────────
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
    'weights_used': weights,
    'repos': [
        {**repos[i], 'analysis': analyses[i], 'connection': connections[i]}
        for i in range(len(repos))
    ]
}
with open('public/brief.json','w') as f:
    json.dump(output, f, indent=2)

log(f"\n{'━'*50}")
log(f"  BRIEF SAVED — {len(repos)} repos · {brief.get('signal_quality','').upper()} signal")
for p in brief.get('top_picks',[])[:5]:
    log(f"  {p['rank']}. {p['headline']}")
log(f"{'━'*50}")
