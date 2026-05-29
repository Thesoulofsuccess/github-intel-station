import React, { useState, useEffect, useMemo } from 'react';

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
const SIG  = { strong:'#2D9B8F', moderate:'#D98E2B', weak:'#6B6578' };

// ─── Full pipeline demo data ───────────────────────────────────────
const DEMO_REPOS = [
  { id:'browser-use/browser-use', stars:48200, language:'Python', last_pushed:'2026-05-28', url:'https://github.com/browser-use/browser-use', found_via:['dev'],
    analysis:{ primary_domain:'dev', urgency:'high', summary:'AI agents that drive a real browser end-to-end. Mature, fast-moving, huge community.',
      scores:{ fintech:{score:62,confidence:70,reasoning:'Automates bank-portal reconciliation and KYC flows.'}, dev:{score:94,confidence:90,reasoning:'Best-in-class browser agent framework.'}, trading:{score:55,confidence:60,reasoning:'Can scrape broker dashboards and market data.'}, marketing:{score:48,confidence:55,reasoning:'Automates influencer research gathering.'} } },
    connection:{ cross_domain:true, cross_domain_leap:'Maps directly to Redpin\'s manual bank-portal reconciliation — automating what your ops team does by hand today.',
      connections:[ { workflow:'redpin', impact:'high', insight:'Automate JP Morgan Chase portal reconciliation and Cross River Bank statement pulls — eliminating daily manual ops.' }, { workflow:'reel_iq', impact:'medium', insight:'Scrape and aggregate competitor influencer pages to feed Reel IQ\'s trend-detection pipeline.' }, { workflow:'automation', impact:'medium', insight:'Wraps into n8n as a browser-action node, replacing manual steps in any web-dependent workflow.' } ] } },
  { id:'OpenBB-finance/OpenBB', stars:38900, language:'Python', last_pushed:'2026-05-29', url:'https://github.com/OpenBB-finance/OpenBB', found_via:['trading','fintech'],
    analysis:{ primary_domain:'trading', urgency:'high', summary:'Open-source investment research platform with options analytics and live market data.',
      scores:{ fintech:{score:71,confidence:80,reasoning:'Market data infrastructure reusable for Redpin ops dashboards.'}, dev:{score:68,confidence:75,reasoning:'Well-engineered extensible platform.'}, trading:{score:92,confidence:88,reasoning:'Options analytics + candle data fit CE/PE 5-min framework directly.'}, marketing:{score:20,confidence:60,reasoning:'Minimal marketing relevance.'} } },
    connection:{ cross_domain:false, cross_domain_leap:null,
      connections:[ { workflow:'nifty', impact:'high', insight:'Pull live NIFTY options chain and first-candle OHLCV directly into your CE/PE scoring model.' }, { workflow:'redpin', impact:'medium', insight:'Its data-feed architecture blueprints Redpin\'s real-time payment-volume monitoring.' }, { workflow:'automation', impact:'medium', insight:'Schedule OpenBB pulls via n8n to auto-populate your trading journal before market open.' } ] } },
  { id:'langflow-ai/langflow', stars:52100, language:'Python', last_pushed:'2026-05-30', url:'https://github.com/langflow-ai/langflow', found_via:['dev'],
    analysis:{ primary_domain:'dev', urgency:'medium', summary:'Visual low-code builder for multi-agent LLM workflows — drag-and-drop agent graphs.',
      scores:{ fintech:{score:58,confidence:65,reasoning:'Could model compliance-review flows visually.'}, dev:{score:89,confidence:85,reasoning:'Excellent multi-agent orchestration tooling.'}, trading:{score:44,confidence:55,reasoning:'Could wire trade-signal pipelines.'}, marketing:{score:66,confidence:60,reasoning:'Could power Reel IQ content flows without code changes.'} } },
    connection:{ cross_domain:true, cross_domain_leap:'The Scout→Analyst→Connector→Briefer pipeline in this project could be prototyped inside Langflow before being hardcoded — cutting dev time in half.',
      connections:[ { workflow:'reel_iq', impact:'high', insight:'Wrap Reel IQ\'s Claude scoring pipeline in Langflow — non-engineers can tweak prompts without touching Python.' }, { workflow:'redpin', impact:'medium', insight:'Model ACH exception-handling flows visually — makes compliance logic reviewable by non-technical stakeholders.' } ] } },
  { id:'mindsdb/mindsdb', stars:33400, language:'Python', last_pushed:'2026-05-27', url:'https://github.com/mindsdb/mindsdb', found_via:['dev','fintech'],
    analysis:{ primary_domain:'fintech', urgency:'medium', summary:'Runs ML predictions directly inside databases via SQL — no separate ML pipeline needed.',
      scores:{ fintech:{score:84,confidence:82,reasoning:'In-DB ML ideal for real-time payment fraud scoring.'}, dev:{score:76,confidence:78,reasoning:'Clean SQL-native ML abstraction.'}, trading:{score:70,confidence:68,reasoning:'Run candle-pattern ML directly in trade DB.'}, marketing:{score:52,confidence:55,reasoning:'Audience churn prediction without a separate ML service.'} } },
    connection:{ cross_domain:false, cross_domain_leap:null,
      connections:[ { workflow:'redpin', impact:'high', insight:'Run real-time ACH fraud-scoring ML inside your payments DB — no separate service, no latency overhead.' }, { workflow:'nifty', impact:'medium', insight:'Store NIFTY candle history and run CE/PE signal-detection with embedded ML — no Python pipeline.' } ] } },
  { id:'PostHog/posthog', stars:24800, language:'TypeScript', last_pushed:'2026-05-29', url:'https://github.com/PostHog/posthog', found_via:['marketing'],
    analysis:{ primary_domain:'marketing', urgency:'low', summary:'Open-source product analytics — funnels, session replay, feature flags, self-hostable.',
      scores:{ fintech:{score:30,confidence:60,reasoning:'Limited direct payments relevance.'}, dev:{score:64,confidence:70,reasoning:'Solid self-hostable analytics infra.'}, trading:{score:12,confidence:55,reasoning:'Not relevant to trading.'}, marketing:{score:88,confidence:84,reasoning:'Funnel analytics exactly what Reel IQ needs.'} } },
    connection:{ cross_domain:false, cross_domain_leap:null,
      connections:[ { workflow:'reel_iq', impact:'high', insight:'Self-host inside Reel IQ to track which content-scoring features influencers actually use.' }, { workflow:'redpin', impact:'low', insight:'Measure internal ops tool adoption at Redpin — which dashboards are actually being used.' } ] } },
];

const DEMO_BRIEFING = {
  briefing_date: '2026-05-30',
  signal_quality: 'strong',
  executive_summary: 'Strong signal week — two high-urgency repos with direct, immediate application to your core workflows. browser-use eliminates manual bank-portal ops at Redpin; OpenBB gives your NIFTY CE/PE framework live options data it currently lacks. The ML-in-database play from MindsDB is the sleeper pick — lowest friction path to real-time fraud scoring without a separate infrastructure investment.',
  top_picks: [
    { rank:1, repo_id:'browser-use/browser-use', headline:'Eliminate Redpin\'s manual bank reconciliation today', why_now:'Production-ready, 48K stars, directly maps to your JPM Chase + Cross River portal ops.', action:'Fork, connect to your test JPM Chase portal, run against one week of reconciliation data.', urgency:'high', primary_workflow:'redpin' },
    { rank:2, repo_id:'OpenBB-finance/OpenBB', headline:'Give your NIFTY model live options chain data', why_now:'Your CE/PE 5-min candle strategy is data-constrained — OpenBB removes that constraint this week.', action:'Install OpenBB, pull NIFTY options chain for tomorrow\'s open, validate against your manual data source.', urgency:'high', primary_workflow:'nifty' },
    { rank:3, repo_id:'mindsdb/mindsdb', headline:'Real-time ACH fraud scoring without a new service', why_now:'SQL-native ML means zero new infrastructure — works inside your existing payments DB.', action:'Run MindsDB on a 30-day sample of Redpin ACH transactions, benchmark against current exception rate.', urgency:'medium', primary_workflow:'redpin' },
    { rank:4, repo_id:'langflow-ai/langflow', headline:'Let non-engineers iterate Reel IQ\'s AI prompts', why_now:'Reel IQ scaling bottleneck is prompt engineering requiring dev time — Langflow breaks that dependency.', action:'Wrap one Reel IQ Claude analysis flow in Langflow, test with a non-technical team member.', urgency:'medium', primary_workflow:'reel_iq' },
    { rank:5, repo_id:'PostHog/posthog', headline:'Know which Reel IQ features actually get used', why_now:'Can\'t prioritise Reel IQ roadmap without usage data — self-host PostHog this sprint.', action:'Deploy PostHog alongside Reel IQ Streamlit app, instrument the 3 core scoring features.', urgency:'low', primary_workflow:'reel_iq' },
  ],
  skip_list: [],
  total_scanned: 5,
  domains_covered: ['fintech','dev','trading','marketing'],
};

// ─── Briefing Panel ───────────────────────────────────────────────
function BriefingPanel({ briefing, c, visible }) {
  const [open, setOpen] = useState(true);
  if (!visible || !briefing) return null;
  return (
    <div style={{ background:c.panel, border:`1px solid ${c.line}`, borderRadius:8,
      marginBottom:28, overflow:'hidden', animation:'rise .5s cubic-bezier(.2,.7,.2,1) both' }}>
      {/* Header */}
      <div style={{ padding:'18px 24px', borderBottom:`1px solid ${c.line}`,
        display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:3,
            color:c.faint, textTransform:'uppercase' }}>Morning Brief · {briefing.briefing_date}</span>
          <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:1,
            color:SIG[briefing.signal_quality], textTransform:'uppercase',
            border:`1px solid ${SIG[briefing.signal_quality]}44`, padding:'2px 8px', borderRadius:3 }}>
            {briefing.signal_quality} signal
          </span>
          <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, color:c.faint }}>
            {briefing.total_scanned} repos scanned
          </span>
        </div>
        <button onClick={() => setOpen(!open)} style={{ background:'none', border:'none',
          color:c.faint, fontSize:13, cursor:'pointer', fontFamily:'IBM Plex Mono' }}>
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <>
          {/* Executive summary */}
          <div style={{ padding:'20px 24px', borderBottom:`1px solid ${c.line}` }}>
            <p style={{ fontSize:16, lineHeight:1.7, color:c.ink, margin:0, maxWidth:'64ch' }}>
              {briefing.executive_summary}
            </p>
          </div>

          {/* Top picks */}
          <div style={{ padding:'20px 24px' }}>
            <div style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:2.5,
              color:c.faint, textTransform:'uppercase', marginBottom:16 }}>Top picks · ranked by urgency × opportunity</div>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {briefing.top_picks.map((pick, i) => {
                const wf = WORKFLOW[pick.primary_workflow] || WORKFLOW.general;
                return (
                  <div key={pick.repo_id} style={{ display:'flex', gap:16, padding:'14px 0',
                    borderBottom: i < briefing.top_picks.length-1 ? `1px solid ${c.line}` : 'none',
                    animation:`rise .5s cubic-bezier(.2,.7,.2,1) ${i*0.06}s both` }}>
                    {/* Rank */}
                    <div style={{ fontFamily:'IBM Plex Mono', fontSize:22, color:c.line,
                      fontWeight:700, width:28, flexShrink:0, lineHeight:1, paddingTop:2 }}>
                      {pick.rank}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:5, flexWrap:'wrap' }}>
                        <span style={{ fontSize:15, fontFamily:'Spectral, Georgia, serif', fontWeight:500,
                          color:c.ink, lineHeight:1.2 }}>{pick.headline}</span>
                        <span style={{ fontSize:9, color:wf.color, fontFamily:'IBM Plex Mono',
                          letterSpacing:1, border:`1px solid ${wf.color}44`, padding:'1px 6px', borderRadius:3,
                          textTransform:'uppercase', flexShrink:0 }}>{wf.label}</span>
                        <span style={{ fontSize:9, color:URG[pick.urgency], fontFamily:'IBM Plex Mono',
                          letterSpacing:1, textTransform:'uppercase', flexShrink:0 }}>{pick.urgency}</span>
                      </div>
                      <p style={{ fontSize:13, color:c.sub, margin:'0 0 7px', lineHeight:1.5 }}>{pick.why_now}</p>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:7 }}>
                        <span style={{ fontSize:11, color:c.faint, fontFamily:'IBM Plex Mono', flexShrink:0, marginTop:1 }}>→</span>
                        <p style={{ fontSize:13, color:c.ink, margin:0, lineHeight:1.5,
                          fontStyle:'italic' }}>{pick.action}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Repo Card ────────────────────────────────────────────────────
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

function WorkflowPill({ conn }) {
  const w = WORKFLOW[conn.workflow] || WORKFLOW.general;
  return (
    <div style={{ display:'flex', gap:10, padding:'10px 13px', borderRadius:6,
      background:`${w.color}0D`, border:`1px solid ${w.color}28`, marginBottom:7 }}>
      <span style={{ color:w.color, fontSize:14, flexShrink:0 }}>{w.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
          <span style={{ fontSize:10, fontFamily:'IBM Plex Mono', color:w.color, letterSpacing:0.5 }}>{w.label}</span>
          <span style={{ fontSize:9, fontFamily:'IBM Plex Mono', color:IMP[conn.impact],
            letterSpacing:1, textTransform:'uppercase' }}>{conn.impact}</span>
        </div>
        <p style={{ margin:0, fontSize:13, lineHeight:1.55 }}>{conn.insight}</p>
      </div>
    </div>
  );
}

function Card({ repo, c, index }) {
  const [openConns, setOpenConns] = useState(false);
  const [openScores, setOpenScores] = useState(false);
  const [hover, setHover] = useState(false);
  const a = repo.analysis;
  const conn = repo.connection;
  const pd = DOMAIN[a.primary_domain];
  const topConn = conn?.connections?.[0];
  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background:c.panel, border:`1px solid ${hover ? pd.color+'44' : c.line}`,
        borderRadius:6, padding:'20px 22px', position:'relative', overflow:'hidden',
        transition:'border-color .3s, transform .3s', transform:hover ? 'translateY(-1px)' : 'none',
        animation:`rise .55s cubic-bezier(.2,.7,.2,1) ${index*0.06}s both` }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2,
        background:pd.color, opacity:hover ? 1 : 0.3, transition:'opacity .3s' }} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:14, marginBottom:9 }}>
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:6, flexWrap:'wrap', alignItems:'baseline' }}>
            <span style={{ fontSize:11, color:pd.color, fontFamily:'Spectral', fontStyle:'italic' }}>{pd.label}</span>
            <span style={{ fontSize:9, color:URG[a.urgency], fontFamily:'IBM Plex Mono',
              letterSpacing:1.5, textTransform:'uppercase' }}>{a.urgency}</span>
            {conn?.cross_domain && (
              <span style={{ fontSize:9, color:'#7C5CFF', fontFamily:'IBM Plex Mono',
                border:'1px solid #7C5CFF33', padding:'1px 5px', borderRadius:3, letterSpacing:0.5 }}>cross-domain</span>
            )}
          </div>
          <a href={repo.url} target="_blank" rel="noreferrer"
            style={{ color:c.ink, fontSize:18, fontFamily:'Spectral, Georgia, serif', fontWeight:500,
              textDecoration:'none', letterSpacing:-0.2, lineHeight:1.2, display:'inline-block',
              borderBottom:`1px solid ${hover ? pd.color : 'transparent'}`, transition:'border-color .3s' }}>
            {repo.id}
          </a>
        </div>
        <Sparkline scores={a.scores} />
      </div>

      <p style={{ color:c.sub, fontSize:14, lineHeight:1.6, margin:'0 0 13px', maxWidth:'58ch' }}>{a.summary}</p>

      {topConn && (
        <div style={{ marginBottom:11 }}>
          <WorkflowPill conn={topConn} />
          {conn?.cross_domain_leap && (
            <p style={{ margin:'4px 0 0', fontSize:12, color:c.faint, fontStyle:'italic', lineHeight:1.5, paddingLeft:2 }}>
              ↳ {conn.cross_domain_leap}
            </p>
          )}
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', gap:14, fontSize:11, color:c.faint, fontFamily:'IBM Plex Mono' }}>
          <span>{repo.stars.toLocaleString()} ★</span>
          <span>{repo.language}</span>
          <span>{repo.last_pushed}</span>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          {conn?.connections?.length > 1 && (
            <button onClick={() => setOpenConns(!openConns)} style={{ background:'none', border:'none',
              color:c.faint, fontSize:11, cursor:'pointer', fontFamily:'IBM Plex Mono',
              borderBottom:`1px solid ${c.line}`, paddingBottom:1 }}>
              {openConns ? 'less —' : `+${conn.connections.length - 1} connections`}
            </button>
          )}
          <button onClick={() => setOpenScores(!openScores)} style={{ background:'none', border:'none',
            color:c.faint, fontSize:11, cursor:'pointer', fontFamily:'IBM Plex Mono',
            borderBottom:`1px solid ${c.line}`, paddingBottom:1 }}>
            {openScores ? 'hide scores —' : 'scores +'}
          </button>
        </div>
      </div>

      {openConns && conn?.connections?.slice(1).map((cn, i) => (
        <div key={i} style={{ marginTop: i===0 ? 12 : 0 }}><WorkflowPill conn={cn} /></div>
      ))}

      {openScores && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${c.line}`,
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 22px', animation:'fade .3s ease both' }}>
          {DOMAINS.map(d => {
            const s = a.scores[d];
            return (
              <div key={d}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:11, color:DOMAIN[d].color, fontFamily:'Spectral', fontStyle:'italic' }}>{DOMAIN[d].label}</span>
                  <span style={{ fontFamily:'IBM Plex Mono', fontSize:11, color:c.ink }}>
                    {s.score}<span style={{ color:c.faint, fontSize:9 }}>/{s.confidence}c</span>
                  </span>
                </div>
                <div style={{ height:3, background:c.line, borderRadius:2, overflow:'hidden', marginBottom:4 }}>
                  <div style={{ width:`${s.score}%`, height:'100%', background:DOMAIN[d].color, transition:'width .7s cubic-bezier(.2,.7,.2,1)' }} />
                </div>
                <div style={{ fontSize:11.5, color:c.sub, lineHeight:1.5 }}>{s.reasoning}</div>
                {s.confidence < 50 && <div style={{ fontSize:9.5, color:URG.medium, marginTop:2, fontFamily:'IBM Plex Mono' }}>⚠ low signal</div>}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState('dark');
  const c = THEMES[mode];
  const [repos, setRepos] = useState([]);
  const [briefing, setBriefing] = useState(null);
  const [status, setStatus] = useState('idle');
  const [stage, setStage] = useState('');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('brief'); // 'brief' | 'feed'

  async function run() {
    setStatus('running'); setRepos([]); setBriefing(null); setStage('scouting');
    await new Promise(r => setTimeout(r, 650));
    setStage('analyzing');
    await new Promise(r => setTimeout(r, 550));
    setStage('connecting');
    for (let i = 0; i < DEMO_REPOS.length; i++) {
      await new Promise(r => setTimeout(r, 300));
      setRepos(p => [...p, DEMO_REPOS[i]]);
    }
    setStage('briefing');
    await new Promise(r => setTimeout(r, 900));
    setBriefing(DEMO_BRIEFING);
    setStage('done'); setStatus('done');
  }
  useEffect(() => { run(); }, []);

  const filtered = useMemo(() => {
    const l = filter === 'all' ? repos
      : filter === 'cross' ? repos.filter(r => r.connection?.cross_domain)
      : repos.filter(r => r.analysis.primary_domain === filter);
    return [...l].sort((a,b) =>
      b.analysis.scores[b.analysis.primary_domain].score - a.analysis.scores[a.analysis.primary_domain].score);
  }, [repos, filter]);

  const STAGES = ['scouting','analyzing','connecting','briefing'];
  const stageIdx = STAGES.indexOf(stage);

  return (
    <div style={{ minHeight:'100vh', background:c.bg, color:c.ink,
      fontFamily:'Spectral, Georgia, serif', transition:'background .5s, color .5s' }}>
      <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes rise { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes fade { from{opacity:0} to{opacity:1} }
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      <div style={{ maxWidth:780, margin:'0 auto', padding:'44px 24px 80px' }}>

        {/* Masthead */}
        <header style={{ marginBottom:36 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
            <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:3, color:c.faint, textTransform:'uppercase' }}>
              The Intelligence Station · Phase 3
            </span>
            <button onClick={() => setMode(mode==='dark'?'light':'dark')}
              style={{ background:c.raised, border:`1px solid ${c.line}`, color:c.sub,
                borderRadius:20, padding:'5px 14px', fontSize:11, cursor:'pointer', fontFamily:'IBM Plex Mono' }}>
              {mode==='dark' ? '☀ light' : '☾ dark'}
            </button>
          </div>
          <h1 style={{ fontSize:40, fontWeight:600, letterSpacing:-1.5, lineHeight:1.08, marginBottom:10 }}>
            What's worth<br/><em style={{ fontWeight:400 }}>your attention</em> today.
          </h1>
          <p style={{ fontSize:15.5, color:c.sub, lineHeight:1.65, maxWidth:'52ch' }}>
            Four agents — Scout, Analyst, Connector, Briefer — range all of GitHub and
            deliver one ranked executive brief before your morning standup.
          </p>
        </header>

        {/* Pipeline status */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22,
          paddingBottom:18, borderBottom:`1px solid ${c.line}`, flexWrap:'wrap' }}>
          {[
            { key:'scouting',  label:'Scout',    color:DOMAIN.dev.color },
            { key:'analyzing', label:'Analyst',  color:DOMAIN.trading.color },
            { key:'connecting',label:'Connector',color:DOMAIN.fintech.color },
            { key:'briefing',  label:'Briefer',  color:DOMAIN.marketing.color },
          ].map((s, i) => {
            const idx = STAGES.indexOf(s.key);
            const st = idx < stageIdx ? 'done' : idx === stageIdx ? 'run' : 'wait';
            const col = st==='done' ? c.sub : st==='run' ? s.color : c.faint;
            return (
              <React.Fragment key={s.key}>
                {i > 0 && <span style={{ color:c.faint, fontFamily:'IBM Plex Mono', fontSize:11 }}>→</span>}
                <span style={{ display:'flex', alignItems:'center', gap:5, color:col, fontFamily:'IBM Plex Mono', fontSize:11 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:col, flexShrink:0,
                    animation:st==='run'?'pulse 1s infinite':'none' }} />
                  {s.label}
                </span>
              </React.Fragment>
            );
          })}
          <span style={{ flex:1 }} />
          {status==='done' && (
            <button onClick={run} style={{ background:'none', border:`1px solid ${c.line}`, color:c.sub,
              borderRadius:20, padding:'4px 14px', fontSize:11, cursor:'pointer', fontFamily:'IBM Plex Mono' }}>
              ↻ rescan
            </button>
          )}
        </div>

        {/* View toggle */}
        {status==='done' && (
          <div style={{ display:'flex', gap:6, marginBottom:24 }}>
            {[{k:'brief',l:'Morning Brief'},{k:'feed',l:'Repo Feed'}].map(({k,l}) => (
              <button key={k} onClick={() => setView(k)}
                style={{ background:view===k?`${c.ink}12`:'transparent',
                  border:`1px solid ${view===k?c.ink:c.line}`, color:view===k?c.ink:c.sub,
                  borderRadius:20, padding:'6px 16px', fontSize:13, cursor:'pointer',
                  fontFamily:'Spectral, Georgia, serif', transition:'all .2s' }}>{l}</button>
            ))}
          </div>
        )}

        {/* Briefing panel */}
        {view==='brief' && <BriefingPanel briefing={briefing} c={c} visible={!!briefing} />}

        {/* Briefer loading state */}
        {stage==='briefing' && (
          <div style={{ padding:'28px 24px', background:c.panel, border:`1px solid ${c.line}`,
            borderRadius:8, marginBottom:24, animation:'fade .4s ease both' }}>
            <div style={{ display:'flex', align:'center', gap:10 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:DOMAIN.marketing.color,
                display:'inline-block', marginTop:6, animation:'pulse 1s infinite' }} />
              <p style={{ color:c.sub, fontStyle:'italic', fontSize:15 }}>
                Briefer synthesising {repos.length} repos into your morning brief…
              </p>
            </div>
          </div>
        )}

        {/* Repo feed */}
        {(view==='feed' || !briefing) && (
          <>
            {view==='feed' && (
              <div style={{ display:'flex', gap:6, marginBottom:22, flexWrap:'wrap' }}>
                {[
                  { key:'all', label:'All' },
                  ...DOMAINS.map(d => ({ key:d, label:DOMAIN[d].label, color:DOMAIN[d].color })),
                  { key:'cross', label:'Cross-domain', color:'#7C5CFF' },
                ].map(({ key, label, color }) => (
                  <button key={key} onClick={() => setFilter(key)}
                    style={{ background:filter===key?`${color||c.ink}15`:'transparent',
                      border:`1px solid ${filter===key?(color||c.ink):c.line}`,
                      color:filter===key?(color||c.ink):c.sub, borderRadius:20,
                      padding:'5px 13px', fontSize:13, cursor:'pointer',
                      fontFamily:'Spectral, Georgia, serif', transition:'all .2s' }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {(view==='feed' ? filtered : repos.slice(0,3)).map((r,i) => (
                <Card key={r.id} repo={r} c={c} index={i} />
              ))}
              {repos.length===0 && (
                <div style={{ padding:'52px 0', textAlign:'center', color:c.faint, fontStyle:'italic', fontSize:15 }}>
                  {stage==='scouting' && 'Scout ranging across four domains…'}
                  {stage==='analyzing' && 'Analyst scoring each repo…'}
                  {stage==='connecting' && 'Connector mapping to your workflows…'}
                  {!stage && 'Waking the agents…'}
                </div>
              )}
            </div>
          </>
        )}

        <footer style={{ marginTop:44, paddingTop:20, borderTop:`1px solid ${c.line}`,
          fontSize:12, color:c.faint, lineHeight:1.7, fontStyle:'italic' }}>
          Preview running on representative data. Under Claude Code with your keys, all four
          agents run live — Scout hits the GitHub Search API, Analyst + Connector score via Claude,
          Briefer synthesises into a real daily brief. Next: the Learner agent improves scoring
          weights from your feedback over time.
        </footer>
      </div>
    </div>
  );
}
