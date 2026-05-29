import React, { useState, useEffect, useMemo } from 'react';

// ─── Theme system: light + dark, editorial discovery aesthetic ─────
const THEMES = {
  dark: {
    bg: '#0E0D13', panel: '#16151D', raised: '#1E1C28', line: '#2A2833',
    ink: '#F4F1EA', sub: '#A8A2B8', faint: '#6B6578', accent: '#E8E3D6',
  },
  light: {
    bg: '#F7F4EE', panel: '#FFFFFF', raised: '#FBF9F4', line: '#E4DFD4',
    ink: '#1A1822', sub: '#5C5668', faint: '#9A93A6', accent: '#2A2833',
  },
};
const DOMAIN = {
  fintech:   { label: 'FinTech',  color: '#2D9B8F' },
  dev:       { label: 'Dev & AI', color: '#7C5CFF' },
  trading:   { label: 'Trading',  color: '#D98E2B' },
  marketing: { label: 'Growth',   color: '#C2476B' },
};
const DOMAINS = Object.keys(DOMAIN);
const URG = { high:'#C2476B', medium:'#D98E2B', low:'#2D9B8F' };

const DEMO = [
  { id:'browser-use/browser-use', stars:48200, forks:5100, language:'Python', last_pushed:'2026-05-28', url:'https://github.com/browser-use/browser-use', found_via:['dev'],
    analysis:{ primary_domain:'dev', urgency:'high', summary:'Lets AI agents drive a real browser to finish web tasks end-to-end. Mature, fast-moving, large community.',
      scores:{ fintech:{score:62,confidence:70,reasoning:'Could automate bank-portal reconciliation and KYC document pulls.'}, dev:{score:94,confidence:90,reasoning:'Best-in-class browser agent framework, very active.'}, trading:{score:55,confidence:60,reasoning:'Useful for scraping broker dashboards and market data.'}, marketing:{score:48,confidence:55,reasoning:'Could automate competitor and influencer research.'} } } },
  { id:'OpenBB-finance/OpenBB', stars:38900, forks:3600, language:'Python', last_pushed:'2026-05-29', url:'https://github.com/OpenBB-finance/OpenBB', found_via:['trading','fintech'],
    analysis:{ primary_domain:'trading', urgency:'high', summary:'Open-source investment research platform with options analytics and market data feeds. Maps directly onto NIFTY options work.',
      scores:{ fintech:{score:71,confidence:80,reasoning:'Strong market data infrastructure for ops dashboards.'}, dev:{score:68,confidence:75,reasoning:'Well-engineered, extensible platform.'}, trading:{score:92,confidence:88,reasoning:'Options analytics and candle data fit a CE/PE 5-min framework.'}, marketing:{score:20,confidence:60,reasoning:'Minimal marketing relevance.'} } } },
  { id:'langflow-ai/langflow', stars:52100, forks:6200, language:'Python', last_pushed:'2026-05-30', url:'https://github.com/langflow-ai/langflow', found_via:['dev'],
    analysis:{ primary_domain:'dev', urgency:'medium', summary:'Visual low-code builder for multi-agent LLM workflows. Could prototype the Intelligence Station agent graph itself.',
      scores:{ fintech:{score:58,confidence:65,reasoning:'Could model compliance-review flows visually.'}, dev:{score:89,confidence:85,reasoning:'Excellent multi-agent orchestration tooling.'}, trading:{score:44,confidence:55,reasoning:'Could wire trade-signal pipelines.'}, marketing:{score:66,confidence:60,reasoning:'Could power Reel IQ content-analysis flows.'} } } },
  { id:'mindsdb/mindsdb', stars:33400, forks:4800, language:'Python', last_pushed:'2026-05-27', url:'https://github.com/mindsdb/mindsdb', found_via:['dev','fintech'],
    analysis:{ primary_domain:'fintech', urgency:'medium', summary:'Runs ML predictions directly inside databases via SQL. Strong fit for fraud scoring and payment-anomaly detection.',
      scores:{ fintech:{score:84,confidence:82,reasoning:'In-DB ML is ideal for real-time payment fraud and anomaly scoring.'}, dev:{score:76,confidence:78,reasoning:'Clean SQL-native ML abstraction.'}, trading:{score:70,confidence:68,reasoning:'Could forecast market series in-DB.'}, marketing:{score:52,confidence:55,reasoning:'Audience churn prediction for Reel IQ.'} } } },
  { id:'PostHog/posthog', stars:24800, forks:1600, language:'TypeScript', last_pushed:'2026-05-29', url:'https://github.com/PostHog/posthog', found_via:['marketing'],
    analysis:{ primary_domain:'marketing', urgency:'low', summary:'Open-source product analytics suite. Directly relevant to measuring engagement inside Reel IQ.',
      scores:{ fintech:{score:30,confidence:60,reasoning:'Limited direct payments relevance.'}, dev:{score:64,confidence:70,reasoning:'Solid self-hostable analytics infra.'}, trading:{score:12,confidence:55,reasoning:'Not relevant to trading.'}, marketing:{score:88,confidence:84,reasoning:'Funnel and engagement analytics core to Reel IQ.'} } } },
];

function Sparkline({ scores }) {
  return (
    <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:22 }}>
      {DOMAINS.map((d) => (
        <div key={d} title={DOMAIN[d].label} style={{ width:5, height:`${Math.max(8,scores[d].score)}%`,
          minHeight:3, background:DOMAIN[d].color, borderRadius:2, opacity:0.85 }} />
      ))}
    </div>
  );
}

function DomainTag({ d }) {
  return (
    <span style={{ fontSize:11, letterSpacing:0.3, color:DOMAIN[d].color,
      fontFamily:'Spectral, Georgia, serif', fontStyle:'italic' }}>{DOMAIN[d].label}</span>
  );
}

function Card({ repo, c, index }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const a = repo.analysis;
  const pd = DOMAIN[a.primary_domain];
  return (
    <article
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background:c.panel, border:`1px solid ${hover?pd.color+'55':c.line}`, borderRadius:4,
        padding:'22px 24px', transition:'border-color .35s, transform .35s',
        transform:hover?'translateY(-2px)':'none', position:'relative', overflow:'hidden',
        animation:`rise .6s cubic-bezier(.2,.7,.2,1) ${index*0.08}s both` }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2, background:pd.color, opacity:hover?1:0.4, transition:'opacity .35s' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:16, marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:12, flexWrap:'wrap' }}>
          <DomainTag d={a.primary_domain} />
          <span style={{ fontSize:11, color:URG[a.urgency], letterSpacing:1.5, textTransform:'uppercase',
            fontFamily:'IBM Plex Mono, monospace' }}>{a.urgency}</span>
        </div>
        <Sparkline scores={a.scores} />
      </div>
      <a href={repo.url} target="_blank" rel="noreferrer"
        style={{ color:c.ink, fontSize:21, fontFamily:'Spectral, Georgia, serif', fontWeight:500,
          textDecoration:'none', letterSpacing:-0.3, display:'inline-block', marginBottom:8,
          borderBottom:`1px solid ${hover?pd.color:'transparent'}`, transition:'border-color .35s', lineHeight:1.2 }}>
        {repo.id}
      </a>
      <p style={{ color:c.sub, fontSize:15, lineHeight:1.6, margin:'0 0 14px', maxWidth:'62ch' }}>{a.summary}</p>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
        <div style={{ display:'flex', gap:18, fontSize:12, color:c.faint, fontFamily:'IBM Plex Mono, monospace' }}>
          <span>{repo.stars.toLocaleString()} ★</span>
          <span>{repo.language}</span>
          <span>{repo.last_pushed}</span>
        </div>
        <button onClick={() => setOpen(!open)} style={{ background:'none', border:'none', color:c.faint,
          fontSize:12, cursor:'pointer', fontFamily:'IBM Plex Mono, monospace', letterSpacing:0.5,
          borderBottom:`1px solid ${c.line}`, paddingBottom:2 }}>
          {open ? 'less —' : 'why this matters +'}
        </button>
      </div>
      {open && (
        <div style={{ marginTop:18, paddingTop:18, borderTop:`1px solid ${c.line}`,
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 28px', animation:'fade .4s ease both' }}>
          {DOMAINS.map((d) => {
            const s = a.scores[d];
            return (
              <div key={d}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:5 }}>
                  <DomainTag d={d} />
                  <span style={{ fontFamily:'IBM Plex Mono, monospace', fontSize:13, color:c.ink }}>
                    {s.score}<span style={{ color:c.faint, fontSize:11 }}>/{s.confidence}c</span>
                  </span>
                </div>
                <div style={{ height:3, background:c.line, borderRadius:2, overflow:'hidden', marginBottom:6 }}>
                  <div style={{ width:`${s.score}%`, height:'100%', background:DOMAIN[d].color,
                    transition:'width .7s cubic-bezier(.2,.7,.2,1)' }} />
                </div>
                <div style={{ fontSize:12.5, color:c.sub, lineHeight:1.5 }}>{s.reasoning}</div>
                {s.confidence < 50 && (
                  <div style={{ fontSize:10.5, color:URG.medium, marginTop:3, fontFamily:'IBM Plex Mono' }}>⚠ low signal</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default function App() {
  const [mode, setMode] = useState('dark');
  const c = THEMES[mode];
  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState('idle');
  const [filter, setFilter] = useState('all');
  const [prog, setProg] = useState(0);

  async function run() {
    setStatus('scouting'); setRepos([]); setProg(0);
    await new Promise((r) => setTimeout(r, 800));
    setStatus('analyzing');
    for (let i = 0; i < DEMO.length; i++) {
      await new Promise((r) => setTimeout(r, 380));
      setRepos((p) => [...p, DEMO[i]]); setProg(i + 1);
    }
    setStatus('done');
  }
  useEffect(() => { run(); }, []);

  const filtered = useMemo(() => {
    const l = filter === 'all' ? repos : repos.filter((r) => r.analysis.primary_domain === filter);
    return [...l].sort((a, b) => b.analysis.scores[b.analysis.primary_domain].score - a.analysis.scores[a.analysis.primary_domain].score);
  }, [repos, filter]);

  return (
    <div style={{ minHeight:'100vh', background:c.bg, color:c.ink, transition:'background .5s, color .5s',
      fontFamily:'Spectral, Georgia, serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes rise { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fade { from { opacity:0 } to { opacity:1 } }
        @keyframes pulse { 0%,100% { opacity:.4 } 50% { opacity:1 } }
        * { box-sizing:border-box }
      `}</style>
      <div style={{ maxWidth:760, margin:'0 auto', padding:'48px 28px 80px' }}>
        <header style={{ marginBottom:44 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
            <span style={{ fontFamily:'IBM Plex Mono, monospace', fontSize:11, letterSpacing:2.5,
              color:c.faint, textTransform:'uppercase' }}>The Intelligence Station</span>
            <button onClick={() => setMode(mode==='dark'?'light':'dark')}
              style={{ background:c.raised, border:`1px solid ${c.line}`, color:c.sub, borderRadius:20,
                padding:'6px 14px', fontSize:12, cursor:'pointer', fontFamily:'IBM Plex Mono', letterSpacing:0.5 }}>
              {mode==='dark' ? '☀ light' : '☾ dark'}
            </button>
          </div>
          <h1 style={{ fontSize:46, fontWeight:600, letterSpacing:-1.5, lineHeight:1.05, margin:'0 0 14px' }}>
            What's worth<br/><span style={{ fontStyle:'italic', fontWeight:400 }}>your attention</span> today.
          </h1>
          <p style={{ fontSize:16.5, color:c.sub, lineHeight:1.6, maxWidth:'54ch', margin:0 }}>
            Five agents range across all of GitHub — not just what you follow — and return the work that
            actually bears on how you build, trade, and operate.
          </p>
        </header>
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:30, paddingBottom:22,
          borderBottom:`1px solid ${c.line}`, fontFamily:'IBM Plex Mono, monospace', fontSize:12 }}>
          <Stage label="Scout" state={status==='idle'?'wait':status==='scouting'?'run':'done'} c={c} />
          <span style={{ color:c.faint }}>→</span>
          <Stage label="Analyst" state={status==='analyzing'?'run':status==='done'?'done':'wait'} c={c} />
          <span style={{ flex:1 }} />
          {status==='analyzing' && <span style={{ color:c.faint }}>scoring {prog}/{DEMO.length}</span>}
          {status==='done' && (
            <button onClick={run} style={{ background:'none', border:`1px solid ${c.line}`, color:c.sub,
              borderRadius:20, padding:'6px 16px', fontSize:12, cursor:'pointer', fontFamily:'IBM Plex Mono' }}>↻ rescan</button>
          )}
        </div>
        <div style={{ display:'flex', gap:6, marginBottom:28, flexWrap:'wrap' }}>
          <Pill label="All" active={filter==='all'} onClick={() => setFilter('all')} c={c} color={c.ink} />
          {DOMAINS.map((d) => (
            <Pill key={d} label={DOMAIN[d].label} active={filter===d} onClick={() => setFilter(d)} c={c} color={DOMAIN[d].color} />
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {filtered.map((r, i) => <Card key={r.id} repo={r} c={c} index={i} />)}
          {repos.length===0 && (
            <div style={{ padding:'60px 0', textAlign:'center', color:c.faint, fontStyle:'italic', fontSize:16 }}>
              {status==='scouting' ? 'The Scout is reading across four domains…' : 'Waking the agents…'}
            </div>
          )}
        </div>
        <footer style={{ marginTop:48, paddingTop:24, borderTop:`1px solid ${c.line}`,
          fontSize:13, color:c.faint, lineHeight:1.7, fontStyle:'italic' }}>
          Phase 1 preview on representative data. Run under Claude Code with your keys for the live
          Scout → Analyst pipeline. Next: the Connector agent writes the line that ties each repo to
          Redpin, your NIFTY framework, or Reel IQ.
        </footer>
      </div>
    </div>
  );
}

function Stage({ label, state, c }) {
  const col = state==='done' ? c.ink : state==='run' ? DOMAIN.dev.color : c.faint;
  return (
    <span style={{ display:'flex', alignItems:'center', gap:7, color:col }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:col,
        animation: state==='run' ? 'pulse 1.2s infinite' : 'none' }} />{label}
    </span>
  );
}

function Pill({ label, active, onClick, c, color }) {
  return (
    <button onClick={onClick} style={{ background: active?color+'18':'transparent',
      border:`1px solid ${active?color:c.line}`, color:active?color:c.sub, borderRadius:20,
      padding:'7px 15px', fontSize:13.5, cursor:'pointer', fontFamily:'Spectral, Georgia, serif',
      transition:'all .25s' }}>{label}</button>
  );
}
