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

// ─── Learner (localStorage) ───────────────────────────────────────
const DEFAULT_WEIGHTS = { fintech:1.0, dev:1.0, trading:1.0, marketing:1.0 };
function loadWeights() {
  try { return { ...DEFAULT_WEIGHTS, ...JSON.parse(localStorage.getItem('gis_weights')||'{}') }; }
  catch { return { ...DEFAULT_WEIGHTS }; }
}
function saveWeights(w) { try { localStorage.setItem('gis_weights', JSON.stringify(w)); } catch {} }
function recordFeedback(repoId, signal, domain, score, weights) {
  const dir = signal==='up' ? 1 : -1;
  const delta = 0.08 * dir * (score/100);
  const next = { ...weights };
  next[domain] = parseFloat(Math.min(2.0, Math.max(0.4, (next[domain]||1)+delta)).toFixed(3));
  saveWeights(next);
  return next;
}
function resetWeights() { try { localStorage.removeItem('gis_weights'); } catch {} return { ...DEFAULT_WEIGHTS }; }

// ─── Export ───────────────────────────────────────────────────────
function toBriefText(b) {
  const hr='─'.repeat(56);
  const picks=(b.top_picks||[]).map(p=>`\n${p.rank}. ${p.headline}\n   ${(p.primary_workflow||'').toUpperCase()} · ${(p.urgency||'').toUpperCase()}\n   Why now: ${p.why_now}\n   → ${p.action}\n   https://github.com/${p.repo_id}`).join('\n');
  return `GITHUB INTELLIGENCE STATION — MORNING BRIEF\n${b.briefing_date} · Signal: ${(b.signal_quality||'').toUpperCase()} · ${b.total_scanned} repos\n\n${hr}\n${b.executive_summary}\n\nTOP PICKS\n${hr}${picks}\n\n${hr}\ngithub.com/Thesoulofsuccess/github-intel-station`;
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { const el=Object.assign(document.createElement('textarea'),{value:text,style:'position:fixed;opacity:0'}); document.body.appendChild(el); el.focus(); el.select(); const ok=document.execCommand('copy'); document.body.removeChild(el); return ok; }
}
function downloadText(text, name) {
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([text],{type:'text/plain'})),download:name}); a.click();
}

// ─── Components ───────────────────────────────────────────────────
function Sparkline({ scores }) {
  if (!scores) return null;
  return (
    <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:20 }}>
      {DOMAINS.map(d => (
        <div key={d} title={`${DOMAIN[d].label}: ${scores[d]?.score||0}`}
          style={{ width:5, height:`${Math.max(8,scores[d]?.score||0)}%`, minHeight:3,
            background:DOMAIN[d].color, borderRadius:2, opacity:0.8 }} />
      ))}
    </div>
  );
}

function WeightBar({ domain, weight, c }) {
  const pct = ((weight-0.4)/(2.0-0.4))*100;
  const col = DOMAIN[domain].color;
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
        <span style={{ fontSize:11, color:col, fontFamily:'Spectral', fontStyle:'italic' }}>{DOMAIN[domain].label}</span>
        <span style={{ fontSize:10, fontFamily:'IBM Plex Mono', color:weight>1?col:weight<1?URG.high:c.faint }}>{weight.toFixed(2)}×</span>
      </div>
      <div style={{ height:3, background:c.line, borderRadius:2, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:col, transition:'width .6s ease' }} />
      </div>
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
          <span style={{ fontSize:10, fontFamily:'IBM Plex Mono', color:w.color }}>{w.label}</span>
          <span style={{ fontSize:9, fontFamily:'IBM Plex Mono', color:IMP[conn.impact]||c?.faint, letterSpacing:1, textTransform:'uppercase' }}>{conn.impact}</span>
        </div>
        <p style={{ margin:0, fontSize:13, lineHeight:1.55 }}>{conn.insight}</p>
      </div>
    </div>
  );
}

function FeedbackButtons({ repoId, domain, score, onFeedback, c }) {
  const [voted, setVoted] = useState(null);
  function vote(sig) { setVoted(sig); onFeedback(repoId, sig, domain, score); }
  return (
    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
      <span style={{ fontSize:10, fontFamily:'IBM Plex Mono', color:c.faint }}>helpful?</span>
      {['up','down'].map(sig => (
        <button key={sig} onClick={()=>vote(sig)} style={{ background:voted===sig?(sig==='up'?DOMAIN.trading.color:URG.high)+'22':'none',
          border:`1px solid ${voted===sig?(sig==='up'?DOMAIN.trading.color:URG.high):c.line}`,
          color:voted===sig?(sig==='up'?DOMAIN.trading.color:URG.high):c.faint,
          borderRadius:4, padding:'3px 8px', fontSize:12, cursor:'pointer', transition:'all .2s' }}>
          {sig==='up'?'👍':'👎'}
        </button>
      ))}
    </div>
  );
}

function LearnerPanel({ weights, feedbackCount, onReset, c, visible }) {
  const [open, setOpen] = useState(false);
  if (!visible) return null;
  return (
    <div style={{ background:c.panel, border:`1px solid ${c.line}`, borderRadius:8, marginBottom:16, overflow:'hidden' }}>
      <button onClick={()=>setOpen(!open)} style={{ width:'100%', display:'flex', justifyContent:'space-between',
        alignItems:'center', padding:'12px 20px', background:'none', border:'none', cursor:'pointer', color:c.ink }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:2, color:c.faint, textTransform:'uppercase' }}>Learner · Domain Weights</span>
          {feedbackCount>0 && <span style={{ fontSize:9, color:DOMAIN.dev.color, fontFamily:'IBM Plex Mono',
            border:`1px solid ${DOMAIN.dev.color}44`, padding:'1px 6px', borderRadius:3 }}>{feedbackCount} signals</span>}
          {!feedbackCount && <span style={{ fontSize:9, color:c.faint, fontStyle:'italic', fontFamily:'IBM Plex Mono' }}>rate repos to teach the scout</span>}
        </div>
        <span style={{ color:c.faint, fontSize:11, fontFamily:'IBM Plex Mono' }}>{open?'▲':'▼'}</span>
      </button>
      {open && (
        <div style={{ padding:'4px 20px 16px', borderTop:`1px solid ${c.line}` }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 24px', marginBottom:10 }}>
            {DOMAINS.map(d => <WeightBar key={d} domain={d} weight={weights[d]} c={c} />)}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ fontSize:12, color:c.faint, fontStyle:'italic', margin:0 }}>Ratings shift these weights. Next scan uses them.</p>
            {feedbackCount>0 && <button onClick={onReset} style={{ background:'none', border:`1px solid ${c.line}`,
              color:c.faint, borderRadius:4, padding:'3px 10px', fontSize:10, cursor:'pointer', fontFamily:'IBM Plex Mono' }}>reset</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function ExportPanel({ briefing, c, visible }) {
  const [copied, setCopied] = useState('');
  if (!visible||!briefing) return null;
  async function handle(type) {
    if (type==='copy') { await copyText(toBriefText(briefing)); setCopied('copy'); }
    else { downloadText(toBriefText(briefing), `intel-brief-${briefing.briefing_date}.${type}`); setCopied(type); }
    setTimeout(()=>setCopied(''), 2000);
  }
  return (
    <div style={{ background:c.panel, border:`1px solid ${c.line}`, borderRadius:8,
      padding:'12px 20px', marginBottom:16, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
      <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:2, color:c.faint, textTransform:'uppercase' }}>Export</span>
      {[{k:'copy',l:'copy to clipboard'},{k:'txt',l:'↓ plain text'},{k:'md',l:'↓ markdown'}].map(btn => (
        <button key={btn.k} onClick={()=>handle(btn.k)}
          style={{ background:'none', border:`1px solid ${copied===btn.k?DOMAIN.fintech.color:c.line}`,
            color:copied===btn.k?DOMAIN.fintech.color:c.sub, borderRadius:20,
            padding:'5px 14px', fontSize:11, cursor:'pointer', fontFamily:'IBM Plex Mono', transition:'all .2s' }}>
          {copied===btn.k?'✓ done':btn.l}
        </button>
      ))}
    </div>
  );
}

function BriefingPanel({ briefing, c, repos, onFeedback }) {
  const [open, setOpen] = useState(true);
  if (!briefing) return null;
  return (
    <div style={{ background:c.panel, border:`1px solid ${c.line}`, borderRadius:8,
      marginBottom:20, overflow:'hidden', animation:'rise .5s ease both' }}>
      <div style={{ padding:'15px 22px', borderBottom:`1px solid ${c.line}`,
        display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:3, color:c.faint, textTransform:'uppercase' }}>
            Morning Brief · {briefing.briefing_date}
          </span>
          <span style={{ fontSize:9, fontFamily:'IBM Plex Mono', color:SIG[briefing.signal_quality],
            border:`1px solid ${SIG[briefing.signal_quality]}44`, padding:'2px 7px', borderRadius:3, letterSpacing:1, textTransform:'uppercase' }}>
            {briefing.signal_quality} signal
          </span>
          <span style={{ fontSize:10, fontFamily:'IBM Plex Mono', color:c.faint }}>{briefing.total_scanned} repos scanned</span>
        </div>
        <button onClick={()=>setOpen(!open)} style={{ background:'none', border:'none', color:c.faint, fontSize:12, cursor:'pointer', fontFamily:'IBM Plex Mono' }}>
          {open?'▲':'▼'}
        </button>
      </div>
      {open && (
        <>
          <div style={{ padding:'18px 22px', borderBottom:`1px solid ${c.line}` }}>
            <p style={{ fontSize:15.5, lineHeight:1.7, color:c.ink, margin:0, maxWidth:'64ch' }}>{briefing.executive_summary}</p>
          </div>
          <div style={{ padding:'18px 22px' }}>
            <div style={{ fontFamily:'IBM Plex Mono', fontSize:9, letterSpacing:2.5, color:c.faint, textTransform:'uppercase', marginBottom:16 }}>
              Top picks · ranked by urgency × opportunity
            </div>
            {(briefing.top_picks||[]).map((pick,i) => {
              const wf = WORKFLOW[pick.primary_workflow]||WORKFLOW.general;
              const repo = repos.find(r=>r.id===pick.repo_id);
              const domScore = repo?.analysis?.scores?.[repo?.analysis?.primary_domain]?.score||80;
              return (
                <div key={pick.repo_id||i} style={{ display:'flex', gap:14, padding:'13px 0',
                  borderBottom:i<(briefing.top_picks.length-1)?`1px solid ${c.line}`:'none',
                  animation:`rise .5s ease ${i*0.05}s both` }}>
                  <div style={{ fontFamily:'IBM Plex Mono', fontSize:20, color:c.line, fontWeight:700, width:26, flexShrink:0, paddingTop:3 }}>{pick.rank}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                      <span style={{ fontSize:15, fontFamily:'Spectral', fontWeight:500, color:c.ink, lineHeight:1.2 }}>{pick.headline}</span>
                      <span style={{ fontSize:9, color:wf.color, fontFamily:'IBM Plex Mono',
                        border:`1px solid ${wf.color}44`, padding:'1px 5px', borderRadius:3, textTransform:'uppercase', flexShrink:0 }}>{wf.label}</span>
                      <span style={{ fontSize:9, color:URG[pick.urgency]||c.faint, fontFamily:'IBM Plex Mono', letterSpacing:1, textTransform:'uppercase', flexShrink:0 }}>{pick.urgency}</span>
                    </div>
                    <p style={{ fontSize:13, color:c.sub, margin:'0 0 6px', lineHeight:1.5 }}>{pick.why_now}</p>
                    <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                      <span style={{ fontSize:11, color:c.faint, fontFamily:'IBM Plex Mono', flexShrink:0, marginTop:2 }}>→</span>
                      <p style={{ fontSize:13, color:c.ink, margin:0, lineHeight:1.5, fontStyle:'italic' }}>{pick.action}</p>
                    </div>
                    <FeedbackButtons repoId={pick.repo_id} domain={repo?.analysis?.primary_domain||'dev'}
                      score={domScore} onFeedback={onFeedback} c={c} />
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
  const a = repo.analysis||{};
  const conn = repo.connection||{};
  const pd = DOMAIN[a.primary_domain]||DOMAIN.dev;
  const topConn = conn.connections?.[0];
  return (
    <article onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{ background:c.panel, border:`1px solid ${hover?pd.color+'44':c.line}`,
        borderRadius:6, padding:'18px 20px', position:'relative', overflow:'hidden',
        transition:'border-color .3s, transform .3s', transform:hover?'translateY(-1px)':'none',
        animation:`rise .5s ease ${index*0.05}s both` }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2, background:pd.color, opacity:hover?1:0.3, transition:'opacity .3s' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:8 }}>
        <div>
          <div style={{ display:'flex', gap:9, marginBottom:5, flexWrap:'wrap', alignItems:'baseline' }}>
            <span style={{ fontSize:11, color:pd.color, fontFamily:'Spectral', fontStyle:'italic' }}>{pd.label}</span>
            <span style={{ fontSize:9, color:URG[a.urgency]||c.faint, fontFamily:'IBM Plex Mono', letterSpacing:1.5, textTransform:'uppercase' }}>{a.urgency}</span>
            {conn.cross_domain && <span style={{ fontSize:9, color:'#7C5CFF', fontFamily:'IBM Plex Mono', border:'1px solid #7C5CFF33', padding:'1px 5px', borderRadius:3 }}>cross-domain</span>}
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
          {conn.cross_domain_leap && <p style={{ margin:'3px 0 0', fontSize:11.5, color:c.faint, fontStyle:'italic', lineHeight:1.5, paddingLeft:2 }}>↳ {conn.cross_domain_leap}</p>}
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', gap:12, fontSize:11, color:c.faint, fontFamily:'IBM Plex Mono' }}>
          <span>{(repo.stars||0).toLocaleString()} ★</span>
          <span>{repo.language}</span>
          <span>{repo.last_pushed}</span>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <FeedbackButtons repoId={repo.id} domain={a.primary_domain||'dev'}
            score={a.scores?.[a.primary_domain]?.score||50} onFeedback={onFeedback} c={c} />
          {conn.connections?.length>1 && (
            <button onClick={()=>setOpenConns(!openConns)} style={{ background:'none', border:'none',
              color:c.faint, fontSize:10, cursor:'pointer', fontFamily:'IBM Plex Mono', borderBottom:`1px solid ${c.line}` }}>
              {openConns?'less —':`+${conn.connections.length-1} more`}
            </button>
          )}
          <button onClick={()=>setOpenScores(!openScores)} style={{ background:'none', border:'none',
            color:c.faint, fontSize:10, cursor:'pointer', fontFamily:'IBM Plex Mono', borderBottom:`1px solid ${c.line}` }}>
            {openScores?'hide scores':'scores +'}
          </button>
        </div>
      </div>
      {openConns && conn.connections?.slice(1).map((cn,i) => (
        <div key={i} style={{ marginTop:i===0?10:0 }}><WorkflowPill conn={cn} /></div>
      ))}
      {openScores && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${c.line}`,
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 20px', animation:'fade .3s ease both' }}>
          {DOMAINS.map(d => {
            const s = a.scores?.[d]||{score:0,reasoning:'',confidence:0};
            return (
              <div key={d}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:10, color:DOMAIN[d].color, fontFamily:'Spectral', fontStyle:'italic' }}>{DOMAIN[d].label}</span>
                  <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, color:c.ink }}>{s.score}<span style={{ color:c.faint, fontSize:9 }}>/{s.confidence}c</span></span>
                </div>
                <div style={{ height:3, background:c.line, borderRadius:2, overflow:'hidden', marginBottom:3 }}>
                  <div style={{ width:`${s.score}%`, height:'100%', background:DOMAIN[d].color, transition:'width .7s ease' }} />
                </div>
                <div style={{ fontSize:11, color:c.sub, lineHeight:1.5 }}>{s.reasoning}</div>
                {s.confidence<50 && <div style={{ fontSize:9, color:URG.medium, marginTop:2, fontFamily:'IBM Plex Mono' }}>⚠ low signal</div>}
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
  const [mode, setMode]           = useState('dark');
  const [briefing, setBriefing]   = useState(null);
  const [repos, setRepos]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [filter, setFilter]       = useState('all');
  const [view, setView]           = useState('brief');
  const [weights, setWeights]     = useState(()=>loadWeights());
  const [feedbackCount, setFeedbackCount] = useState(0);
  const c = THEMES[mode];

  // Load brief.json from repo
  useEffect(()=>{
    const base = import.meta.env.BASE_URL;
    fetch(`${base}brief.json`)
      .then(r=>{ if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data=>{
        setBriefing(data);
        setRepos(data.repos||[]);
        setLoading(false);
      })
      .catch(err=>{
        setError(err.message);
        setLoading(false);
      });
  },[]);

  const handleFeedback = useCallback((repoId, signal, domain, score)=>{
    const next = recordFeedback(repoId, signal, domain, score, weights);
    setWeights(next); setFeedbackCount(n=>n+1);
  },[weights]);

  const handleReset = useCallback(()=>{ setWeights(resetWeights()); setFeedbackCount(0); },[]);

  const filtered = useMemo(()=>{
    const l = filter==='all' ? repos
      : filter==='cross' ? repos.filter(r=>r.connection?.cross_domain)
      : repos.filter(r=>r.analysis?.primary_domain===filter);
    return [...l].sort((a,b)=>(b.analysis?.scores?.[b.analysis?.primary_domain]?.score||0)-(a.analysis?.scores?.[a.analysis?.primary_domain]?.score||0));
  },[repos,filter]);

  return (
    <div style={{ minHeight:'100vh', background:c.bg, color:c.ink,
      fontFamily:'Spectral, Georgia, serif', transition:'background .5s, color .5s' }}>
      <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}} @keyframes fade{from{opacity:0}to{opacity:1}} @keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ maxWidth:780, margin:'0 auto', padding:'40px 22px 80px' }}>

        {/* Masthead */}
        <header style={{ marginBottom:32 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <span style={{ fontFamily:'IBM Plex Mono', fontSize:10, letterSpacing:3, color:c.faint, textTransform:'uppercase' }}>The Intelligence Station</span>
            <button onClick={()=>setMode(mode==='dark'?'light':'dark')}
              style={{ background:c.raised, border:`1px solid ${c.line}`, color:c.sub,
                borderRadius:20, padding:'5px 14px', fontSize:11, cursor:'pointer', fontFamily:'IBM Plex Mono' }}>
              {mode==='dark'?'☀ light':'☾ dark'}
            </button>
          </div>
          <h1 style={{ fontSize:38, fontWeight:600, letterSpacing:-1.5, lineHeight:1.08, marginBottom:10 }}>
            What's worth<br/><em style={{ fontWeight:400 }}>your attention</em> today.
          </h1>
          <p style={{ fontSize:15, color:c.sub, lineHeight:1.65, maxWidth:'50ch' }}>
            Five agents range all of GitHub every Monday — Scout, Analyst, Connector, Briefer, Learner —
            and return one ranked brief before your standup.
          </p>
        </header>

        {/* Loading */}
        {loading && (
          <div style={{ padding:'60px 0', textAlign:'center' }}>
            <div style={{ width:20, height:20, border:`2px solid ${c.line}`, borderTopColor:DOMAIN.fintech.color,
              borderRadius:'50%', margin:'0 auto 16px', animation:'spin 1s linear infinite' }} />
            <p style={{ color:c.faint, fontStyle:'italic', fontSize:15 }}>Loading your brief…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding:'32px', background:c.panel, border:`1px solid ${URG.high}44`,
            borderRadius:8, marginBottom:24, textAlign:'center' }}>
            <p style={{ color:URG.high, fontFamily:'IBM Plex Mono', fontSize:13, marginBottom:8 }}>Could not load brief.json</p>
            <p style={{ color:c.faint, fontSize:13 }}>Run the pipeline on GitHub Actions to generate your first brief.</p>
            <a href="https://github.com/Thesoulofsuccess/github-intel-station/actions"
              target="_blank" rel="noreferrer"
              style={{ color:DOMAIN.dev.color, fontSize:13, marginTop:8, display:'inline-block' }}>
              → Open GitHub Actions
            </a>
          </div>
        )}

        {!loading && !error && briefing && (
          <>
            {/* Meta bar */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              marginBottom:18, paddingBottom:16, borderBottom:`1px solid ${c.line}`, flexWrap:'wrap', gap:10 }}>
              <div style={{ display:'flex', gap:5 }}>
                {[{k:'brief',l:'Morning Brief'},{k:'feed',l:'Repo Feed'}].map(({k,l})=>(
                  <button key={k} onClick={()=>setView(k)}
                    style={{ background:view===k?`${c.ink}12`:'transparent',
                      border:`1px solid ${view===k?c.ink:c.line}`, color:view===k?c.ink:c.sub,
                      borderRadius:20, padding:'5px 14px', fontSize:12.5, cursor:'pointer',
                      fontFamily:'Spectral', transition:'all .2s' }}>{l}</button>
                ))}
              </div>
              <div style={{ display:'flex', gap:14, fontFamily:'IBM Plex Mono', fontSize:10, color:c.faint }}>
                <span>{repos.length} repos</span>
                <span style={{ color:URG.high }}>{repos.filter(r=>r.analysis?.urgency==='high').length} urgent</span>
                <span style={{ color:DOMAIN.dev.color }}>{repos.filter(r=>r.connection?.cross_domain).length} cross-domain</span>
                {feedbackCount>0 && <span style={{ color:DOMAIN.fintech.color }}>{feedbackCount} signals</span>}
              </div>
            </div>

            {/* Learner */}
            <LearnerPanel weights={weights} feedbackCount={feedbackCount} onReset={handleReset} c={c} visible={true} />

            {/* Export */}
            {view==='brief' && <ExportPanel briefing={briefing} c={c} visible={true} />}

            {/* Brief */}
            {view==='brief' && <BriefingPanel briefing={briefing} c={c} repos={repos} onFeedback={handleFeedback} />}

            {/* Feed */}
            {view==='feed' && (
              <>
                <div style={{ display:'flex', gap:5, marginBottom:18, flexWrap:'wrap' }}>
                  {[{key:'all',label:'All'},...DOMAINS.map(d=>({key:d,label:DOMAIN[d].label,color:DOMAIN[d].color})),{key:'cross',label:'Cross-domain',color:'#7C5CFF'}].map(({key,label,color})=>(
                    <button key={key} onClick={()=>setFilter(key)}
                      style={{ background:filter===key?`${color||c.ink}15`:'transparent',
                        border:`1px solid ${filter===key?(color||c.ink):c.line}`,
                        color:filter===key?(color||c.ink):c.sub, borderRadius:20,
                        padding:'5px 13px', fontSize:12.5, cursor:'pointer', fontFamily:'Spectral', transition:'all .2s' }}>{label}</button>
                  ))}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {filtered.map((r,i)=><Card key={r.id} repo={r} c={c} index={i} onFeedback={handleFeedback} />)}
                </div>
              </>
            )}

            <footer style={{ marginTop:44, paddingTop:18, borderTop:`1px solid ${c.line}`,
              fontSize:11.5, color:c.faint, lineHeight:1.7 }}>
              <em>Brief generated {briefing.generated_at?.slice(0,10)} · Updates every Monday 6:30 AM IST · </em>
              <a href="https://github.com/Thesoulofsuccess/github-intel-station/actions"
                style={{ color:c.faint }} target="_blank" rel="noreferrer">Run manually →</a>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
