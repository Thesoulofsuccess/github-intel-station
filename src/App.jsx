import React, { useState, useEffect, useMemo, useCallback } from 'react';

// ─── Themes ───────────────────────────────────────────────────────
const THEMES = {
  dark:  { bg:'#0E0D13', panel:'#16151D', raised:'#1E1C28', line:'#2A2833', ink:'#F4F1EA', sub:'#A8A2B8', faint:'#6B6578' },
  light: { bg:'#F7F4EE', panel:'#FFFFFF', raised:'#FBF9F4', line:'#E4DFD4', ink:'#1A1822', sub:'#5C5668', faint:'#9A93A6' },
};
const DOMAIN = {
  fintech:   { label:'FinTech',  color:'#2D9B8F' },
  dev:       { label:'Dev & AI', color:'#7C5CFF' },
  trading:   { label:'Trading',  color:'#D98E2B' },
  marketing: { label:'Growth',   color:'#C2476B' },
};
const WORKFLOW = {
  redpin:     { label:'Redpin',     icon:'⬡', color:'#2D9B8F' },
  nifty:      { label:'NIFTY',      icon:'◈', color:'#D98E2B' },
  reel_iq:    { label:'Reel IQ',    icon:'◎', color:'#C2476B' },
  automation: { label:'Automation', icon:'⟳', color:'#7C5CFF' },
  general:    { label:'General',    icon:'◆', color:'#6B6578' },
};
const DOMAINS = Object.keys(DOMAIN);
const URG  = { high:'#C2476B', medium:'#D98E2B', low:'#2D9B8F' };
const IMP  = { high:'#C2476B', medium:'#D98E2B', low:'#6B6578' };
const SIG  = { strong:'#2D9B8F', moderate:'#D98E2B', weak:'#C2476B' };

// ─── Learner (inline — no import needed in artifact) ──────────────
const DEFAULT_WEIGHTS = { fintech:1.0, dev:1.0, trading:1.0, marketing:1.0 };
const LEARNING_RATE = 0.08;

function loadWeights() {
  try { return { ...DEFAULT_WEIGHTS, ...JSON.parse(localStorage.getItem('gis_weights') || '{}') }; }
  catch { return { ...DEFAULT_WEIGHTS }; }
}
function saveWeights(w) {
  try { localStorage.setItem('gis_weights', JSON.stringify(w)); } catch {}
}
function recordFeedback(repoId, signal, domain, score, weights) {
  const dir = signal === 'up' ? 1 : -1;
  const delta = LEARNING_RATE * dir * (score / 100);
  const next = { ...weights };
  next[domain] = parseFloat(Math.min(2.0, Math.max(0.4, (next[domain] || 1) + delta)).toFixed(3));
  saveWeights(next);
  return next;
}
function resetWeights() {
  try { localStorage.removeItem('gis_weights'); } catch {}
  return { ...DEFAULT_WEIGHTS };
}

// ─── Export (inline) ──────────────────────────────────────────────
function toBriefingText(b) {
  const hr = '─'.repeat(60);
  const picks = b.top_picks.map(p =>
    `\n${p.rank}. ${p.headline}\n   ${p.primary_workflow.toUpperCase()} · ${p.urgency.toUpperCase()}\n   Why now: ${p.why_now}\n   → ${p.action}\n   https://github.com/${p.repo_id}`
  ).join('\n');
  return `GITHUB INTELLIGENCE STATION — MORNING BRIEF\n${b.briefing_date} · Signal: ${b.signal_quality.toUpperCase()} · ${b.total_scanned} repos\n\n${hr}\n${b.executive_summary}\n\nTOP PICKS\n${hr}${picks}\n\n${hr}\ngithub.com/Thesoulofsuccess/github-intel-station`;
}
function toMarkdown(b) {
  const picks = b.top_picks.map(p =>
    `\n### ${p.rank}. ${p.headline}\n**Workflow:** \`${p.primary_workflow}\` · **Urgency:** \`${p.urgency}\`\n**Why now:** ${p.why_now}\n**→ Action:** ${p.action}\n**Repo:** [${p.repo_id}](https://github.com/${p.repo_id})`
  ).join('\n');
  return `# Morning Brief — ${b.briefing_date}\n> **Signal:** ${b.signal_quality} · ${b.total_scanned} repos scanned\n\n## Executive Summary\n${b.executive_summary}\n\n## Top Picks${picks}\n\n---\n*The Intelligence Station*`;
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const el = Object.assign(document.createElement('textarea'), { value:text, style:'position:fixed;opacity:0' });
    document.body.appendChild(el); el.focus(); el.select();
    const ok = document.execCommand('copy'); document.body.removeChild(el); return ok;
  }
}
function downloadText(text, name) {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([text], {type:'text/plain'})), download: name
  });
  a.click();
}

// ─── Full demo data ────────────────────────────────────────────────
const DEMO_REPOS = [
  { id:'browser-use/browser-use', stars:48200, language:'Python', last_pushed:'2026-05-28', url:'https://github.com/browser-use/browser-use', found_via:['dev'],
    analysis:{ primary_domain:'dev', urgency:'high', summary:'AI agents that drive a real browser end-to-end. Mature, fast-moving, 48K stars.',
      scores:{ fintech:{score:62,confidence:70,reasoning:'Automates bank-portal reconciliation and KYC flows.'}, dev:{score:94,confidence:90,reasoning:'Best-in-class browser agent framework.'}, trading:{score:55,confidence:60,reasoning:'Scrapes broker dashboards and market data pages.'}, marketing:{score:48,confidence:55,reasoning:'Automates influencer research gathering.'} } },
    connection:{ cross_domain:true, cross_domain_leap:"Maps directly to Redpin's manual bank-portal reconciliation — automating what ops does by hand today.",
      connections:[ {workflow:'redpin',impact:'high',insight:'Automate JP Morgan Chase portal reconciliation and Cross River Bank statement pulls — eliminating daily manual ops.'}, {workflow:'reel_iq',impact:'medium',insight:'Scrape and aggregate competitor influencer pages to feed Reel IQ trend detection.'}, {workflow:'automation',impact:'medium',insight:'Wraps into n8n as a browser-action node, replacing manual steps in web-dependent workflows.'} ] } },
  { id:'OpenBB-finance/OpenBB', stars:38900, language:'Python', last_pushed:'2026-05-29', url:'https://github.com/OpenBB-finance/OpenBB', found_via:['trading','fintech'],
    analysis:{ primary_domain:'trading', urgency:'high', summary:'Open-source investment research with options analytics and live market data feeds.',
      scores:{ fintech:{score:71,confidence:80,reasoning:'Market data infra reusable for Redpin ops dashboards.'}, dev:{score:68,confidence:75,reasoning:'Well-engineered extensible Python platform.'}, trading:{score:92,confidence:88,reasoning:'Options analytics + candle data fit CE/PE 5-min framework directly.'}, marketing:{score:20,confidence:60,reasoning:'Minimal marketing relevance.'} } },
    connection:{ cross_domain:false, cross_domain_leap:null,
      connections:[ {workflow:'nifty',impact:'high',insight:'Pull live NIFTY options chain and first-candle OHLCV into your CE/PE scoring model — no manual sourcing.'}, {workflow:'redpin',impact:'medium',insight:'Its data-feed architecture blueprints a real-time payment-volume monitoring dashboard.'}, {workflow:'automation',impact:'medium',insight:"Schedule OpenBB pulls via n8n to auto-populate your trading journal before market open."} ] } },
  { id:'langflow-ai/langflow', stars:52100, language:'Python', last_pushed:'2026-05-30', url:'https://github.com/langflow-ai/langflow', found_via:['dev'],
    analysis:{ primary_domain:'dev', urgency:'medium', summary:'Visual low-code builder for multi-agent LLM workflows — drag-and-drop agent graphs.',
      scores:{ fintech:{score:58,confidence:65,reasoning:'Could model compliance-review flows visually.'}, dev:{score:89,confidence:85,reasoning:'Excellent multi-agent orchestration tooling.'}, trading:{score:44,confidence:55,reasoning:'Could wire trade-signal pipelines visually.'}, marketing:{score:66,confidence:60,reasoning:'Could power Reel IQ content flows without code changes.'} } },
    connection:{ cross_domain:true, cross_domain_leap:'The Scout→Analyst→Connector→Briefer pipeline in this project could be prototyped in Langflow first — cutting dev time in half.',
      connections:[ {workflow:'reel_iq',impact:'high',insight:"Wrap Reel IQ's Claude scoring pipeline in Langflow — non-engineers can tweak prompts without touching Python."}, {workflow:'redpin',impact:'medium',insight:'Model ACH exception-handling flows visually — makes compliance logic reviewable by non-technical stakeholders.'} ] } },
  { id:'mindsdb/mindsdb', stars:33400, language:'Python', last_pushed:'2026-05-27', url:'https://github.com/mindsdb/mindsdb', found_via:['dev','fintech'],
    analysis:{ primary_domain:'fintech', urgency:'medium', summary:'Runs ML predictions directly inside databases via SQL — no separate pipeline needed.',
      scores:{ fintech:{score:84,confidence:82,reasoning:'In-DB ML ideal for real-time payment fraud scoring at Redpin.'}, dev:{score:76,confidence:78,reasoning:'Clean SQL-native ML abstraction.'}, trading:{score:70,confidence:68,reasoning:'Run candle-pattern ML directly in trade DB.'}, marketing:{score:52,confidence:55,reasoning:'Audience churn prediction without a separate ML service.'} } },
    connection:{ cross_domain:false, cross_domain_leap:null,
      connections:[ {workflow:'redpin',impact:'high',insight:'Run real-time ACH fraud-scoring ML inside your payments DB — no separate service, no added latency.'}, {workflow:'nifty',impact:'medium',insight:'Store NIFTY candle history and run CE/PE signal-detection SQL with embedded ML.'} ] } },
  { id:'PostHog/posthog', stars:24800, language:'TypeScript', last_pushed:'2026-05-29', url:'https://github.com/PostHog/posthog', found_via:['marketing'],
    analysis:{ primary_domain:'marketing', urgency:'low', summary:'Open-source product analytics — funnels, session replay, feature flags, self-hostable.',
      scores:{ fintech:{score:30,confidence:60,reasoning:'Limited direct payments relevance.'}, dev:{score:64,confidence:70,reasoning:'Solid self-hostable analytics infra.'}, trading:{score:12,confidence:55,reasoning:'Not relevant to trading.'}, marketing:{score:88,confidence:84,reasoning:'Funnel analytics exactly what Reel IQ needs.'} } },
    connection:{ cross_domain:false, cross_domain_leap:null,
      connections:[ {workflow:'reel_iq',impact:'high',insight:"Self-host inside Reel IQ to track which content-scoring features influencers actually use."}, {workflow:'redpin',impact:'low',insight:'Measure internal ops tool adoption — which dashboards are actually being used.'} ] } },
];

const DEMO_BRIEFING = {
  briefing_date:'2026-05-30', signal_quality:'strong', total_scanned:5,
  domains_covered:['fintech','dev','trading','marketing'],
  executive_summary:"Strong signal week — two high-urgency repos with direct, immediate application to your core workflows. browser-use eliminates manual bank-portal ops at Redpin; OpenBB gives your NIFTY CE/PE framework live options data it currently lacks. The ML-in-database play from MindsDB is the sleeper pick — lowest-friction path to real-time fraud scoring without a separate infrastructure investment.",
  top_picks:[
    { rank:1, repo_id:'browser-use/browser-use', headline:"Eliminate Redpin's manual bank reconciliation today", why_now:'Production-ready, 48K stars, maps directly to your JPM Chase + Cross River portal ops.', action:'Fork, connect to your test JPM Chase portal, run against one week of reconciliation data.', urgency:'high', primary_workflow:'redpin' },
    { rank:2, repo_id:'OpenBB-finance/OpenBB', headline:'Give your NIFTY model live options chain data', why_now:"Your CE/PE 5-min candle strategy is data-constrained — OpenBB removes that constraint this week.", action:"Install OpenBB, pull NIFTY options chain for tomorrow's open, validate against your manual source.", urgency:'high', primary_workflow:'nifty' },
    { rank:3, repo_id:'mindsdb/mindsdb', headline:'Real-time ACH fraud scoring, no new service', why_now:'SQL-native ML means zero new infrastructure — works inside your existing payments DB.', action:'Run MindsDB on 30 days of Redpin ACH transactions, benchmark against current exception rate.', urgency:'medium', primary_workflow:'redpin' },
    { rank:4, repo_id:'langflow-ai/langflow', headline:"Let non-engineers iterate Reel IQ's AI prompts", why_now:'Reel IQ scaling bottleneck is prompt engineering requiring dev time — Langflow breaks that.', action:'Wrap one Reel IQ Claude analysis flow in Langflow, test with a non-technical team member.', urgency:'medium', primary_workflow:'reel_iq' },
    { rank:5, repo_id:'PostHog/posthog', headline:'Know which Reel IQ features actually get used', why_now:"Can't prioritise the roadmap without usage data — self-host PostHog this sprint.", action:'Deploy PostHog alongside Reel IQ Streamlit, instrument the 3 core scoring features.', urgency:'low', primary_workflow:'reel_iq' },
  ],
  skip_list:[],
};

// ─── Components ───────────────────────────────────────────────────
function Sparkline({ scores }) {
  return (
    <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:20 }}>
      {DOMAINS.map(d => (
        <div key={d} title={`${DOMAIN[d].label}: ${scores[d].score}`}
          style={{ width:5, height:`${Math.max(8,scores[d].score)}%`, minHeight:3,
            background:DOMAIN[d].color, borderRadius:2, opacity:0.8 }} />
      ))}
    </div>
  );
}

function WeightBar({ domain, weight, c }) {
  const pct = ((weight - 0.4) / (2.0 - 0.4)) * 100;
  const col = DOMAIN[domain].color;
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
        <span style={{ fontSize:11, color:col, fontFamily:'Spectral', fontStyle:'italic' }}>{DOMAIN[domain].label}</span>
        <span style={{ fontSize:10, fontFamily:'IBM Plex Mono', color: weight > 1 ? col : weight < 1 ? URG.high : c.faint }}>
          {weight.toFixed(2)}×
        </span>
      </div>
      <div style={{ height:3, background:c.line, borderRadius:2, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:col, borderRadius:2,
          transition:'width .6s cubic-bezier(.2,.7,.2,1)' }} />
      </div>
    </div>
  );
}

function LearnerPanel({ weights, feedbackCount, onReset, c, visible }) {
  const [open, setOpen] = useState(false);
  if (!visible) return null;
  const hasLearned = feedbackCount > 0;
  return (
    <div style={{ background:c.panel, border:`1px solid ${c.line}`, borderRadius:8,
      marginBottom:20, overflow:'hidden' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'13px 20px', background:'none', border:'none', cursor:'pointer', color:c.ink }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:2.5, color:c.faint, textTransform:'uppercase' }}>
            Learner · Domain Weights
          </span>
          {hasLearned && (
            <span style={{ fontFamily:'IBM Plex Mono', fontSize:9, color:DOMAIN.dev.color,
              border:`1px solid ${DOMAIN.dev.color}44`, padding:'1px 6px', borderRadius:3 }}>
              {feedbackCount} signals recorded
            </span>
          )}
          {!hasLearned && (
            <span style={{ fontFamily:'IBM Plex Mono', fontSize:9, color:c.faint, fontStyle:'italic' }}>
              rate repos to teach the scout
            </span>
          )}
        </div>
        <span style={{ color:c.faint, fontSize:11, fontFamily:'IBM Plex Mono' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding:'4px 20px 16px', borderTop:`1px solid ${c.line}`, animation:'fade .3s ease both' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 24px', marginBottom:12 }}>
            {DOMAINS.map(d => <WeightBar key={d} domain={d} weight={weights[d]} c={c} />)}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ fontSize:12, color:c.faint, fontStyle:'italic', margin:0 }}>
              Thumbs up/down on repos shifts these weights. The next scan uses them.
            </p>
            {hasLearned && (
              <button onClick={onReset} style={{ background:'none', border:`1px solid ${c.line}`,
                color:c.faint, borderRadius:4, padding:'4px 10px', fontSize:10,
                cursor:'pointer', fontFamily:'IBM Plex Mono' }}>reset</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ExportPanel({ briefing, c, visible }) {
  const [copied, setCopied] = useState('');
  if (!visible || !briefing) return null;
  async function handle(type) {
    if (type === 'copy') {
      await copyText(toBriefingText(briefing));
      setCopied('copy'); setTimeout(() => setCopied(''), 2000);
    } else if (type === 'md') {
      downloadText(toMarkdown(briefing), `intel-brief-${briefing.briefing_date}.md`);
      setCopied('md'); setTimeout(() => setCopied(''), 2000);
    } else if (type === 'txt') {
      downloadText(toBriefingText(briefing), `intel-brief-${briefing.briefing_date}.txt`);
      setCopied('txt'); setTimeout(() => setCopied(''), 2000);
    }
  }
  return (
    <div style={{ background:c.panel, border:`1px solid ${c.line}`, borderRadius:8,
      padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
      <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:2, color:c.faint,
        textTransform:'uppercase', marginRight:4 }}>Export</span>
      {[
        { key:'copy', label: copied==='copy' ? '✓ copied' : 'copy to clipboard' },
        { key:'md',   label: copied==='md'   ? '✓ downloaded' : '↓ markdown' },
        { key:'txt',  label: copied==='txt'  ? '✓ downloaded' : '↓ plain text' },
      ].map(btn => (
        <button key={btn.key} onClick={() => handle(btn.key)}
          style={{ background:'none', border:`1px solid ${c.line}`, color:c.sub,
            borderRadius:20, padding:'5px 14px', fontSize:12, cursor:'pointer',
            fontFamily:'IBM Plex Mono', letterSpacing:0.3, transition:'color .2s, border-color .2s',
            ...(copied===btn.key ? { color:DOMAIN.fintech.color, borderColor:DOMAIN.fintech.color } : {}) }}>
          {btn.label}
        </button>
      ))}
    </div>
  );
}

function WorkflowPill({ conn }) {
  const w = WORKFLOW[conn.workflow] || WORKFLOW.general;
  return (
    <div style={{ display:'flex', gap:9, padding:'9px 12px', borderRadius:6,
      background:`${w.color}0D`, border:`1px solid ${w.color}28`, marginBottom:6 }}>
      <span style={{ color:w.color, fontSize:13, flexShrink:0 }}>{w.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
          <span style={{ fontSize:10, fontFamily:'IBM Plex Mono', color:w.color, letterSpacing:0.5 }}>{w.label}</span>
          <span style={{ fontSize:9, fontFamily:'IBM Plex Mono', color:IMP[conn.impact], letterSpacing:1, textTransform:'uppercase' }}>{conn.impact}</span>
        </div>
        <p style={{ margin:0, fontSize:13, lineHeight:1.55 }}>{conn.insight}</p>
      </div>
    </div>
  );
}

function FeedbackButtons({ repoId, domain, score, onFeedback, c }) {
  const [voted, setVoted] = useState(null);
  function vote(signal) {
    setVoted(signal);
    onFeedback(repoId, signal, domain, score);
  }
  return (
    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
      <span style={{ fontSize:10, fontFamily:'IBM Plex Mono', color:c.faint, letterSpacing:0.5 }}>helpful?</span>
      {['up','down'].map(sig => (
        <button key={sig} onClick={() => vote(sig)}
          style={{ background: voted===sig ? (sig==='up'?DOMAIN.trading.color:URG.high)+'22' : 'none',
            border:`1px solid ${voted===sig ? (sig==='up'?DOMAIN.trading.color:URG.high) : c.line}`,
            color: voted===sig ? (sig==='up'?DOMAIN.trading.color:URG.high) : c.faint,
            borderRadius:4, padding:'3px 8px', fontSize:12, cursor:'pointer',
            transition:'all .2s', fontFamily:'IBM Plex Mono' }}>
          {sig==='up' ? '👍' : '👎'}
        </button>
      ))}
    </div>
  );
}

function BriefingPanel({ briefing, c, visible, onFeedback, weights }) {
  const [open, setOpen] = useState(true);
  if (!visible || !briefing) return null;
  return (
    <div style={{ background:c.panel, border:`1px solid ${c.line}`, borderRadius:8,
      marginBottom:20, overflow:'hidden', animation:'rise .5s cubic-bezier(.2,.7,.2,1) both' }}>
      <div style={{ padding:'16px 22px', borderBottom:`1px solid ${c.line}`,
        display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:3, color:c.faint, textTransform:'uppercase' }}>
            Morning Brief · {briefing.briefing_date}
          </span>
          <span style={{ fontSize:9, fontFamily:'IBM Plex Mono', color:SIG[briefing.signal_quality],
            border:`1px solid ${SIG[briefing.signal_quality]}44`, padding:'2px 7px', borderRadius:3, letterSpacing:1, textTransform:'uppercase' }}>
            {briefing.signal_quality} signal
          </span>
          <span style={{ fontSize:10, fontFamily:'IBM Plex Mono', color:c.faint }}>
            {briefing.total_scanned} repos scanned
          </span>
        </div>
        <button onClick={() => setOpen(!open)} style={{ background:'none', border:'none',
          color:c.faint, fontSize:12, cursor:'pointer', fontFamily:'IBM Plex Mono' }}>
          {open ? '▲' : '▼'}
        </button>
      </div>
      {open && (
        <>
          <div style={{ padding:'18px 22px', borderBottom:`1px solid ${c.line}` }}>
            <p style={{ fontSize:15.5, lineHeight:1.7, color:c.ink, margin:0, maxWidth:'64ch' }}>
              {briefing.executive_summary}
            </p>
          </div>
          <div style={{ padding:'18px 22px' }}>
            <div style={{ fontFamily:'IBM Plex Mono', fontSize:9, letterSpacing:2.5, color:c.faint,
              textTransform:'uppercase', marginBottom:16 }}>
              Top picks · ranked by urgency × opportunity
            </div>
            {briefing.top_picks.map((pick, i) => {
              const wf = WORKFLOW[pick.primary_workflow] || WORKFLOW.general;
              const repo = DEMO_REPOS.find(r => r.id === pick.repo_id);
              const domainScore = repo?.analysis?.scores[repo?.analysis?.primary_domain]?.score || 80;
              return (
                <div key={pick.repo_id} style={{ display:'flex', gap:14, padding:'13px 0',
                  borderBottom: i < briefing.top_picks.length-1 ? `1px solid ${c.line}` : 'none',
                  animation:`rise .5s cubic-bezier(.2,.7,.2,1) ${i*0.05}s both` }}>
                  <div style={{ fontFamily:'IBM Plex Mono', fontSize:20, color:c.line,
                    fontWeight:700, width:26, flexShrink:0, lineHeight:1, paddingTop:3 }}>
                    {pick.rank}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                      <span style={{ fontSize:15, fontFamily:'Spectral', fontWeight:500, color:c.ink, lineHeight:1.2 }}>
                        {pick.headline}
                      </span>
                      <span style={{ fontSize:9, color:wf.color, fontFamily:'IBM Plex Mono',
                        border:`1px solid ${wf.color}44`, padding:'1px 5px', borderRadius:3,
                        letterSpacing:0.8, textTransform:'uppercase', flexShrink:0 }}>{wf.label}</span>
                      <span style={{ fontSize:9, color:URG[pick.urgency], fontFamily:'IBM Plex Mono',
                        letterSpacing:1, textTransform:'uppercase', flexShrink:0 }}>{pick.urgency}</span>
                    </div>
                    <p style={{ fontSize:13, color:c.sub, margin:'0 0 6px', lineHeight:1.5 }}>{pick.why_now}</p>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:8 }}>
                      <span style={{ fontSize:11, color:c.faint, fontFamily:'IBM Plex Mono', flexShrink:0, marginTop:2 }}>→</span>
                      <p style={{ fontSize:13, color:c.ink, margin:0, lineHeight:1.5, fontStyle:'italic' }}>{pick.action}</p>
                    </div>
                    <FeedbackButtons repoId={pick.repo_id} domain={repo?.analysis?.primary_domain || 'dev'}
                      score={domainScore} onFeedback={onFeedback} c={c} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Card({ repo, c, index, onFeedback }) {
  const [openConns, setOpenConns] = useState(false);
  const [openScores, setOpenScores] = useState(false);
  const [hover, setHover] = useState(false);
  const a = repo.analysis;
  const conn = repo.connection;
  const pd = DOMAIN[a.primary_domain];
  const topConn = conn?.connections?.[0];
  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background:c.panel, border:`1px solid ${hover?pd.color+'44':c.line}`,
        borderRadius:6, padding:'18px 20px', position:'relative', overflow:'hidden',
        transition:'border-color .3s, transform .3s', transform:hover?'translateY(-1px)':'none',
        animation:`rise .5s cubic-bezier(.2,.7,.2,1) ${index*0.06}s both` }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2,
        background:pd.color, opacity:hover?1:0.3, transition:'opacity .3s' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:8 }}>
        <div>
          <div style={{ display:'flex', gap:9, marginBottom:5, flexWrap:'wrap', alignItems:'baseline' }}>
            <span style={{ fontSize:11, color:pd.color, fontFamily:'Spectral', fontStyle:'italic' }}>{pd.label}</span>
            <span style={{ fontSize:9, color:URG[a.urgency], fontFamily:'IBM Plex Mono', letterSpacing:1.5, textTransform:'uppercase' }}>{a.urgency}</span>
            {conn?.cross_domain && <span style={{ fontSize:9, color:'#7C5CFF', fontFamily:'IBM Plex Mono', border:'1px solid #7C5CFF33', padding:'1px 5px', borderRadius:3 }}>cross-domain</span>}
          </div>
          <a href={repo.url} target="_blank" rel="noreferrer"
            style={{ color:c.ink, fontSize:17, fontFamily:'Spectral', fontWeight:500,
              textDecoration:'none', letterSpacing:-0.2, lineHeight:1.2, display:'inline-block',
              borderBottom:`1px solid ${hover?pd.color:'transparent'}`, transition:'border-color .3s' }}>
            {repo.id}
          </a>
        </div>
        <Sparkline scores={a.scores} />
      </div>
      <p style={{ color:c.sub, fontSize:13.5, lineHeight:1.6, margin:'0 0 11px', maxWidth:'58ch' }}>{a.summary}</p>
      {topConn && (
        <div style={{ marginBottom:10 }}>
          <WorkflowPill conn={topConn} />
          {conn?.cross_domain_leap && (
            <p style={{ margin:'3px 0 0', fontSize:11.5, color:c.faint, fontStyle:'italic', lineHeight:1.5, paddingLeft:2 }}>
              ↳ {conn.cross_domain_leap}
            </p>
          )}
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', gap:12, fontSize:11, color:c.faint, fontFamily:'IBM Plex Mono' }}>
          <span>{repo.stars.toLocaleString()} ★</span>
          <span>{repo.language}</span>
          <span>{repo.last_pushed}</span>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <FeedbackButtons repoId={repo.id} domain={a.primary_domain}
            score={a.scores[a.primary_domain].score} onFeedback={onFeedback} c={c} />
          {conn?.connections?.length > 1 && (
            <button onClick={() => setOpenConns(!openConns)} style={{ background:'none', border:'none',
              color:c.faint, fontSize:10, cursor:'pointer', fontFamily:'IBM Plex Mono',
              borderBottom:`1px solid ${c.line}`, paddingBottom:1 }}>
              {openConns ? 'less —' : `+${conn.connections.length-1} more`}
            </button>
          )}
          <button onClick={() => setOpenScores(!openScores)} style={{ background:'none', border:'none',
            color:c.faint, fontSize:10, cursor:'pointer', fontFamily:'IBM Plex Mono',
            borderBottom:`1px solid ${c.line}`, paddingBottom:1 }}>
            {openScores ? 'hide scores' : 'scores +'}
          </button>
        </div>
      </div>
      {openConns && conn?.connections?.slice(1).map((cn,i) => (
        <div key={i} style={{ marginTop:i===0?10:0 }}><WorkflowPill conn={cn} /></div>
      ))}
      {openScores && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${c.line}`,
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 20px', animation:'fade .3s ease both' }}>
          {DOMAINS.map(d => {
            const s = a.scores[d];
            return (
              <div key={d}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:10, color:DOMAIN[d].color, fontFamily:'Spectral', fontStyle:'italic' }}>{DOMAIN[d].label}</span>
                  <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, color:c.ink }}>
                    {s.score}<span style={{ color:c.faint, fontSize:9 }}>/{s.confidence}c</span>
                  </span>
                </div>
                <div style={{ height:3, background:c.line, borderRadius:2, overflow:'hidden', marginBottom:3 }}>
                  <div style={{ width:`${s.score}%`, height:'100%', background:DOMAIN[d].color, transition:'width .7s ease' }} />
                </div>
                <div style={{ fontSize:11, color:c.sub, lineHeight:1.5 }}>{s.reasoning}</div>
                {s.confidence < 50 && <div style={{ fontSize:9, color:URG.medium, marginTop:2, fontFamily:'IBM Plex Mono' }}>⚠ low signal</div>}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
const STAGES = ['scouting','analyzing','connecting','briefing','done'];

export default function App() {
  const [mode, setMode]       = useState('dark');
  const [repos, setRepos]     = useState([]);
  const [briefing, setBriefing] = useState(null);
  const [status, setStatus]   = useState('idle');
  const [stage, setStage]     = useState('');
  const [filter, setFilter]   = useState('all');
  const [view, setView]       = useState('brief');
  const [weights, setWeights] = useState(() => loadWeights());
  const [feedbackCount, setFeedbackCount] = useState(0);
  const c = THEMES[mode];

  const handleFeedback = useCallback((repoId, signal, domain, score) => {
    const next = recordFeedback(repoId, signal, domain, score, weights);
    setWeights(next);
    setFeedbackCount(n => n + 1);
  }, [weights]);

  const handleReset = useCallback(() => {
    setWeights(resetWeights());
    setFeedbackCount(0);
  }, []);

  async function run() {
    setStatus('running'); setRepos([]); setBriefing(null);
    for (const s of ['scouting','analyzing','connecting']) {
      setStage(s); await new Promise(r => setTimeout(r, 600));
    }
    setStage('connecting');
    for (let i = 0; i < DEMO_REPOS.length; i++) {
      await new Promise(r => setTimeout(r, 280));
      setRepos(p => [...p, DEMO_REPOS[i]]);
    }
    setStage('briefing'); await new Promise(r => setTimeout(r, 900));
    setBriefing(DEMO_BRIEFING);
    setStage('done'); setStatus('done');
  }
  useEffect(() => { run(); }, []);

  const stageIdx = STAGES.indexOf(stage);
  const filtered = useMemo(() => {
    const l = filter==='all' ? repos
      : filter==='cross' ? repos.filter(r => r.connection?.cross_domain)
      : repos.filter(r => r.analysis.primary_domain === filter);
    return [...l].sort((a,b) =>
      b.analysis.scores[b.analysis.primary_domain].score - a.analysis.scores[a.analysis.primary_domain].score);
  }, [repos, filter]);

  const PIPE = [
    {key:'scouting',  label:'Scout',     color:DOMAIN.dev.color},
    {key:'analyzing', label:'Analyst',   color:DOMAIN.trading.color},
    {key:'connecting',label:'Connector', color:DOMAIN.fintech.color},
    {key:'briefing',  label:'Briefer',   color:DOMAIN.marketing.color},
  ];

  return (
    <div style={{ minHeight:'100vh', background:c.bg, color:c.ink,
      fontFamily:'Spectral, Georgia, serif', transition:'background .5s, color .5s' }}>
      <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>
      <div style={{ maxWidth:780, margin:'0 auto', padding:'40px 22px 80px' }}>

        {/* Masthead */}
        <header style={{ marginBottom:32 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:3, color:c.faint, textTransform:'uppercase' }}>
              The Intelligence Station · v1
            </span>
            <button onClick={() => setMode(mode==='dark'?'light':'dark')}
              style={{ background:c.raised, border:`1px solid ${c.line}`, color:c.sub,
                borderRadius:20, padding:'5px 14px', fontSize:11, cursor:'pointer', fontFamily:'IBM Plex Mono' }}>
              {mode==='dark' ? '☀ light' : '☾ dark'}
            </button>
          </div>
          <h1 style={{ fontSize:38, fontWeight:600, letterSpacing:-1.5, lineHeight:1.08, marginBottom:10 }}>
            What's worth<br/><em style={{ fontWeight:400 }}>your attention</em> today.
          </h1>
          <p style={{ fontSize:15, color:c.sub, lineHeight:1.65, maxWidth:'50ch' }}>
            Five agents range all of GitHub and return one ranked brief — with the specific line
            that ties each repo to Redpin, your NIFTY framework, or Reel IQ.
          </p>
        </header>

        {/* Pipeline */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20,
          paddingBottom:18, borderBottom:`1px solid ${c.line}`, flexWrap:'wrap' }}>
          {PIPE.map((s, i) => {
            const idx = STAGES.indexOf(s.key);
            const st  = idx < stageIdx ? 'done' : idx===stageIdx ? 'run' : 'wait';
            const col = st==='done' ? c.sub : st==='run' ? s.color : c.faint;
            return (
              <React.Fragment key={s.key}>
                {i>0 && <span style={{ color:c.faint, fontFamily:'IBM Plex Mono', fontSize:11 }}>→</span>}
                <span style={{ display:'flex', alignItems:'center', gap:5, color:col, fontFamily:'IBM Plex Mono', fontSize:11 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:col,
                    flexShrink:0, animation:st==='run'?'pulse 1s infinite':'none' }} />
                  {s.label}
                </span>
              </React.Fragment>
            );
          })}
          <span style={{ flex:1 }} />
          {status==='done' && (
            <button onClick={run} style={{ background:'none', border:`1px solid ${c.line}`, color:c.sub,
              borderRadius:20, padding:'4px 14px', fontSize:10, cursor:'pointer', fontFamily:'IBM Plex Mono' }}>
              ↻ rescan
            </button>
          )}
        </div>

        {/* View toggle + stats */}
        {status==='done' && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
            marginBottom:18, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', gap:5 }}>
              {[{k:'brief',l:'Morning Brief'},{k:'feed',l:'Repo Feed'}].map(({k,l}) => (
                <button key={k} onClick={() => setView(k)}
                  style={{ background:view===k?`${c.ink}12`:'transparent',
                    border:`1px solid ${view===k?c.ink:c.line}`, color:view===k?c.ink:c.sub,
                    borderRadius:20, padding:'5px 14px', fontSize:12.5, cursor:'pointer',
                    fontFamily:'Spectral', transition:'all .2s' }}>{l}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:14, fontFamily:'IBM Plex Mono', fontSize:10, color:c.faint }}>
              <span>{repos.length} repos</span>
              <span style={{ color:URG.high }}>{repos.filter(r=>r.analysis.urgency==='high').length} urgent</span>
              <span style={{ color:DOMAIN.dev.color }}>{repos.filter(r=>r.connection?.cross_domain).length} cross-domain</span>
              {feedbackCount > 0 && <span style={{ color:DOMAIN.fintech.color }}>{feedbackCount} signals</span>}
            </div>
          </div>
        )}

        {/* Learner panel */}
        <LearnerPanel weights={weights} feedbackCount={feedbackCount} onReset={handleReset} c={c} visible={status==='done'} />

        {/* Export panel */}
        <ExportPanel briefing={briefing} c={c} visible={status==='done' && view==='brief'} />

        {/* Morning brief */}
        {view==='brief' && (
          <>
            {stage==='briefing' && (
              <div style={{ padding:'24px 20px', background:c.panel, border:`1px solid ${c.line}`,
                borderRadius:8, marginBottom:18, animation:'fade .4s ease both' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:DOMAIN.marketing.color,
                  display:'inline-block', marginRight:10, animation:'pulse 1s infinite' }} />
                <span style={{ color:c.sub, fontStyle:'italic', fontSize:14 }}>
                  Briefer synthesising {repos.length} repos into your morning brief…
                </span>
              </div>
            )}
            <BriefingPanel briefing={briefing} c={c} visible={!!briefing}
              onFeedback={handleFeedback} weights={weights} />
          </>
        )}

        {/* Repo feed */}
        {view==='feed' && (
          <>
            <div style={{ display:'flex', gap:5, marginBottom:18, flexWrap:'wrap' }}>
              {[{key:'all',label:'All'}, ...DOMAINS.map(d=>({key:d,label:DOMAIN[d].label,color:DOMAIN[d].color})),
                {key:'cross',label:'Cross-domain',color:'#7C5CFF'}].map(({key,label,color}) => (
                <button key={key} onClick={() => setFilter(key)}
                  style={{ background:filter===key?`${color||c.ink}15`:'transparent',
                    border:`1px solid ${filter===key?(color||c.ink):c.line}`,
                    color:filter===key?(color||c.ink):c.sub, borderRadius:20,
                    padding:'5px 13px', fontSize:12.5, cursor:'pointer',
                    fontFamily:'Spectral', transition:'all .2s' }}>{label}</button>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {filtered.map((r,i) => <Card key={r.id} repo={r} c={c} index={i} onFeedback={handleFeedback} />)}
              {repos.length===0 && (
                <div style={{ padding:'48px 0', textAlign:'center', color:c.faint, fontStyle:'italic', fontSize:15 }}>
                  {stage==='scouting' && 'Scout ranging across four domains…'}
                  {stage==='analyzing' && 'Analyst scoring each repo…'}
                  {stage==='connecting' && 'Connector mapping to your workflows…'}
                  {!stage && 'Waking the agents…'}
                </div>
              )}
            </div>
          </>
        )}

        <footer style={{ marginTop:44, paddingTop:18, borderTop:`1px solid ${c.line}`,
          fontSize:11.5, color:c.faint, lineHeight:1.7, fontStyle:'italic' }}>
          Preview on representative data. Under Claude Code with your GitHub + Anthropic keys,
          all five agents run live. Rate repos to teach the Learner — weights persist between sessions.
          Change MODEL in api/claude.js to your Opus 4.8 string for maximum intelligence.
        </footer>
      </div>
    </div>
  );
}
