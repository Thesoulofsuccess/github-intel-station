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
};
const DOMAINS = Object.keys(DOMAIN);
const URG = { high:'#C2476B', medium:'#D98E2B', low:'#2D9B8F' };
const IMP  = { high:'#C2476B', medium:'#D98E2B', low:'#6B6578' };

// ─── Demo data: Scout + Analyst + Connector all wired ─────────────
const DEMO = [
  {
    id:'browser-use/browser-use', stars:48200, language:'Python', last_pushed:'2026-05-28',
    url:'https://github.com/browser-use/browser-use', found_via:['dev'],
    analysis:{
      primary_domain:'dev', urgency:'high',
      summary:'AI agents that drive a real browser end-to-end. Mature, fast-moving, huge community.',
      scores:{
        fintech:{score:62,confidence:70,reasoning:'Automates browser-based bank portal tasks and KYC flows.'},
        dev:{score:94,confidence:90,reasoning:'Best-in-class browser agent framework, very active.'},
        trading:{score:55,confidence:60,reasoning:'Can scrape broker dashboards and market data pages.'},
        marketing:{score:48,confidence:55,reasoning:'Automates competitor and influencer research gathering.'},
      },
    },
    connection:{
      cross_domain:true,
      cross_domain_leap:'A browser-agent that handles arbitrary web tasks maps directly to Redpin\'s manual bank-portal reconciliation work — automating what your ops team does by hand today.',
      connections:[
        { workflow:'redpin', impact:'high', insight:'Could automate JP Morgan Chase portal reconciliation and Cross River Bank statement pulls — eliminating daily manual ops.' },
        { workflow:'reel_iq', impact:'medium', insight:'Could scrape and aggregate competitor influencer pages to feed Reel IQ\'s trend-detection pipeline.' },
        { workflow:'automation', impact:'medium', insight:'Wraps into n8n as a browser-action node, replacing manual steps in any web-dependent workflow.' },
      ],
    },
  },
  {
    id:'OpenBB-finance/OpenBB', stars:38900, language:'Python', last_pushed:'2026-05-29',
    url:'https://github.com/OpenBB-finance/OpenBB', found_via:['trading','fintech'],
    analysis:{
      primary_domain:'trading', urgency:'high',
      summary:'Open-source investment research platform with options analytics and live market data feeds.',
      scores:{
        fintech:{score:71,confidence:80,reasoning:'Market data infrastructure reusable for Redpin ops dashboards.'},
        dev:{score:68,confidence:75,reasoning:'Well-engineered, extensible Python platform.'},
        trading:{score:92,confidence:88,reasoning:'Options analytics + candle data fit CE/PE 5-min framework directly.'},
        marketing:{score:20,confidence:60,reasoning:'Minimal marketing relevance.'},
      },
    },
    connection:{
      cross_domain:false,
      cross_domain_leap:null,
      connections:[
        { workflow:'nifty', impact:'high', insight:'Pull live NIFTY options chain data and first-candle OHLCV directly into your CE/PE scoring model — no manual data sourcing.' },
        { workflow:'redpin', impact:'medium', insight:'Its market-data feed architecture is a blueprint for building Redpin\'s real-time payment-volume monitoring dashboard.' },
        { workflow:'automation', impact:'medium', insight:'Schedule OpenBB data pulls via n8n to auto-populate your trading journal in Google Sheets before market open.' },
      ],
    },
  },
  {
    id:'langflow-ai/langflow', stars:52100, language:'Python', last_pushed:'2026-05-30',
    url:'https://github.com/langflow-ai/langflow', found_via:['dev'],
    analysis:{
      primary_domain:'dev', urgency:'medium',
      summary:'Visual low-code builder for multi-agent LLM workflows — drag-and-drop agent graphs.',
      scores:{
        fintech:{score:58,confidence:65,reasoning:'Could model compliance-review agent flows visually.'},
        dev:{score:89,confidence:85,reasoning:'Excellent multi-agent orchestration — directly relevant to this project.'},
        trading:{score:44,confidence:55,reasoning:'Could wire trade-signal pipelines visually.'},
        marketing:{score:66,confidence:60,reasoning:'Could power Reel IQ content-analysis flows without code changes.'},
      },
    },
    connection:{
      cross_domain:true,
      cross_domain_leap:'The Scout→Analyst→Connector→Briefer pipeline in this very project could be prototyped and iterated inside Langflow before being hardcoded — cutting agent development time in half.',
      connections:[
        { workflow:'reel_iq', impact:'high', insight:'Wrap Reel IQ\'s Claude content-scoring pipeline in Langflow — non-engineers can tweak prompts and add steps without touching Python.' },
        { workflow:'redpin', impact:'medium', insight:'Model the ACH exception-handling decision flow visually — makes compliance logic reviewable by non-technical stakeholders.' },
        { workflow:'automation', impact:'medium', insight:'Replaces brittle n8n AI nodes with a proper agent graph — more robust for multi-step AI automation.' },
      ],
    },
  },
  {
    id:'mindsdb/mindsdb', stars:33400, language:'Python', last_pushed:'2026-05-27',
    url:'https://github.com/mindsdb/mindsdb', found_via:['dev','fintech'],
    analysis:{
      primary_domain:'fintech', urgency:'medium',
      summary:'Runs ML predictions directly inside databases via SQL — no separate ML pipeline needed.',
      scores:{
        fintech:{score:84,confidence:82,reasoning:'In-DB ML is ideal for real-time payment fraud and anomaly scoring at Redpin.'},
        dev:{score:76,confidence:78,reasoning:'Clean SQL-native ML abstraction, easy to adopt.'},
        trading:{score:70,confidence:68,reasoning:'Could run candle-pattern ML models directly in a trade database.'},
        marketing:{score:52,confidence:55,reasoning:'Audience churn prediction for Reel IQ without a separate ML service.'},
      },
    },
    connection:{
      cross_domain:false,
      cross_domain_leap:null,
      connections:[
        { workflow:'redpin', impact:'high', insight:'Run real-time ACH fraud-scoring ML directly inside your payments database — no separate ML service, no latency overhead.' },
        { workflow:'nifty', impact:'medium', insight:'Store NIFTY candle history in a DB and run CE/PE signal-detection SQL queries with embedded ML — no Python pipeline.' },
        { workflow:'reel_iq', impact:'medium', insight:'Predict influencer engagement drop-off inside the Reel IQ DB without spinning up a separate model server.' },
      ],
    },
  },
  {
    id:'PostHog/posthog', stars:24800, language:'TypeScript', last_pushed:'2026-05-29',
    url:'https://github.com/PostHog/posthog', found_via:['marketing'],
    analysis:{
      primary_domain:'marketing', urgency:'low',
      summary:'Open-source product analytics — funnels, session replay, feature flags, all self-hostable.',
      scores:{
        fintech:{score:30,confidence:60,reasoning:'Limited direct payments relevance.'},
        dev:{score:64,confidence:70,reasoning:'Solid self-hostable analytics infra.'},
        trading:{score:12,confidence:55,reasoning:'Not relevant to trading.'},
        marketing:{score:88,confidence:84,reasoning:'Funnel and engagement analytics exactly what Reel IQ needs.'},
      },
    },
    connection:{
      cross_domain:false,
      cross_domain_leap:null,
      connections:[
        { workflow:'reel_iq', impact:'high', insight:'Self-host PostHog inside Reel IQ to track which content-scoring features influencers actually use — replaces guessing with data.' },
        { workflow:'redpin', impact:'low', insight:'Could measure internal ops tool adoption at Redpin — which dashboards are actually being used.' },
      ],
    },
  },
];

// ─── Atoms ────────────────────────────────────────────────────────
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
  const w = WORKFLOW[conn.workflow];
  return (
    <div style={{ display:'flex', gap:10, padding:'11px 14px', borderRadius:6,
      background:`${w.color}0D`, border:`1px solid ${w.color}30`, marginBottom:8 }}>
      <span style={{ color:w.color, fontSize:15, flexShrink:0, marginTop:1 }}>{w.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:3 }}>
          <span style={{ fontSize:11, fontFamily:'IBM Plex Mono', color:w.color, letterSpacing:0.5 }}>{w.label}</span>
          <span style={{ fontSize:10, fontFamily:'IBM Plex Mono', color:IMP[conn.impact],
            letterSpacing:1, textTransform:'uppercase' }}>{conn.impact}</span>
        </div>
        <p style={{ margin:0, fontSize:13.5, lineHeight:1.55 }}>{conn.insight}</p>
      </div>
    </div>
  );
}

function Card({ repo, c, index }) {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState(false);
  const [hover, setHover] = useState(false);
  const a = repo.analysis;
  const conn = repo.connection;
  const pd = DOMAIN[a.primary_domain];
  const topConn = conn?.connections?.[0];

  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background:c.panel, border:`1px solid ${hover ? pd.color+'55' : c.line}`,
        borderRadius:6, padding:'22px 24px', position:'relative', overflow:'hidden',
        transition:'border-color .3s, transform .3s', transform:hover?'translateY(-1px)':'none',
        animation:`rise .55s cubic-bezier(.2,.7,.2,1) ${index*0.07}s both` }}>

      {/* Domain hairline */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2,
        background:pd.color, opacity:hover?1:0.35, transition:'opacity .3s' }} />

      {/* Header row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:14, marginBottom:10 }}>
        <div>
          <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:7, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:pd.color, fontFamily:'Spectral, Georgia, serif', fontStyle:'italic' }}>
              {pd.label}
            </span>
            <span style={{ fontSize:10, color:URG[a.urgency], fontFamily:'IBM Plex Mono',
              letterSpacing:1.5, textTransform:'uppercase' }}>{a.urgency}</span>
            {conn?.cross_domain && (
              <span style={{ fontSize:10, color:'#7C5CFF', fontFamily:'IBM Plex Mono',
                letterSpacing:0.5, border:'1px solid #7C5CFF33', padding:'1px 6px', borderRadius:3 }}>cross-domain</span>
            )}
          </div>
          <a href={repo.url} target="_blank" rel="noreferrer"
            style={{ color:c.ink, fontSize:20, fontFamily:'Spectral, Georgia, serif', fontWeight:500,
              textDecoration:'none', letterSpacing:-0.3, lineHeight:1.2, display:'inline-block',
              borderBottom:`1px solid ${hover ? pd.color : 'transparent'}`, transition:'border-color .3s' }}>
            {repo.id}
          </a>
        </div>
        <Sparkline scores={a.scores} />
      </div>

      {/* Summary */}
      <p style={{ color:c.sub, fontSize:14.5, lineHeight:1.6, margin:'0 0 14px', maxWidth:'60ch' }}>
        {a.summary}
      </p>

      {/* Top connection — always visible */}
      {topConn && (
        <div style={{ marginBottom:14 }}>
          <WorkflowPill conn={topConn} c={c} />
          {conn.cross_domain_leap && (
            <p style={{ margin:'6px 0 0 0', fontSize:12.5, color:c.faint,
              fontStyle:'italic', lineHeight:1.5, paddingLeft:4 }}>
              ↳ {conn.cross_domain_leap}
            </p>
          )}
        </div>
      )}

      {/* Footer controls */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:16, fontSize:12, color:c.faint, fontFamily:'IBM Plex Mono' }}>
          <span>{repo.stars.toLocaleString()} ★</span>
          <span>{repo.language}</span>
          <span>{repo.last_pushed}</span>
        </div>
        <div style={{ display:'flex', gap:14 }}>
          {conn?.connections?.length > 1 && (
            <button onClick={() => setOpen(!open)} style={{ background:'none', border:'none',
              color:c.faint, fontSize:12, cursor:'pointer', fontFamily:'IBM Plex Mono',
              borderBottom:`1px solid ${c.line}`, paddingBottom:2 }}>
              {open ? `hide ${conn.connections.length - 1} more —` : `+${conn.connections.length - 1} more connections`}
            </button>
          )}
          <button onClick={() => setScores(!scores)} style={{ background:'none', border:'none',
            color:c.faint, fontSize:12, cursor:'pointer', fontFamily:'IBM Plex Mono',
            borderBottom:`1px solid ${c.line}`, paddingBottom:2 }}>
            {scores ? 'hide scores —' : 'scores +'}
          </button>
        </div>
      </div>

      {/* Extra connections */}
      {open && conn?.connections?.slice(1).map((cn, i) => (
        <div key={i} style={{ marginTop: i===0 ? 14 : 0 }}>
          <WorkflowPill conn={cn} c={c} />
        </div>
      ))}

      {/* Score breakdown */}
      {scores && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${c.line}`,
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 24px', animation:'fade .35s ease both' }}>
          {DOMAINS.map(d => {
            const s = a.scores[d];
            return (
              <div key={d}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:11, color:DOMAIN[d].color, fontFamily:'Spectral', fontStyle:'italic' }}>
                    {DOMAIN[d].label}
                  </span>
                  <span style={{ fontFamily:'IBM Plex Mono', fontSize:12, color:c.ink }}>
                    {s.score}<span style={{ color:c.faint, fontSize:10 }}>/{s.confidence}c</span>
                  </span>
                </div>
                <div style={{ height:3, background:c.line, borderRadius:2, overflow:'hidden', marginBottom:5 }}>
                  <div style={{ width:`${s.score}%`, height:'100%', background:DOMAIN[d].color,
                    transition:'width .7s cubic-bezier(.2,.7,.2,1)' }} />
                </div>
                <div style={{ fontSize:12, color:c.sub, lineHeight:1.5 }}>{s.reasoning}</div>
                {s.confidence < 50 && (
                  <div style={{ fontSize:10, color:URG.medium, marginTop:2, fontFamily:'IBM Plex Mono' }}>⚠ low signal</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState('dark');
  const c = THEMES[mode];
  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState('idle');
  const [filter, setFilter] = useState('all');
  const [stage, setStage] = useState('');

  async function run() {
    setStatus('running'); setRepos([]); setStage('scouting');
    await new Promise(r => setTimeout(r, 700));
    setStage('analyzing');
    await new Promise(r => setTimeout(r, 600));
    setStage('connecting');
    for (let i = 0; i < DEMO.length; i++) {
      await new Promise(r => setTimeout(r, 350));
      setRepos(p => [...p, DEMO[i]]);
    }
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

  const stats = useMemo(() => ({
    total: repos.length,
    high: repos.filter(r => r.analysis.urgency === 'high').length,
    cross: repos.filter(r => r.connection?.cross_domain).length,
  }), [repos]);

  return (
    <div style={{ minHeight:'100vh', background:c.bg, color:c.ink,
      fontFamily:'Spectral, Georgia, serif', transition:'background .5s, color .5s' }}>
      <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes rise { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
        @keyframes fade { from { opacity:0 } to { opacity:1 } }
        @keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:1} }
        * { box-sizing:border-box; margin:0; padding:0 }
      `}</style>

      <div style={{ maxWidth:780, margin:'0 auto', padding:'44px 24px 80px' }}>

        {/* Masthead */}
        <header style={{ marginBottom:40 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:3,
              color:c.faint, textTransform:'uppercase' }}>The Intelligence Station · Phase 2</span>
            <button onClick={() => setMode(mode==='dark'?'light':'dark')}
              style={{ background:c.raised, border:`1px solid ${c.line}`, color:c.sub,
                borderRadius:20, padding:'5px 14px', fontSize:12, cursor:'pointer',
                fontFamily:'IBM Plex Mono', letterSpacing:0.5 }}>
              {mode==='dark' ? '☀ light' : '☾ dark'}
            </button>
          </div>

          <h1 style={{ fontSize:42, fontWeight:600, letterSpacing:-1.5, lineHeight:1.08, marginBottom:12 }}>
            What's worth<br/><em style={{ fontWeight:400 }}>your attention</em> today.
          </h1>
          <p style={{ fontSize:16, color:c.sub, lineHeight:1.65, maxWidth:'52ch' }}>
            Three agents — Scout, Analyst, Connector — range all of GitHub and return
            the work that actually bears on Redpin, your NIFTY framework, and Reel IQ.
          </p>
        </header>

        {/* Agent pipeline status */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24,
          paddingBottom:20, borderBottom:`1px solid ${c.line}`, flexWrap:'wrap' }}>
          {['scouting','analyzing','connecting'].map((s, i) => {
            const states = ['scouting','analyzing','connecting','done'];
            const si = states.indexOf(stage);
            const ti = states.indexOf(s);
            const state = si === ti ? 'run' : si > ti ? 'done' : 'wait';
            const labels = { scouting:'Scout', analyzing:'Analyst', connecting:'Connector' };
            const colors = { scouting:DOMAIN.dev.color, analyzing:DOMAIN.trading.color, connecting:DOMAIN.fintech.color };
            const col = state==='done' ? c.sub : state==='run' ? colors[s] : c.faint;
            return (
              <React.Fragment key={s}>
                {i > 0 && <span style={{ color:c.faint, fontFamily:'IBM Plex Mono', fontSize:12 }}>→</span>}
                <span style={{ display:'flex', alignItems:'center', gap:6,
                  color:col, fontFamily:'IBM Plex Mono', fontSize:12 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:col, flexShrink:0,
                    animation:state==='run'?'pulse 1.1s infinite':'none' }} />
                  {labels[s]}
                </span>
              </React.Fragment>
            );
          })}
          <span style={{ flex:1 }} />
          {status==='done' && (
            <div style={{ display:'flex', gap:16, fontFamily:'IBM Plex Mono', fontSize:11, color:c.faint }}>
              <span>{stats.total} repos</span>
              <span style={{ color:URG.high }}>{stats.high} urgent</span>
              <span style={{ color:DOMAIN.dev.color }}>{stats.cross} cross-domain</span>
              <button onClick={run} style={{ background:'none', border:`1px solid ${c.line}`, color:c.sub,
                borderRadius:20, padding:'4px 14px', fontSize:11, cursor:'pointer', fontFamily:'IBM Plex Mono' }}>
                ↻ rescan
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:6, marginBottom:26, flexWrap:'wrap' }}>
          {[
            { key:'all', label:'All' },
            ...DOMAINS.map(d => ({ key:d, label:DOMAIN[d].label, color:DOMAIN[d].color })),
            { key:'cross', label:'Cross-domain', color:'#7C5CFF' },
          ].map(({ key, label, color }) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{ background: filter===key ? `${color||c.ink}18` : 'transparent',
                border:`1px solid ${filter===key ? (color||c.ink) : c.line}`,
                color: filter===key ? (color||c.ink) : c.sub, borderRadius:20,
                padding:'6px 14px', fontSize:13, cursor:'pointer',
                fontFamily:'Spectral, Georgia, serif', transition:'all .2s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {filtered.map((r,i) => <Card key={r.id} repo={r} c={c} index={i} />)}
          {repos.length===0 && (
            <div style={{ padding:'56px 0', textAlign:'center', color:c.faint, fontStyle:'italic', fontSize:16 }}>
              {stage==='scouting' && 'Scout reading across four domains…'}
              {stage==='analyzing' && 'Analyst scoring each repo…'}
              {stage==='connecting' && 'Connector mapping to your workflows…'}
              {!stage && 'Waking the agents…'}
            </div>
          )}
        </div>

        <footer style={{ marginTop:44, paddingTop:20, borderTop:`1px solid ${c.line}`,
          fontSize:12.5, color:c.faint, lineHeight:1.7, fontStyle:'italic' }}>
          Phase 2 preview on representative data. Under Claude Code with your keys,
          Scout hits the live GitHub Search API, Analyst scores via Claude,
          and Connector maps each repo to Redpin, NIFTY, Reel IQ, or your automation stack.
          Next: the Briefer agent synthesises everything into one ranked executive summary.
        </footer>
      </div>
    </div>
  );
}
