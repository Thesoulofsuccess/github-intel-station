#!/usr/bin/env python3
# run_pipeline.py — Scout→Analyst→Connector→Briefer→GapScout→brief.json
# v3 — multi-lane discovery (topic + keyword + velocity/wildcard),
#      notability axis (off-thesis repos survive), and a Gap Scout agent
#      that maps notable repos to capability gaps + tool-specific install plans.
# Config lives in scripts/recipes.json + scripts/systems_manifest.json (single source of truth).

import urllib.request, urllib.parse, json, ssl, os, base64, math, time
from datetime import datetime, timedelta

ctx       = ssl.create_default_context()
GH_TOKEN  = os.environ['GITHUB_TOKEN']
ANT_KEY   = os.environ['ANTHROPIC_API_KEY']
MODEL     = os.environ.get('ANTHROPIC_MODEL', 'claude-opus-4-5')
DATE_FROM = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
MAX_PER   = int(os.environ.get('MAX_REPOS_PER_DOMAIN', '5'))
TOP_N     = 8
HERE      = os.path.dirname(os.path.abspath(__file__))

def log(msg): print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)

# ── CONFIG ───────────────────────────────────────────────────────
def load_json(path, fallback):
    try:
        with open(os.path.join(HERE, path), encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        log(f"  config load failed ({path}): {e} — using fallback")
        return fallback

CFG      = load_json('recipes.json', {})
MANIFEST = load_json('systems_manifest.json', {'systems': [], 'preferred_tools': []})

DOMAINS      = list(CFG.get('domains', {}).keys()) or ['payments', 'markets', 'ai_efficiency', 'growth']
DOMAIN_LABELS = {d: m['label'] for d, m in CFG.get('domains', {}).items()} or {
    'payments': 'Payments & FinTech', 'markets': 'Markets & Investing',
    'ai_efficiency': 'AI & Efficiency', 'growth': 'Growth & Creator'}
TOPIC_Q   = CFG.get('topic_queries', {})
KEYWORD_Q = CFG.get('keyword_queries', {})
LANES     = CFG.get('lanes', {'topic': {'enabled': True, 'per_query': MAX_PER},
                              'keyword': {'enabled': True, 'per_query': 4, 'star_floor': 5},
                              'wildcard': {'enabled': True, 'per_query': 8, 'created_within_days': 60}})
WILDCARD_Q = CFG.get('wildcard_queries', [])
RANK      = CFG.get('ranking', {'found_via_weight': 25, 'velocity_weight': 40, 'log_star_weight': 6, 'keep_top': 30})
SCORE_BAR = CFG.get('scoring', {'domain_bar': 55, 'notability_bar': 72})

NEW_FROM = (datetime.now() - timedelta(days=LANES.get('wildcard', {}).get('created_within_days', 60))).strftime('%Y-%m-%d')

def resolve(q):
    return q.replace('{DATE}', DATE_FROM).replace('{NEW}', NEW_FROM)

# ── GITHUB ───────────────────────────────────────────────────────
def gh(path):
    req = urllib.request.Request(f'https://api.github.com{path}',
        headers={'Authorization': f'Bearer {GH_TOKEN}', 'Accept': 'application/vnd.github+json'})
    with urllib.request.urlopen(req, context=ctx, timeout=15) as r:
        return json.loads(r.read())

def gh_search(q, n=MAX_PER, sort='stars'):
    # Search API allows ~30 req/min authenticated — pace to stay safe.
    for attempt in range(2):
        try:
            res = gh(f'/search/repositories?q={urllib.parse.quote(q)}&sort={sort}&order=desc&per_page={n}')
            time.sleep(2.2)
            return res.get('items', [])
        except urllib.error.HTTPError as e:
            if e.code in (403, 429) and attempt == 0:
                log("  rate limited — cooling down 25s"); time.sleep(25); continue
            raise

def gh_readme(name):
    try:
        data = gh(f'/repos/{name}/readme')
        return base64.b64decode(data['content'].replace('\n', '')).decode('utf-8', 'ignore')[:800]
    except Exception:
        return ''

def claude(system, user, tokens=800):
    payload = json.dumps({'model': MODEL, 'max_tokens': tokens, 'system': system,
        'messages': [{'role': 'user', 'content': user}]}).encode()
    req = urllib.request.Request('https://api.anthropic.com/v1/messages', data=payload,
        headers={'Content-Type': 'application/json', 'x-api-key': ANT_KEY, 'anthropic-version': '2023-06-01'})
    with urllib.request.urlopen(req, context=ctx, timeout=60) as r:
        text = json.loads(r.read())['content'][0]['text']
    return json.loads(text.replace('```json', '').replace('```', '').strip())

def days_since(iso):
    try:
        return max((datetime.now() - datetime.strptime(iso[:10], '%Y-%m-%d')).days, 1)
    except Exception:
        return 9999

def velocity(stars, created_iso):
    # Stars per day since creation — the rocket detector.
    return round(stars / days_since(created_iso), 2)

def install_options(r):
    # Deterministic, honest install hints per tool. Clone always works;
    # tool-specific commands are best-effort and flag "verify in README" when guessing.
    rid, name, url = r['id'], r['name'], r['url']
    blob = f"{name} {r['description']} {' '.join(r['topics'])}".lower()
    lang = r.get('language', '')
    is_mcp    = 'mcp' in r['topics'] or 'mcp-server' in r['topics'] or 'mcp' in blob
    is_skill  = 'claude-skill' in r['topics'] or 'agent-skill' in r['topics'] or 'skill' in blob
    is_plugin = 'claude-plugin' in r['topics'] or 'plugin' in r['topics']
    is_python = lang == 'Python'
    is_node   = lang in ('JavaScript', 'TypeScript')

    if is_mcp:
        cc = f"claude mcp add {name} -- npx -y {name}   # confirm exact pkg/cmd in README"
    elif is_skill:
        cc = f"git clone https://github.com/{rid}.git ~/.claude/skills/{name}"
    elif is_plugin:
        cc = f"/plugin marketplace add {rid}  then  /plugin install {name}"
    else:
        cc = f"git clone https://github.com/{rid}.git   # then add as MCP / reference in CLAUDE.md"

    if is_mcp:
        cx = f"Add {name} as an MCP server in ~/.codex/config.toml (cmd from README)"
    else:
        cx = f"git clone https://github.com/{rid}.git   # reference in AGENTS.md / prompt context"

    if is_python:
        gn = f"git clone https://github.com/{rid}.git && cd {name} && pip install -e ."
    elif is_node:
        gn = f"git clone https://github.com/{rid}.git && cd {name} && npm install"
    else:
        gn = f"git clone https://github.com/{rid}.git"

    return {'claude_code': cc, 'codex': cx, 'generic': gn}

# ── AGENT 1: SCOUT (multi-lane) ──────────────────────────────────
log("AGENT 1 — Scout (topic + keyword + velocity/wildcard lanes)")
seen, repos = {}, []

def ingest(r, domain, lane):
    fn = r['full_name']
    if fn in seen:
        x = repos[seen[fn]]
        if domain and domain not in x['found_via']:
            x['found_via'].append(domain)
        if lane not in x['lanes']:
            x['lanes'].append(lane)
        return
    seen[fn] = len(repos)
    repos.append({
        'id': fn, 'name': r['name'], 'owner': r['owner']['login'],
        'description': r.get('description') or '', 'stars': r['stargazers_count'],
        'forks': r['forks_count'], 'language': r.get('language') or '',
        'created_at': (r.get('created_at') or '')[:10],
        'last_pushed': r['pushed_at'][:10], 'topics': r.get('topics', []),
        'url': r['html_url'], 'found_via': [domain] if domain else [],
        'lanes': [lane], 'velocity': velocity(r['stargazers_count'], r.get('created_at') or ''),
        'readme_excerpt': '',
    })

# Lane 1 — topic tags (established, on-thesis)
if LANES.get('topic', {}).get('enabled', True):
    per = LANES.get('topic', {}).get('per_query', MAX_PER)
    for domain in DOMAINS:
        for q in TOPIC_Q.get(domain, []):
            try:
                for r in gh_search(resolve(q), per):
                    ingest(r, domain, 'topic')
            except Exception as e:
                log(f"  topic query failed: {q[:50]} — {e}")

# Lane 2 — keyword full-text (catches UNTAGGED gems, low star floor)
if LANES.get('keyword', {}).get('enabled', True):
    per   = LANES.get('keyword', {}).get('per_query', 4)
    floor = LANES.get('keyword', {}).get('star_floor', 5)
    for domain in DOMAINS:
        for phrase in KEYWORD_Q.get(domain, []):
            q = f"{phrase} in:name,description,readme pushed:>{DATE_FROM} stars:>{floor}"
            try:
                for r in gh_search(q, per):
                    ingest(r, domain, 'keyword')
            except Exception as e:
                log(f"  keyword query failed: {phrase[:40]} — {e}")

# Lane 3 — wildcard / rising (domain-agnostic, JUST-shipped launches)
if LANES.get('wildcard', {}).get('enabled', True):
    per = LANES.get('wildcard', {}).get('per_query', 8)
    for q in WILDCARD_Q:
        try:
            for r in gh_search(resolve(q), per):
                ingest(r, None, 'wildcard')   # no domain → may end up "uncategorized"
        except Exception as e:
            log(f"  wildcard query failed: {q[:50]} — {e}")

# Blended ranking: overlap + velocity + log(stars) — NOT raw stars.
def rank_score(r):
    return (RANK['found_via_weight'] * len(r['found_via'])
            + RANK['velocity_weight'] * math.log1p(r['velocity'])
            + RANK['log_star_weight'] * math.log1p(r['stars']))

repos.sort(key=rank_score, reverse=True)
repos = repos[:RANK.get('keep_top', 30)]
for r in repos:
    r['readme_excerpt'] = gh_readme(r['id'])
log(f"  {len(repos)} repos kept · lanes merged · ranked by overlap×velocity×stars")

# ── AGENT 2: ANALYST (4 domains + notability) ────────────────────
log("AGENT 2 — Analyst")
SYS_A = """Score this GitHub repo for Vikash Rajan — Head of Global Operations at Redpin Payments, Mumbai.

5 dimensions (0-100 each), each with reasoning (1 sentence) + confidence (0-100):
- payments: ACH/NACHA, open banking, blockchain payments, stablecoins, CBDCs, cross-border rails, RegTech, embedded finance, ISO 20022
- markets: NIFTY options CE/PE, global equities, quant strategies, portfolio rebalancing, backtesting, risk management, crypto trading
- ai_efficiency: Claude plugins/MCP servers, multi-agent systems, workflow automation, AI for financial services, ops efficiency, n8n, developer productivity
- growth: YouTube Shorts, TikTok, Instagram Reels analytics, creator intelligence, content repurposing, influencer tools, audience growth, Reel IQ
- notability: how objectively impressive, novel, or fast-rising this repo is REGARDLESS of fit to Vikash's domains. A breakthrough infra/dev/AI repo that doesn't match any domain still scores HIGH here. This is the "don't miss something great" axis.

primary_domain = highest of the 4 domain scores (NOT notability). urgency = high/medium/low. summary = 2 sentences, executive tone.
Return ONLY valid JSON, no markdown:
{"repo_id":"","scores":{"payments":{"score":0,"reasoning":"","confidence":0},"markets":{"score":0,"reasoning":"","confidence":0},"ai_efficiency":{"score":0,"reasoning":"","confidence":0},"growth":{"score":0,"reasoning":"","confidence":0}},"notability":{"score":0,"reasoning":"","confidence":0},"primary_domain":"","urgency":"","summary":""}"""

analyses = []
for r in repos:
    try:
        a = claude(SYS_A, f"Repo:{r['id']}\nDesc:{r['description']}\nLang:{r['language']}\nStars:{r['stars']} (velocity {r['velocity']}/day, created {r['created_at']})\nTopics:{','.join(r['topics'])}\nFoundVia:{','.join(r['found_via']) or 'wildcard/uncategorized'}\nREADME:{r['readme_excerpt'][:500]}", 800)
        a['repo_id'] = r['id']
        analyses.append(a)
        pd  = a.get('primary_domain', DOMAINS[0])
        nb  = a.get('notability', {}).get('score', 0)
        log(f"  {r['id']} → {DOMAIN_LABELS.get(pd, pd)} {a['scores'][pd]['score']}/100 · notability {nb} · {a['urgency']}")
    except Exception as e:
        log(f"  failed: {r['id']} — {e}")
        analyses.append({'repo_id': r['id'], 'urgency': 'low', 'primary_domain': DOMAINS[0],
            'summary': 'Analysis unavailable.', '_error': True,
            'notability': {'score': 0, 'reasoning': '', 'confidence': 0},
            'scores': {d: {'score': 0, 'reasoning': '', 'confidence': 0} for d in DOMAINS}})

def best_domain_score(a):
    pd = a.get('primary_domain', DOMAINS[0])
    if pd not in a.get('scores', {}):
        pd = DOMAINS[0]
    return a['scores'][pd]['score'], pd

def survives(a):
    dscore, _ = best_domain_score(a)
    nscore = a.get('notability', {}).get('score', 0)
    return dscore >= SCORE_BAR['domain_bar'] or nscore >= SCORE_BAR['notability_bar']

# ── AGENT 3: CONNECTOR ───────────────────────────────────────────
log("AGENT 3 — Connector")
SYS_C = """Map this GitHub repo to Vikash Rajan's 4 active workflows:

1. REDPIN (Payments operations) — ACH/NACHA, JP Morgan Chase + Cross River Bank, KYC/AML, reconciliation, real-time monitoring; exploring blockchain payments, stablecoins, ISO 20022, cross-border rails.
2. NIFTY + GLOBAL MARKETS — NIFTY CE/PE options, first 5-minute candle, intraday momentum, global equities, quant strategies, backtesting, risk models.
3. REEL IQ — Python/Streamlit content intelligence for influencers; YouTube Shorts/TikTok/Reels analytics; Claude API for content scoring; looking for features/tech to add.
4. AUTOMATION STACK — n8n, Google Apps Script, Forms/Sheets; anything that reduces manual ops or speeds workflows.

Write specific one-sentence insights per relevant workflow.
cross_domain_leap: the non-obvious bridge — where a repo outside its primary domain still matters.
Return ONLY valid JSON:
{"connections":[{"workflow":"redpin|nifty_markets|reel_iq|automation","insight":"specific actionable sentence","impact":"high|medium|low"}],"cross_domain":false,"cross_domain_leap":null}"""

connections = []
for i, r in enumerate(repos):
    try:
        a = analyses[i]
        dscore, pd = best_domain_score(a)
        c = claude(SYS_C,
            f"Repo:{r['id']}\nDesc:{r['description']}\nSummary:{a.get('summary','')}\nPrimary:{DOMAIN_LABELS.get(pd, pd)} {dscore}/100\nNotability:{a.get('notability',{}).get('score',0)}\nTopics:{','.join(r['topics'][:8])}\nFoundVia:{','.join(r['found_via']) or 'wildcard'}",
            500)
        connections.append(c)
        top = c['connections'][0] if c.get('connections') else None
        if top:
            log(f"  {r['id']} → [{top['workflow']}/{top['impact']}] {top['insight'][:65]}…")
    except Exception as e:
        log(f"  failed: {r['id']} — {e}")
        connections.append({'connections': [], 'cross_domain': False, 'cross_domain_leap': None})

# ── AGENT 4: BRIEFER ─────────────────────────────────────────────
log("AGENT 4 — Briefer")
URG = {'high': 3, 'medium': 2, 'low': 1}

def pick_score(i):
    a = analyses[i]
    dscore, _ = best_domain_score(a)
    nscore = a.get('notability', {}).get('score', 0)
    # Off-thesis but notable repos compete on notability, not just domain fit.
    return URG.get(a.get('urgency', 'low'), 1) * max(dscore, nscore) / 100

eligible = [i for i in range(len(repos)) if survives(analyses[i])]
scored   = sorted(eligible, key=pick_score, reverse=True)
top_idx  = scored[:TOP_N]

SYS_B = """You are the Briefer for Vikash Rajan, Head of Global Operations at Redpin Payments, Mumbai.

4 domains: Payments & FinTech, Markets & Investing, AI & Efficiency, Growth & Creator — PLUS an "off-thesis but notable" lane for great repos that don't fit a domain (don't miss something great just because it's outside the matrix).
Workflows: Redpin (payments ops), NIFTY + global markets, Reel IQ (creator SaaS), Automation.

Rank picks by urgency × opportunity, giving real weight to high-notability off-thesis repos. Actions must be specific and doable this week.
signal_quality: strong (3+ high urgency), moderate (1-2 high), weak (0 high).
Return ONLY raw JSON, no markdown:
{"executive_summary":"3-4 sentences covering the week's signal incl. any standout off-thesis repo","signal_quality":"strong|moderate|weak","top_picks":[{"rank":1,"repo_id":"","headline":"punchy under 12 words","why_now":"1 sentence","action":"specific action this week","urgency":"high|medium|low","primary_workflow":"redpin|nifty_markets|reel_iq|automation|general","off_thesis":false}],"skip_list":[{"repo_id":"","reason":"1 line"}]}"""

summaries = "\n---\n".join([
    f"Repo:{repos[i]['id']}|Domain:{DOMAIN_LABELS.get(analyses[i].get('primary_domain'), analyses[i].get('primary_domain'))}({best_domain_score(analyses[i])[0]}/100)|Notability:{analyses[i].get('notability',{}).get('score',0)}|Urgency:{analyses[i].get('urgency')}\nSummary:{analyses[i].get('summary','')[:120]}\nConnection:{connections[i]['connections'][0]['insight'][:100] if connections[i].get('connections') else 'none'}\nCross-domain:{connections[i].get('cross_domain_leap') or 'no'}"
    for i in top_idx])

try:
    brief = claude(SYS_B, f"Date:{datetime.now().strftime('%Y-%m-%d')}\n{summaries}", 1500)
except Exception as e:
    log(f"  Briefer failed: {e}")
    brief = {'executive_summary': 'Pipeline error.', 'signal_quality': 'weak', 'top_picks': [], 'skip_list': []}

# ── AGENT 5: GAP SCOUT (replaces dead Learner) ───────────────────
# Holds notable repos up against Vikash's OWN systems → capability gaps +
# tool-specific install/adoption plans (Claude Code, Codex, or any tool).
log("AGENT 5 — Gap Scout (capability gaps + install plans)")

# Feed the most NOTABLE repos (the ones most likely to expose a gap), on or off thesis.
gap_candidates = sorted(range(len(repos)),
    key=lambda i: analyses[i].get('notability', {}).get('score', 0), reverse=True)[:8]

SYS_G = """You are Gap Scout for Vikash Rajan. You are given (a) a set of notable GitHub repos and (b) a manifest of Vikash's OWN systems with their capabilities and what they're looking for.

Your job: find CAPABILITY GAPS — things these repos do that Vikash's stack does not yet do — and tell him exactly how to adopt them. Be specific and honest; skip weak matches. Prefer non-obvious, high-leverage gaps.

For each gap, give a concrete adoption plan for the tool that fits best. Choose the right install mechanism per tool:
- claude_code: a real command/path — e.g. an MCP server ("claude mcp add <name> -- npx <pkg>"), a plugin ("/plugin marketplace add <owner/repo>" then "/plugin install <name>"), or a skill (clone the skill folder into ~/.claude/skills/). Pick whichever the repo actually is.
- codex: how to wire it into Codex — config/MCP entry, or a clone + prompt/instruction snippet.
- generic: the universal path (git clone / pip install / npm i / docker) so it works in any other tool that becomes useful.

Return ONLY valid JSON, no markdown:
{"gaps":[{"capability":"short name of the capability","evidence_repos":["owner/repo"],"target_system":"which of Vikash's systems this upgrades","current_state":"what his stack does today (the gap)","enhancement":"the specific upgrade, 1-2 sentences","priority":"high|medium|low","adoption":{"claude_code":"exact steps/command","codex":"exact steps/command","generic":"exact steps/command"}}],"meta_observation":"1-2 sentences: the biggest systemic gap across all of Vikash's stack this week"}"""

gap_digest = "\n---\n".join([
    f"Repo:{repos[i]['id']}\nDesc:{repos[i]['description']}\nLang:{repos[i]['language']} | Stars:{repos[i]['stars']} | Notability:{analyses[i].get('notability',{}).get('score',0)}\nSummary:{analyses[i].get('summary','')[:140]}\nREADME:{repos[i]['readme_excerpt'][:280]}"
    for i in gap_candidates])

systems_txt = json.dumps({'preferred_tools': MANIFEST.get('preferred_tools', []),
                          'systems': MANIFEST.get('systems', [])}, ensure_ascii=False)

try:
    gaps = claude(SYS_G, f"VIKASH'S SYSTEMS:\n{systems_txt}\n\nNOTABLE REPOS THIS WEEK:\n{gap_digest}", 2000)
except Exception as e:
    log(f"  Gap Scout failed: {e}")
    gaps = {'gaps': [], 'meta_observation': 'Gap analysis unavailable.'}

for g in gaps.get('gaps', [])[:6]:
    log(f"  GAP [{g.get('priority','?').upper()}] {g.get('capability','')} → {g.get('target_system','')}")

# Legacy weights (kept for the frontend Learner panel).
try:
    weights = json.load(open(os.path.join(HERE, '..', 'public', 'weights.json')))
except Exception:
    weights = {d: 1.0 for d in DOMAINS}

# ── SAVE ─────────────────────────────────────────────────────────
pub = os.path.join(HERE, '..', 'public')
os.makedirs(pub, exist_ok=True)
output = {
    'generated_at': datetime.now().isoformat(),
    'briefing_date': datetime.now().strftime('%Y-%m-%d'),
    'signal_quality': brief.get('signal_quality', 'moderate'),
    'executive_summary': brief.get('executive_summary', ''),
    'top_picks': brief.get('top_picks', []),
    'skip_list': brief.get('skip_list', []),
    'gaps': gaps.get('gaps', []),
    'gap_meta': gaps.get('meta_observation', ''),
    'total_scanned': len(repos),
    'domains_covered': DOMAINS,
    'domain_labels': DOMAIN_LABELS,
    'weights_used': weights,
    'repos': [{**repos[i], 'install': install_options(repos[i]), 'analysis': analyses[i], 'connection': connections[i]} for i in range(len(repos))],
}
with open(os.path.join(pub, 'brief.json'), 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

# Human-readable adoption sheet — drop-in install steps per tool.
lines = [f"# Adoption Sheet — {output['briefing_date']}", '',
         f"_{gaps.get('meta_observation','')}_", '']
for g in gaps.get('gaps', []):
    ad = g.get('adoption', {})
    lines += [f"## {g.get('capability','')}  ·  {g.get('priority','').upper()}",
              f"**Upgrades:** {g.get('target_system','')}  ",
              f"**Gap today:** {g.get('current_state','')}  ",
              f"**Do this:** {g.get('enhancement','')}  ",
              f"**Evidence:** {', '.join(g.get('evidence_repos', []))}", '',
              f"- **Claude Code:** `{ad.get('claude_code','—')}`",
              f"- **Codex:** `{ad.get('codex','—')}`",
              f"- **Any tool:** `{ad.get('generic','—')}`", '']
with open(os.path.join(pub, 'adoption.md'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

log(f"\n{'━'*55}")
log(f"  BRIEF SAVED · {len(repos)} repos · {brief.get('signal_quality','').upper()} signal")
log(f"  Domains: Payments · Markets · AI & Efficiency · Growth (+ off-thesis lane)")
log(f"  Gaps found: {len(gaps.get('gaps', []))} · adoption.md written")
for p in brief.get('top_picks', [])[:5]:
    tag = ' *off-thesis*' if p.get('off_thesis') else ''
    log(f"  {p['rank']}. [{p.get('primary_workflow','').upper()}] {p['headline']}{tag}")
log(f"{'━'*55}")
