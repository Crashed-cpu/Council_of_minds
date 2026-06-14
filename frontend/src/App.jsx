import { useState, useEffect, useRef } from "react";

/* ─── CSS Variables & Global Keyframes injected once ─────────────────── */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #07070f; --bg2: #0e0e1a; --bg3: #14142a;
    --gold: #c9a84c; --gold-dim: #8a6e2f; --gold-glow: rgba(201,168,76,0.15);
    --text: #e8e4d8; --text-dim: #7a7568; --border: rgba(201,168,76,0.18);
    --green: #6bcb77; --red: #e07070;
  }
  html { font-size: 16px; scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'EB Garamond', Georgia, serif;
    min-height: 100vh; line-height: 1.6; -webkit-font-smoothing: antialiased; }
  h1,h2,h3,h4 { font-family: 'Cinzel', serif; letter-spacing: 0.04em; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 2px; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.85); } 50% { opacity:1; transform:scale(1); } }
  @keyframes flicker { 0%,100%{opacity:1} 91%{opacity:.8} 93%{opacity:1} 95%{opacity:.7} 97%{opacity:1} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes orbit { from{transform:rotate(0deg) translateX(120px) rotate(0deg)} to{transform:rotate(360deg) translateX(120px) rotate(-360deg)} }
  @keyframes spinRing { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes drawIn { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }

  .fade-up { animation: fadeUp 0.55s ease both; }
  .fade-up-1 { animation: fadeUp 0.55s 0.1s ease both; }
  .fade-up-2 { animation: fadeUp 0.55s 0.2s ease both; }
  .fade-up-3 { animation: fadeUp 0.55s 0.35s ease both; }

  /* Particle canvas */
  #particles-bg { position:fixed; inset:0; z-index:0; pointer-events:none; opacity:0.4; }

  /* Print styles for PDF export */
  @media print {
    #particles-bg, .no-print { display:none !important; }
    body { background:#fff; color:#111; }
    .print-page { page-break-before: always; }
  }

  @media (max-width: 640px) {
    .council-row { gap: 0.7rem !important; }
    .council-row > div { width: 80px !important; }
    .col-grid { grid-template-columns: 1fr !important; }
    .arena-pad { padding: 1rem !important; }
    .pos-header { flex-direction: column !important; }
    .portrait-lg { width: 56px !important; height: 56px !important; }
  }
`;

/* ─── Particles Background ────────────────────────────────────────────── */
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      o: Math.random(),
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${p.o * 0.6})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} id="particles-bg" />;
}

/* ─── Favicon injector ────────────────────────────────────────────────── */
function injectFavicon() {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
    <rect width='32' height='32' fill='%2307070f'/>
    <text x='16' y='23' font-size='20' text-anchor='middle' fill='%23c9a84c'>⚖</text>
  </svg>`;
  const link = document.querySelector("link[rel~='icon']") || document.createElement("link");
  link.type = "image/svg+xml"; link.rel = "icon";
  link.href = `data:image/svg+xml,${svg}`;
  document.head.appendChild(link);
  document.title = "Council of Minds";
}

/* ─── Portrait component with fallback ───────────────────────────────── */
function Portrait({ name, url, size = 90, style = {} }) {
  const [err, setErr] = useState(false);
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2);

  return (!url || err) ? (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: "var(--bg3)",
      border: "2px solid var(--border)", display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "Cinzel, serif", color: "var(--gold)",
      fontSize: size * 0.3, flexShrink: 0, letterSpacing: "0.05em", ...style,
    }}>{initials}</div>
  ) : (
    <img src={url} alt={name} onError={() => setErr(true)}
      style={{
        width: size, height: size, borderRadius: "50%", objectFit: "cover",
        objectPosition: "top",
        border: "2px solid var(--border)", background: "var(--bg3)",
        filter: "sepia(0.2) contrast(1.1) brightness(0.95)",
        flexShrink: 0, ...style,
      }} />
  );
}

/* ─── Loading Screen ──────────────────────────────────────────────────── */
const LOAD_STEPS = [
  "Analysing the question...",
  "Selecting the Council...",
  "Retrieving grounded knowledge (Foundry IQ)...",
  "Round I — Opening positions...",
  "Round II — Cross-examination...",
  "Round III — Final rebuttals...",
  "Consensus Agent synthesising...",
];

function LoadingScreen({ step, topic }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:"1.5rem",
      position:"relative", zIndex:1 }}>
      {/* Animated ring */}
      <div style={{ position:"relative", width:100, height:100, marginBottom:"0.5rem" }}>
        <svg width="100" height="100" style={{ position:"absolute", inset:0 }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="2"/>
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" strokeWidth="2"
            strokeDasharray="276" strokeDashoffset={276 - (276 * Math.min(step / (LOAD_STEPS.length-1), 1))}
            strokeLinecap="round"
            style={{ transition:"stroke-dashoffset 0.8s ease", transformOrigin:"50% 50%", transform:"rotate(-90deg)" }}/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:"2rem", animation:"flicker 4s infinite" }}>⚖</div>
      </div>

      <div style={{ fontFamily:"Cinzel, serif", color:"var(--gold)", fontSize:"1.3rem", textAlign:"center" }}>
        The Council Deliberates
      </div>
      {topic && (
        <div style={{ color:"var(--text-dim)", fontStyle:"italic", fontSize:"0.95rem",
          maxWidth:400, textAlign:"center" }}>"{topic}"</div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:"0.45rem",
        background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:8,
        padding:"1.2rem 1.8rem", minWidth:280 }}>
        {LOAD_STEPS.map((s, i) => (
          <div key={i} style={{
            fontSize:"0.88rem", display:"flex", gap:"0.7rem", alignItems:"center",
            color: i < step ? "var(--gold)" : i === step ? "var(--text)" : "var(--text-dim)",
            transition:"color 0.4s",
          }}>
            <span style={{ fontSize:"0.7rem", minWidth:14 }}>
              {i < step ? "✓" : i === step ? "›" : "·"}
            </span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Position Card ───────────────────────────────────────────────────── */
function PositionCard({ position, delay = 0 }) {
  return (
    <div style={{
      background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10,
      padding:"1.5rem", marginBottom:"1.2rem",
      animation:`fadeUp 0.5s ${delay}s ease both`,
      boxShadow:"0 4px 24px rgba(0,0,0,0.35)",
    }}>
      {/* Header: portrait + name */}
      <div className="pos-header" style={{ display:"flex", gap:"1rem", alignItems:"flex-start", marginBottom:"1rem" }}>
        <Portrait name={position.name} url={position.portrait_url} size={64} style={{ border:"2px solid var(--gold-dim)" }} />
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"Cinzel, serif", color:"var(--gold)", fontSize:"1rem", marginBottom:"0.2rem" }}>
            {position.name}
          </div>
          {position.key_citation && (
            <div style={{ fontSize:"0.78rem", color:"var(--text-dim)", fontStyle:"italic" }}>
              citing: {position.key_citation}
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize:"1rem", lineHeight:1.8, color:"var(--text)", whiteSpace:"pre-wrap" }}>
        {position.position}
      </div>

      {position.one_line && (
        <div style={{
          marginTop:"1rem", padding:"0.7rem 1rem",
          borderLeft:"3px solid var(--gold)", background:"rgba(201,168,76,0.05)",
          fontSize:"0.95rem", color:"var(--gold)", fontStyle:"italic", borderRadius:"0 6px 6px 0",
        }}>
          "{position.one_line}"
        </div>
      )}
    </div>
  );
}

/* ─── PDF Export ──────────────────────────────────────────────────────── */
function exportPDF(debate) {
  const win = window.open("", "_blank");
  const rounds = debate.rounds || [];
  const council = debate.council || [];

  const positionsHtml = rounds.map(r => `
    <div style="margin-bottom:2rem;">
      <h3 style="color:#8a6e2f;border-bottom:1px solid #ddd;padding-bottom:0.5rem;margin-bottom:1rem;">
        Round ${r.round} — ${r.title}
      </h3>
      ${(r.positions || []).map(p => `
        <div style="margin-bottom:1.5rem;padding:1rem;border:1px solid #ddd;border-radius:6px;">
          <strong style="font-size:1.05rem;">${p.name}</strong>
          ${p.key_citation ? `<div style="font-size:0.8rem;color:#888;margin-bottom:0.5rem;">citing: ${p.key_citation}</div>` : ""}
          <p style="line-height:1.7;margin:0.5rem 0;">${p.position}</p>
          ${p.one_line ? `<blockquote style="border-left:3px solid #c9a84c;padding-left:0.8rem;color:#8a6e2f;font-style:italic;">"${p.one_line}"</blockquote>` : ""}
        </div>`).join("")}
    </div>`).join("");

  const consensus = debate.consensus || {};
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Council of Minds — ${debate.topic}</title>
    <style>body{font-family:Georgia,serif;max-width:780px;margin:2rem auto;color:#111;line-height:1.6;}
    h1{color:#8a6e2f;} h2{color:#555;margin-top:2rem;}</style>
  </head><body>
    <h1>⚖ Council of Minds</h1>
    <h2 style="font-style:italic;">"${debate.topic}"</h2>
    <p style="color:#888;">${debate.moderation?.framing || ""}</p>
    <p><strong>Council:</strong> ${council.map(c => c.name).join(", ")}</p>
    <hr/>
    ${positionsHtml}
    <div style="background:#f9f6f0;padding:1.5rem;border-radius:8px;margin-top:2rem;">
      <h2>The Council's Verdict</h2>
      ${consensus.memorable_quote ? `<blockquote style="font-style:italic;border-left:3px solid #c9a84c;padding-left:1rem;">"${consensus.memorable_quote}"</blockquote>` : ""}
      <p><strong>Convergence:</strong> ${consensus.confidence}%</p>
      <p>${consensus.verdict || ""}</p>
      <p><strong>Recommended Action:</strong> ${consensus.recommended_action || ""}</p>
    </div>
    <p style="color:#aaa;font-size:0.8rem;margin-top:2rem;">Generated by Council of Minds · Microsoft Agents League Hackathon 2026</p>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

/* ─── Share Button ────────────────────────────────────────────────────── */
function ShareBtn({ topic }) {
  const [copied, setCopied] = useState(false);
  const share = () => {
    const text = `⚖ Council of Minds debated: "${topic}" — watch Einstein, Turing, Gandhi & Ada Lovelace reason through modern questions with AI. #AgentsLeague #MicrosoftAI`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };
  return (
    <button onClick={share} className="no-print" style={{
      padding:"0.7rem 1.5rem", background:"transparent",
      border:"1px solid var(--border)", color: copied ? "var(--green)" : "var(--text-dim)",
      fontFamily:"Cinzel, serif", fontSize:"0.75rem", letterSpacing:"0.1em",
      cursor:"pointer", borderRadius:4, transition:"all 0.2s",
    }}>
      {copied ? "✓ COPIED" : "⬡ SHARE"}
    </button>
  );
}

/* ─── Consensus Panel ─────────────────────────────────────────────────── */
function ConsensusPanel({ consensus }) {
  return (
    <div style={{
      background:"linear-gradient(135deg,var(--bg2) 0%,rgba(201,168,76,0.04) 100%)",
      border:"1px solid var(--gold)", borderRadius:12, padding:"2.5rem", marginTop:"3rem",
      animation:"fadeUp 0.6s ease both",
    }}>
      <div style={{ fontFamily:"Cinzel, serif", color:"var(--gold)", fontSize:"1.3rem", marginBottom:"0.4rem" }}>
        The Council's Verdict
      </div>

      {consensus.memorable_quote && (
        <blockquote style={{
          fontStyle:"italic", fontSize:"1.05rem", color:"var(--text)",
          margin:"1rem 0 1.5rem", lineHeight:1.75,
          borderLeft:"3px solid var(--gold)", paddingLeft:"1rem",
        }}>
          "{consensus.memorable_quote}"
        </blockquote>
      )}

      {/* Confidence bar */}
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.8rem" }}>
        <div style={{ flex:1, height:4, background:"var(--bg3)", borderRadius:2 }}>
          <div style={{ height:"100%", width:`${consensus.confidence || 0}%`,
            background:"linear-gradient(90deg,var(--gold-dim),var(--gold))",
            borderRadius:2, transition:"width 1.2s ease" }} />
        </div>
        <span style={{ fontFamily:"Cinzel, serif", fontSize:"0.8rem", color:"var(--gold)", whiteSpace:"nowrap" }}>
          {consensus.confidence}% convergence
        </span>
      </div>

      <div className="col-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"1.8rem" }}>
        <div>
          <div style={{ fontFamily:"Cinzel, serif", fontSize:"0.72rem", letterSpacing:"0.1em",
            textTransform:"uppercase", color:"var(--green)", marginBottom:"0.8rem" }}>Points of Agreement</div>
          {(consensus.agreements || []).map((a, i) => (
            <div key={i} style={{ fontSize:"0.9rem", lineHeight:1.65, marginBottom:"0.5rem",
              paddingLeft:"0.8rem", borderLeft:"2px solid var(--green)", color:"var(--text)" }}>{a}</div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily:"Cinzel, serif", fontSize:"0.72rem", letterSpacing:"0.1em",
            textTransform:"uppercase", color:"var(--gold)", marginBottom:"0.8rem" }}>Points of Contention</div>
          {(consensus.disagreements || []).map((d, i) => (
            <div key={i} style={{ fontSize:"0.9rem", lineHeight:1.65, marginBottom:"0.5rem",
              paddingLeft:"0.8rem", borderLeft:"2px solid var(--gold-dim)", color:"var(--text)" }}>{d}</div>
          ))}
        </div>
      </div>

      <div style={{ fontSize:"1rem", lineHeight:1.8, color:"var(--text)", marginBottom:"1.5rem" }}>
        {consensus.verdict}
      </div>

      {consensus.recommended_action && (
        <div style={{ background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.2)",
          borderRadius:6, padding:"1rem 1.2rem", fontSize:"0.95rem", color:"var(--text)" }}>
          <span style={{ color:"var(--gold)", fontFamily:"Cinzel, serif", fontSize:"0.7rem", letterSpacing:"0.1em" }}>
            RECOMMENDED ACTION —{" "}
          </span>
          {consensus.recommended_action}
        </div>
      )}
    </div>
  );
}

/* ─── Main App ────────────────────────────────────────────────────────── */
const FALLBACK_TOPICS = [
  "Should artificial intelligence be regulated?",
  "Is social media making humanity more or less connected?",
  "Can art created by AI be truly creative?",
  "Does democracy still work in the age of information overload?",
  "Is economic growth compatible with environmental survival?",
];

export default function App() {
  const [phase, setPhase] = useState("input");
  const [topic, setTopic] = useState("");
  const [suggestions, setSuggestions] = useState(FALLBACK_TOPICS);
  const [loadStep, setLoadStep] = useState(0);
  const [debate, setDebate] = useState(null);
  const [error, setError] = useState(null);

  // Inject global CSS + favicon once
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    injectFavicon();
    fetch("/api/topics/suggested").then(r => r.json()).then(setSuggestions).catch(() => {});
  }, []);

  async function startDebate() {
    if (!topic.trim()) return;
    setPhase("loading"); setLoadStep(0); setError(null);
    const interval = setInterval(() => setLoadStep(p => Math.min(p + 1, LOAD_STEPS.length - 1)), 9500);
    try {
      const r = await fetch("/api/debate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ topic }),
      });
      clearInterval(interval);
      const data = await r.json();
      if (r.status === 429 || data.error === "rate_limit") {
        setError("⏳ GitHub Models rate limit reached — please wait 2-3 minutes and try again.");
        setPhase("input"); return;
      }
      if (!r.ok) throw new Error(data.message || `Server error ${r.status}`);
      setDebate(data); setPhase("debate");
    } catch(e) {
      clearInterval(interval); setError(e.message); setPhase("input");
    }
  }

  function reset() { setDebate(null); setTopic(""); setPhase("input"); setLoadStep(0); }

  const Btn = ({ children, onClick, style={} }) => (
    <button onClick={onClick} style={{
      padding:"0.85rem 2.2rem", background:"transparent", border:"1px solid var(--gold)",
      color:"var(--gold)", fontFamily:"Cinzel, serif", fontSize:"0.82rem",
      letterSpacing:"0.12em", cursor:"pointer", borderRadius:4, transition:"all 0.2s",
      textTransform:"uppercase", ...style,
    }}
    onMouseEnter={e=>{e.currentTarget.style.background="var(--gold)";e.currentTarget.style.color="var(--bg)";}}
    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--gold)";}}>
      {children}
    </button>
  );

  /* ── INPUT ── */
  if (phase === "input") return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", position:"relative" }}>
      <Particles />
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex",
        flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"2rem", textAlign:"center",
        background:"radial-gradient(ellipse at 50% 40%,rgba(201,168,76,0.06) 0%,transparent 65%)" }}>

        <div className="fade-up" style={{ fontSize:"2.8rem", marginBottom:"1rem", animation:"flicker 5s infinite" }}>⚖</div>
        <h1 className="fade-up-1" style={{ fontFamily:"Cinzel, serif",
          fontSize:"clamp(1.8rem,5vw,3rem)", color:"var(--gold)", letterSpacing:"0.07em",
          marginBottom:"0.4rem", textShadow:"0 0 50px rgba(201,168,76,0.35)" }}>
          Council of Minds
        </h1>
        <p className="fade-up-2" style={{ fontFamily:"EB Garamond, serif", fontSize:"1.1rem",
          color:"var(--text-dim)", marginBottom:"2.5rem", fontStyle:"italic" }}>
          History's greatest thinkers debate the questions that define our era
        </p>

        {error && (
          <div style={{ color:"#e07070", marginBottom:"1rem", fontSize:"0.88rem",
            background:"rgba(224,112,112,0.08)", padding:"0.6rem 1rem", borderRadius:6,
            border:"1px solid rgba(224,112,112,0.2)" }}>
            {error}
          </div>
        )}

        <div className="fade-up-2" style={{ width:"100%", maxWidth:600, marginBottom:"1.2rem" }}>
          <input value={topic} onChange={e=>setTopic(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&startDebate()}
            placeholder="What shall the Council debate?"
            style={{ width:"100%", padding:"1rem 1.4rem", fontSize:"1.1rem",
              background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:6,
              color:"var(--text)", fontFamily:"EB Garamond, serif", outline:"none",
              transition:"border-color 0.25s, box-shadow 0.25s" }}
            onFocus={e=>{e.target.style.borderColor="var(--gold)";e.target.style.boxShadow="0 0 0 3px rgba(201,168,76,0.1)";}}
            onBlur={e=>{e.target.style.borderColor="var(--border)";e.target.style.boxShadow="none";}}
          />
        </div>

        <div className="fade-up-3"><Btn onClick={startDebate}>Convene the Council</Btn></div>

        <div style={{ height:"2rem" }} />
        <div style={{ fontSize:"0.72rem", color:"var(--text-dim)", marginBottom:"0.7rem",
          letterSpacing:"0.1em", fontFamily:"Cinzel, serif" }}>OR SELECT A QUESTION</div>

        <div style={{ display:"flex", gap:"0.55rem", flexWrap:"wrap", justifyContent:"center", maxWidth:680 }}>
          {suggestions.slice(0,5).map((s,i) => (
            <button key={i} onClick={()=>setTopic(s)} style={{
              padding:"0.38rem 0.85rem", border:"1px solid rgba(201,168,76,0.2)",
              borderRadius:999, fontSize:"0.8rem", color:"var(--text-dim)",
              cursor:"pointer", fontFamily:"EB Garamond, serif", transition:"all 0.2s",
              background:"transparent" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--text)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.2)";e.currentTarget.style.color="var(--text-dim)";}}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ marginTop:"3.5rem", fontSize:"0.7rem", color:"var(--text-dim)",
          fontFamily:"Cinzel, serif", letterSpacing:"0.1em" }}>
          MICROSOFT AGENTS LEAGUE · CREATIVE APPS · FOUNDRY IQ PATTERN
        </div>
      </div>
    </div>
  );

  /* ── LOADING ── */
  if (phase === "loading") return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", position:"relative" }}>
      <Particles />
      <LoadingScreen step={loadStep} topic={topic} />
    </div>
  );

  /* ── DEBATE ── */
  if (!debate) return null;
  const numerals = ["I","II","III","IV"];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", position:"relative" }}>
      <Particles />
      <div className="arena-pad fade-up" style={{ maxWidth:860, margin:"0 auto",
        padding:"2.5rem 1.5rem 5rem", position:"relative", zIndex:1 }}>

        {/* Header */}
        <div style={{ textAlign:"center", borderBottom:"1px solid var(--border)",
          paddingBottom:"2rem", marginBottom:"2.5rem" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.8rem", animation:"flicker 6s infinite" }}>⚖</div>
          <h2 style={{ fontFamily:"Cinzel, serif", color:"var(--gold)",
            fontSize:"clamp(1.1rem,3vw,1.75rem)", marginBottom:"0.7rem" }}>
            "{debate.topic}"
          </h2>
          <p style={{ color:"var(--text-dim)", fontStyle:"italic", fontSize:"0.95rem",
            maxWidth:560, margin:"0 auto 0.8rem" }}>
            {debate.moderation?.framing}
          </p>
          <p style={{ color:"var(--text)", fontSize:"1rem", lineHeight:1.7,
            maxWidth:600, margin:"0 auto" }}>
            {debate.moderation?.opening_statement}
          </p>
        </div>

        {/* Council row — small portraits */}
        <div className="council-row" style={{ display:"flex", gap:"1rem",
          justifyContent:"center", flexWrap:"wrap", marginBottom:"2.5rem" }}>
          {(debate.council||[]).map(m => (
            <div key={m.id} style={{ display:"flex", flexDirection:"column",
              alignItems:"center", gap:"0.45rem", width:110 }}>
              <Portrait name={m.name} url={m.portrait_url} size={72} />
              <div style={{ fontFamily:"Cinzel, serif", fontSize:"0.68rem",
                color:"var(--gold)", textAlign:"center", letterSpacing:"0.04em" }}>{m.name}</div>
              <div style={{ fontSize:"0.67rem", color:"var(--text-dim)", textAlign:"center" }}>{m.era}</div>
            </div>
          ))}
        </div>

        {/* Sub-questions */}
        {debate.moderation?.sub_questions?.length > 0 && (
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)",
            borderRadius:8, padding:"1.4rem 1.6rem", marginBottom:"3rem" }}>
            <div style={{ fontFamily:"Cinzel, serif", fontSize:"0.7rem", color:"var(--text-dim)",
              letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1rem" }}>
              Questions Before the Council
            </div>
            {debate.moderation.sub_questions.map((q,i) => (
              <div key={i} style={{ display:"flex", gap:"0.8rem", alignItems:"flex-start",
                marginBottom:"0.55rem", fontSize:"0.95rem" }}>
                <span style={{ color:"var(--gold)", fontFamily:"Cinzel, serif",
                  fontSize:"0.75rem", minWidth:20, paddingTop:2 }}>{numerals[i]}</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        )}

        {/* Rounds */}
        {(debate.rounds||[]).map(r => (
          <div key={r.round} style={{ marginBottom:"3.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem",
              marginBottom:"1.6rem", paddingBottom:"0.7rem", borderBottom:"1px solid var(--border)" }}>
              <span style={{ fontFamily:"Cinzel, serif", color:"var(--gold)",
                fontSize:"0.78rem", letterSpacing:"0.15em", textTransform:"uppercase" }}>
                Round {numerals[r.round-1]}
              </span>
              <span style={{ fontFamily:"Cinzel, serif", color:"var(--text)", fontSize:"1.05rem" }}>
                {r.title}
              </span>
            </div>
            {(r.positions||[]).map((pos,i) => (
              <PositionCard key={`${r.round}-${i}`} position={pos} delay={i * 0.1} />
            ))}
          </div>
        ))}

        {/* Consensus */}
        {debate.consensus && <ConsensusPanel consensus={debate.consensus} />}

        {/* IQ note */}
        <div style={{ marginTop:"2rem", padding:"0.9rem 1.1rem",
          border:"1px solid var(--border)", borderRadius:6,
          fontSize:"0.78rem", color:"var(--text-dim)", fontStyle:"italic" }}>
          <span style={{ color:"var(--gold)", fontFamily:"Cinzel, serif",
            fontSize:"0.68rem", letterSpacing:"0.08em" }}>FOUNDRY IQ PATTERN — </span>
          {debate.iq_grounding_note}
        </div>

        {/* Action buttons */}
        <div className="no-print" style={{ display:"flex", gap:"1rem", justifyContent:"center",
          marginTop:"2.5rem", flexWrap:"wrap" }}>
          <Btn onClick={reset}>New Council</Btn>
          <Btn onClick={() => exportPDF(debate)}>Export PDF</Btn>
          <ShareBtn topic={debate.topic} />
        </div>
      </div>
    </div>
  );
}
