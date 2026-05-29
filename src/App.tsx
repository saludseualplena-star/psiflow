import { useState, useEffect } from "react";

const CREDENTIALS = { user: "psicologo", password: "psiflow2025" };

const DIAGNOSTICOS = [
  "Ansiedad generalizada","Trastorno de pánico","Fobia específica","Fobia social",
  "TOC","TEPT / Trauma","Duelo","Depresión mayor","Distimia","Trastorno bipolar",
  "TDA / TDAH","Trastorno de personalidad","Trastorno alimentario","Insomnio",
  "Disfunción sexual","Problema de pareja","Estrés laboral","Sospecha diagnóstica","Otro",
];

const ENFOQUES = [
  "Terapia breve","TCC","EMDR","Sistémica","Humanista","Psicoanalítica",
  "Terapia de pareja","Terapia sexual","Mindfulness","ACT","DBT","Otro",
];

const TIMES = [
  "07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00",
];

const PALETTE = ["#818cf8","#34d399","#fb923c","#a78bfa","#38bdf8","#f472b6","#facc15","#4ade80","#f87171","#60a5fa"];

const intensityCfg = (n) => {
  if (n <= 2) return { label:"Leve", color:"#4ade80", dim:"rgba(74,222,128,0.12)", border:"rgba(74,222,128,0.25)" };
  if (n === 3) return { label:"Moderada", color:"#fb923c", dim:"rgba(251,146,60,0.12)", border:"rgba(251,146,60,0.25)" };
  return { label:"Alta", color:"#f87171", dim:"rgba(248,113,113,0.12)", border:"rgba(248,113,113,0.25)" };
};

const dxIcon = (d) => {
  const m = {
    "Ansiedad generalizada":"🌊","Trastorno de pánico":"💨","Fobia específica":"🔒",
    "Fobia social":"👥","TOC":"🔁","TEPT / Trauma":"⚡","Duelo":"🕊",
    "Depresión mayor":"🌙","Distimia":"🌧","Trastorno bipolar":"🌓",
    "TDA / TDAH":"🔆","Trastorno de personalidad":"🎭","Trastorno alimentario":"🍃",
    "Insomnio":"🌙","Disfunción sexual":"🌿","Problema de pareja":"💞",
    "Estrés laboral":"💼","Sospecha diagnóstica":"🔍","Otro":"💬",
  };
  return m[d] || "💬";
};

const optimizar = (pts) => {
  if (pts.length < 2) return pts;
  const sorted = [...pts].sort((a,b) => a.intensity - b.intensity);
  const times = pts.map(p => p.time).sort();
  return sorted.map((p,i) => ({ ...p, time: times[i] }));
};

const todayStr = () => {
  const d = new Date();
  return d.toLocaleDateString("es-CL",{ weekday:"long", day:"numeric", month:"long" });
};

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

// ── CSS ──────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080a0e;--s1:#0f1117;--s2:#161820;--s3:#1c1f27;
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.13);
  --text:#edeae3;--muted:#4e5166;--muted2:#363848;
  --accent:#818cf8;--accent2:#6366f1;
  --sans:'DM Sans',sans-serif;--serif:'Cormorant Garamond',Georgia,serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--sans)}
input,button,select,textarea{font-family:var(--sans)}
input::placeholder,textarea::placeholder{color:var(--muted)}
input:focus,textarea:focus{outline:none;border-color:var(--accent)!important}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--muted2);border-radius:2px}
.fi{animation:fi .4s ease both}
.su{animation:su .35s cubic-bezier(.16,1,.3,1) both}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes su{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pb{from{width:0}to{width:100%}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes tick{0%,100%{opacity:1}50%{opacity:0}}
.pr:hover:not(:disabled){opacity:.86;transform:translateY(-1px)}
.pr:active:not(:disabled){transform:translateY(0)}
.pr{transition:all .2s}
.row:hover{background:rgba(129,140,248,0.08)!important;transform:translateX(2px)}
.row{transition:background .15s,transform .15s}
.tag:hover{opacity:.8}
.tag{transition:all .15s}
.nb:hover{background:rgba(129,140,248,0.1)!important}
.nb{transition:all .2s}
.db:hover{background:rgba(248,113,113,0.18)!important;color:#f87171!important}
.db{transition:all .2s}
`;

// ── ICON ─────────────────────────────────────────────────────────
const Ic = ({ n, sz=20, c="currentColor" }) => {
  const paths = {
    cal:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    opt:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    add:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
    back:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
    trash:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    chk:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    warn:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    heart:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    out:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    note:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    pause:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    stats:<svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  };
  return paths[n] || null;
};

// ── LIVE CLOCK ────────────────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = time.getHours().toString().padStart(2,"0");
  const m = time.getMinutes().toString().padStart(2,"0");
  const s = time.getSeconds().toString().padStart(2,"0");
  return (
    <span style={{ fontVariantNumeric:"tabular-nums", fontFamily:"var(--sans)", fontSize:13, color:"var(--muted)" }}>
      {h}<span style={{ animation:"tick 1s step-start infinite" }}>:</span>{m}<span style={{ animation:"tick 1s step-start infinite", animationDelay:".5s" }}>:</span>{s}
    </span>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showP, setShowP] = useState(false);

  const go = () => {
    if (!user.trim() || !pass) { setErr("Completa ambos campos"); return; }
    setLoading(true);
    setTimeout(() => {
      if (user.trim() === CREDENTIALS.user && pass === CREDENTIALS.password) onLogin();
      else { setErr("Credenciales incorrectas"); setLoading(false); }
    }, 900);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"var(--bg)", padding:"0 28px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse at 30% 30%, rgba(99,102,241,0.09), transparent 55%), radial-gradient(ellipse at 70% 75%, rgba(129,140,248,0.05), transparent 50%)" }} />

      <div className="fi" style={{ width:"100%", maxWidth:360, position:"relative", zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ width:72, height:72, margin:"0 auto 18px", position:"relative" }}>
            <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="72" height="72" rx="20" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1"/>
              <circle cx="36" cy="28" r="10" stroke="#818cf8" strokeWidth="1.5"/>
              <path d="M28 28c0-4.4 3.6-8 8-8" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M22 50c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M30 44l2 4 4-8 4 8 2-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontFamily:"var(--serif)", fontSize:34, fontWeight:300, letterSpacing:-0.5, marginBottom:6 }}>PsiFlow</div>
          <div style={{ fontSize:13, color:"var(--muted)", letterSpacing:0.3 }}>Bienestar del terapeuta · Agenda inteligente</div>
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:10, color:"var(--muted)", letterSpacing:2.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>Usuario</label>
          <input style={{ width:"100%", padding:"13px 16px", borderRadius:12, background:"var(--s2)",
            border:"1px solid var(--border2)", color:"var(--text)", fontSize:15 }}
            type="text" placeholder="tu usuario" value={user}
            onChange={e => { setUser(e.target.value); setErr(""); }}
            onKeyDown={e => e.key==="Enter" && go()} autoComplete="username" />
        </div>

        <div style={{ marginBottom:24 }}>
          <label style={{ fontSize:10, color:"var(--muted)", letterSpacing:2.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>Contraseña</label>
          <div style={{ position:"relative" }}>
            <input style={{ width:"100%", padding:"13px 48px 13px 16px", borderRadius:12, background:"var(--s2)",
              border:"1px solid var(--border2)", color:"var(--text)", fontSize:15 }}
              type={showP?"text":"password"} placeholder="••••••••" value={pass}
              onChange={e => { setPass(e.target.value); setErr(""); }}
              onKeyDown={e => e.key==="Enter" && go()} autoComplete="current-password" />
            <button onClick={() => setShowP(v=>!v)} style={{ position:"absolute", right:14, top:"50%",
              transform:"translateY(-50%)", background:"none", border:"none", color:"var(--muted)",
              cursor:"pointer", fontSize:12, padding:4 }}>{showP?"Ocultar":"Ver"}</button>
          </div>
        </div>

        {err && <div className="su" style={{ marginBottom:14, padding:"10px 14px", borderRadius:10,
          background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)",
          fontSize:13, color:"#fca5a5", textAlign:"center" }}>{err}</div>}

        <button className="pr" onClick={go} disabled={loading} style={{ width:"100%", padding:15, borderRadius:13,
          border:"none", background: loading?"var(--s2)":"linear-gradient(135deg,#6366f1,#818cf8)",
          color: loading?"var(--muted)":"white", fontSize:15, fontWeight:500,
          cursor: loading?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {loading ? <><div style={{ width:16, height:16, border:"2px solid var(--muted)", borderTopColor:"transparent",
            borderRadius:"50%", animation:"spin .7s linear infinite" }} />Verificando...</> : "Ingresar →"}
        </button>

        <div style={{ marginTop:28, padding:"14px 16px", borderRadius:12, background:"var(--s2)",
          border:"1px solid var(--border)", fontSize:12, color:"var(--muted)", lineHeight:1.7 }}>
          <div style={{ marginBottom:4, color:"var(--text)", fontSize:13 }}>Acceso de demostración</div>
          Usuario: <span style={{ color:"var(--accent)" }}>psicologo</span> &nbsp;·&nbsp; Contraseña: <span style={{ color:"var(--accent)" }}>psiflow2025</span>
        </div>
      </div>
    </div>
  );
}

// ── SEMÁFORO INICIAL ──────────────────────────────────────────────
function Semaforo({ onDone }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    { key:"mood", q:"¿Cómo llegaste hoy emocionalmente?", opts:["Muy bien","Bien","Regular","Cansado/a","Mal"] },
    { key:"sleep", q:"¿Cómo dormiste anoche?", opts:["Muy bien","Bien","Interrumpido","Poco","Mal"] },
    { key:"personal", q:"¿Tienes algo personal activo hoy?", opts:["No, tranquilo/a","Algo menor","Sí, algo presente","Sí, me pesa"] },
  ];

  const scores = { 0:5, 1:4, 2:3, 3:2, 4:1 };

  const handleSelect = (val) => {
    const newAns = { ...answers, [questions[step].key]: val };
    setAnswers(newAns);
    if (step < questions.length - 1) {
      setStep(s => s+1);
    } else {
      const total = Object.values(newAns).reduce((a,v) => a + scores[v], 0);
      const pct = Math.round((total / 15) * 100);
      onDone(pct, newAns);
    }
  };

  const q = questions[step];
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", background:"var(--bg)", padding:"0 28px" }}>
      <div className="fi" style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:11, color:"var(--accent)", letterSpacing:3, textTransform:"uppercase", marginBottom:12 }}>
            Check-in inicial · {step+1} de {questions.length}
          </div>
          <div style={{ fontFamily:"var(--serif)", fontSize:26, fontWeight:300, lineHeight:1.3, color:"var(--text)" }}>
            {q.q}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {q.opts.map((opt, i) => (
            <button key={opt} className="pr" onClick={() => handleSelect(i)} style={{
              padding:"14px 20px", borderRadius:14, border:"1px solid var(--border2)",
              background:"var(--s2)", color:"var(--text)", fontSize:15, cursor:"pointer",
              textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              {opt}
              <span style={{ color:"var(--muted)", fontSize:18 }}>→</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop:24, display:"flex", gap:6, justifyContent:"center" }}>
          {questions.map((_,i) => (
            <div key={i} style={{ width: i===step?20:6, height:6, borderRadius:3,
              background: i<=step?"var(--accent)":"var(--muted2)", transition:"all .3s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────────
function BottomNav({ view, setView, onLogout }) {
  const tabs = [
    { id:"dashboard", label:"Agenda", icon:"cal" },
    { id:"optimize", label:"Optimizar", icon:"opt" },
    { id:"addPatient", label:"Paciente", icon:"add" },
    { id:"resumen", label:"Resumen", icon:"stats" },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
      width:"100%", maxWidth:440, background:"rgba(15,17,23,0.95)", borderTop:"1px solid var(--border)",
      display:"flex", alignItems:"center", padding:"8px 4px 20px", zIndex:50, backdropFilter:"blur(20px)" }}>
      {tabs.map(t => {
        const active = view===t.id;
        return (
          <button key={t.id} className="nb" onClick={() => setView(t.id)} style={{
            flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            background: active?"rgba(129,140,248,0.12)":"none",
            border:"none", borderRadius:12, padding:"10px 4px", cursor:"pointer",
            color: active?"var(--accent)":"var(--muted)" }}>
            <Ic n={t.icon} sz={20} c={active?"#818cf8":"#4e5166"} />
            <span style={{ fontSize:10, fontWeight: active?500:400, letterSpacing:0.3 }}>{t.label}</span>
          </button>
        );
      })}
      <button className="nb db" onClick={onLogout} style={{ display:"flex", flexDirection:"column",
        alignItems:"center", gap:4, background:"none", border:"none", borderRadius:12,
        padding:"10px 4px", cursor:"pointer", color:"var(--muted)", minWidth:56 }}>
        <Ic n="out" sz={20} c="#4e5166" />
        <span style={{ fontSize:10 }}>Salir</span>
      </button>
    </div>
  );
}

// ── PAUSA MODAL ───────────────────────────────────────────────────
function PausaModal({ paciente, onClose }) {
  const [seg, setSeg] = useState(600);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (seg <= 0) { setRunning(false); return; }
    const t = setTimeout(() => setSeg(s=>s-1), 1000);
    return () => clearTimeout(t);
  }, [running, seg]);
  const mm = Math.floor(seg/60).toString().padStart(2,"0");
  const ss = (seg%60).toString().padStart(2,"0");
  const pct = ((600-seg)/600)*100;
  const sugerencias = paciente.intensity>=4
    ? ["Respira profundo 4-7-8 tres veces","Estira el cuello lentamente","Toma agua","Observa un punto fijo 30 segundos"]
    : ["Camina unos pasos","Respira naturalmente","Registra algo positivo de la sesión"];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div className="su" style={{ background:"var(--s1)", borderRadius:24, padding:28,
        border:"1px solid var(--border2)", width:"100%", maxWidth:340, textAlign:"center" }}>
        <div style={{ fontSize:11, color:"var(--accent)", letterSpacing:3, textTransform:"uppercase", marginBottom:12 }}>
          Pausa de recuperación
        </div>
        <div style={{ fontFamily:"var(--serif)", fontSize:20, marginBottom:6, color:"var(--text)" }}>
          Sesión con {paciente.name} finalizada
        </div>
        <div style={{ fontSize:13, color:"var(--muted)", marginBottom:24 }}>
          Tómate este espacio antes de continuar
        </div>

        {/* Timer circular */}
        <div style={{ position:"relative", width:100, height:100, margin:"0 auto 20px" }}>
          <svg width="100" height="100" style={{ transform:"rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--s3)" strokeWidth="6"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#818cf8" strokeWidth="6"
              strokeDasharray={`${2*Math.PI*44}`}
              strokeDashoffset={`${2*Math.PI*44*(1-pct/100)}`}
              strokeLinecap="round" style={{ transition:"stroke-dashoffset .5s" }}/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
            justifyContent:"center", fontFamily:"var(--serif)", fontSize:22, color:"var(--text)" }}>
            {mm}:{ss}
          </div>
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          <button onClick={() => setRunning(v=>!v)} style={{ flex:1, padding:"10px", borderRadius:11,
            background: running?"rgba(248,113,113,0.12)":"rgba(129,140,248,0.15)",
            border:`1px solid ${running?"rgba(248,113,113,0.25)":"rgba(129,140,248,0.3)"}`,
            color: running?"#f87171":"var(--accent)", cursor:"pointer", fontSize:14, fontWeight:500 }}>
            {running?"Pausar":"Iniciar"}
          </button>
          <button onClick={() => setSeg(600)} style={{ padding:"10px 14px", borderRadius:11,
            background:"var(--s2)", border:"1px solid var(--border)", color:"var(--muted)", cursor:"pointer", fontSize:13 }}>
            ↺
          </button>
        </div>

        <div style={{ textAlign:"left", marginBottom:20 }}>
          <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>
            Sugerencias
          </div>
          {sugerencias.map(s => (
            <div key={s} style={{ fontSize:13, color:"var(--text)", marginBottom:7,
              display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ color:"var(--accent)", marginTop:1 }}>·</span>{s}
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{ width:"100%", padding:"12px", borderRadius:12,
          border:"1px solid var(--border2)", background:"none", color:"var(--muted)",
          cursor:"pointer", fontSize:14 }}>Continuar</button>
      </div>
    </div>
  );
}

// ── NOTA POST-SESIÓN ──────────────────────────────────────────────
function NotaModal({ paciente, onSave, onClose }) {
  const [estado, setEstado] = useState(3);
  const [nota, setNota] = useState("");

  const opciones = [
    { v:5, label:"Muy bien", c:"#4ade80" },
    { v:4, label:"Bien", c:"#a3e635" },
    { v:3, label:"Regular", c:"#fb923c" },
    { v:2, label:"Cansado/a", c:"#f87171" },
    { v:1, label:"Agotado/a", c:"#e879f9" },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div className="su" style={{ background:"var(--s1)", borderRadius:24, padding:24,
        border:"1px solid var(--border2)", width:"100%", maxWidth:340 }}>
        <div style={{ fontSize:11, color:"var(--accent)", letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>
          Cierre de sesión
        </div>
        <div style={{ fontFamily:"var(--serif)", fontSize:20, marginBottom:4, color:"var(--text)" }}>
          Sesión con {paciente.name}
        </div>
        <div style={{ fontSize:13, color:"var(--muted)", marginBottom:20 }}>
          ¿Cómo quedaste tú emocionalmente?
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:18 }}>
          {opciones.map(o => (
            <button key={o.v} onClick={() => setEstado(o.v)} style={{
              flex:1, padding:"10px 4px", borderRadius:10, border:"none", cursor:"pointer",
              background: estado===o.v ? `${o.c}22` : "var(--s2)",
              border: estado===o.v ? `1px solid ${o.c}44` : "1px solid var(--border)",
              color: estado===o.v ? o.c : "var(--muted)", fontSize:10, lineHeight:1.4,
              transition:"all .15s", fontFamily:"var(--sans)" }}>
              {o.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:10, color:"var(--muted)", letterSpacing:2, textTransform:"uppercase", display:"block", marginBottom:8 }}>
            Nota rápida (opcional)
          </label>
          <textarea value={nota} onChange={e=>setNota(e.target.value)}
            placeholder="¿Algo que quieras registrar de esta sesión?"
            style={{ width:"100%", padding:"11px 14px", borderRadius:11, background:"var(--s2)",
              border:"1px solid var(--border2)", color:"var(--text)", fontSize:13,
              resize:"none", height:80, lineHeight:1.5 }} />
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onClose} style={{ flex:1, padding:"12px", borderRadius:11,
            border:"1px solid var(--border)", background:"none", color:"var(--muted)", cursor:"pointer", fontSize:14 }}>
            Omitir
          </button>
          <button className="pr" onClick={() => onSave({ estado, nota, pacienteId: paciente.id })} style={{
            flex:2, padding:"12px", borderRadius:11, border:"none",
            background:"linear-gradient(135deg,#6366f1,#818cf8)",
            color:"white", cursor:"pointer", fontSize:14, fontWeight:500 }}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function PsiFlow() {
  const [phase, setPhase] = useState("login"); // login | checkin | app
  const [therapistState, setTherapistState] = useState(null);
  const [view, setView] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [optimized, setOptimized] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [showPausa, setShowPausa] = useState(null);
  const [showNota, setShowNota] = useState(null);
  const [notas, setNotas] = useState([]);
  const [addForm, setAddForm] = useState({ name:"", diagnosis:"Ansiedad generalizada", enfoque:"", intensity:3, focus:"", time:"09:00", sesionNum:1 });
  const [addSuccess, setAddSuccess] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [therapistName, setTherapistName] = useState("Psicólogo/a");

  if (phase==="login") return <><style>{CSS}</style><Login onLogin={() => setPhase("checkin")} /></>;
  if (phase==="checkin") return <><style>{CSS}</style><Semaforo onDone={(pct, ans) => { setTherapistState({ pct, ans }); setPhase("app"); }} /></>;

  // ── computed ──
  const loadPct = patients.length ? Math.round(patients.reduce((a,p)=>a+p.intensity,0)/(patients.length*5)*100) : 0;
  const loadColor = loadPct>70?"#f87171":loadPct>50?"#fb923c":"#4ade80";
  const hasConsec = patients.some((p,i) => i<patients.length-1 && p.intensity>=4 && patients[i+1].intensity>=4);

  const stateColor = therapistState?.pct>=70?"#4ade80":therapistState?.pct>=45?"#fb923c":"#f87171";
  const stateLabel = therapistState?.pct>=70?"Óptimo":therapistState?.pct>=45?"Precaución":"Vulnerable";

  // resumen diagnósticos
  const dxCount = {};
  patients.forEach(p => { dxCount[p.diagnosis] = (dxCount[p.diagnosis]||0)+1; });
  const topDx = Object.entries(dxCount).sort((a,b)=>b[1]-a[1]);
  const highCount = patients.filter(p=>p.intensity>=4).length;
  const avgLoad = patients.length ? (patients.reduce((a,p)=>a+p.intensity,0)/patients.length).toFixed(1) : "—";

  // ── handlers ──
  const doOptimize = () => {
    setOptimizing(true);
    setTimeout(() => { setPatients(optimizar(patients)); setOptimizing(false); setOptimized(true); setView("dashboard"); }, 2600);
  };

  const doAdd = () => {
    if (!addForm.name.trim()) { setFormErr("El nombre o etiqueta es obligatorio"); return; }
    if (!addForm.focus.trim()) { setFormErr("El foco de trabajo es obligatorio"); return; }
    const p = {
      id: Date.now(),
      name: addForm.name.trim(),
      initials: addForm.name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
      diagnosis: addForm.diagnosis,
      enfoque: addForm.enfoque,
      intensity: addForm.intensity,
      focus: addForm.focus.trim(),
      time: addForm.time,
      duration: 50,
      sesionNum: addForm.sesionNum,
      color: PALETTE[patients.length % PALETTE.length],
      postNota: null,
    };
    setPatients(prev => [...prev, p].sort((a,b)=>a.time.localeCompare(b.time)));
    setOptimized(false);
    setAddSuccess(true);
    setTimeout(() => {
      setAddSuccess(false);
      setAddForm({ name:"", diagnosis:"Ansiedad generalizada", enfoque:"", intensity:3, focus:"", time:"09:00", sesionNum:1 });
      setView("dashboard");
    }, 1800);
  };

  const doDelete = (id) => {
    setPatients(prev=>prev.filter(p=>p.id!==id));
    setConfirmDel(null); setSelected(null); setOptimized(false);
  };

  const saveNota = (nota) => {
    setNotas(prev=>[...prev, nota]);
    setPatients(prev=>prev.map(p=>p.id===nota.pacienteId?{...p, postNota:nota}:p));
    setShowNota(null);
  };

  const navTo = (v) => { setView(v); setSelected(null); setFormErr(""); };

  const Label = ({ children }) => (
    <div style={{ fontSize:10, color:"var(--muted)", letterSpacing:2.5, textTransform:"uppercase", fontWeight:500, marginBottom:8 }}>{children}</div>
  );
  const Card = ({ children, style }) => (
    <div style={{ background:"var(--s1)", borderRadius:16, padding:18, marginBottom:10, border:"1px solid var(--border)", ...style }}>{children}</div>
  );

  return (
    <>
      <style>{CSS}</style>
      {showPausa && <PausaModal paciente={showPausa} onClose={()=>setShowPausa(null)} />}
      {showNota && <NotaModal paciente={showNota} onSave={saveNota} onClose={()=>setShowNota(null)} />}

      {/* Confirm delete */}
      {confirmDel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:150,
          display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div className="su" style={{ background:"var(--s1)", borderRadius:20, padding:28,
            border:"1px solid var(--border2)", width:"100%", maxWidth:300, textAlign:"center" }}>
            <div style={{ fontFamily:"var(--serif)", fontSize:21, marginBottom:8 }}>¿Eliminar paciente?</div>
            <div style={{ fontSize:13, color:"var(--muted)", marginBottom:24, lineHeight:1.6 }}>
              Se eliminará <strong style={{ color:"var(--text)" }}>{selected?.name}</strong> de la agenda de hoy.
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, padding:"12px", borderRadius:11,
                border:"1px solid var(--border2)", background:"none", color:"var(--text)", cursor:"pointer", fontSize:14 }}>Cancelar</button>
              <button onClick={()=>doDelete(selected.id)} style={{ flex:1, padding:"12px", borderRadius:11,
                border:"none", background:"rgba(248,113,113,0.15)", color:"#f87171", cursor:"pointer", fontSize:14, fontWeight:500 }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ fontFamily:"var(--sans)", background:"var(--bg)", minHeight:"100vh", color:"var(--text)", maxWidth:440, margin:"0 auto" }}>
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
          background:"radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.05), transparent 60%)" }} />

        {/* HEADER */}
        <div style={{ position:"sticky", top:0, zIndex:40, background:"rgba(8,10,14,0.92)",
          backdropFilter:"blur(24px)", borderBottom:"1px solid var(--border)", padding:"18px 24px 14px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
            <div>
              {selected && view==="dashboard" && (
                <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none",
                  color:"var(--accent)", cursor:"pointer", fontSize:13, padding:0,
                  display:"flex", alignItems:"center", gap:4, marginBottom:6 }}>
                  <Ic n="back" sz={15} c="#818cf8" /> Volver
                </button>
              )}
              <div style={{ fontFamily:"var(--serif)", fontSize:26, fontWeight:300, letterSpacing:-0.5, lineHeight:1 }}>
                {selected && view==="dashboard" ? selected.name :
                 view==="dashboard"?"Mi Agenda":
                 view==="optimize"?"Optimizar":
                 view==="addPatient"?"Nuevo Paciente":"Resumen del Día"}
              </div>
              {view==="dashboard" && !selected && (
                <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:5 }}>
                  <span style={{ fontSize:12, color:"var(--muted)" }}>{capitalize(todayStr())}</span>
                  <span style={{ color:"var(--muted2)" }}>·</span>
                  <Clock />
                </div>
              )}
            </div>

            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
              <div style={{ width:40, height:40, borderRadius:12,
                background:"linear-gradient(135deg,rgba(99,102,241,0.25),rgba(129,140,248,0.15))",
                border:"1px solid rgba(99,102,241,0.3)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"var(--serif)", fontSize:16, color:"var(--accent)" }}>Ψ</div>
              {therapistState && (
                <div style={{ fontSize:11, color:stateColor, letterSpacing:0.5 }}>● {stateLabel}</div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding:"18px 24px 110px", position:"relative", zIndex:1 }}>

          {/* ══ DASHBOARD ══ */}
          {view==="dashboard" && !selected && (
            <div className="fi">
              {/* Estado del terapeuta */}
              {therapistState && (
                <Card style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <Label>Tu estado hoy</Label>
                      <div style={{ fontFamily:"var(--serif)", fontSize:28, fontWeight:300, color:stateColor, lineHeight:1 }}>
                        {stateLabel}
                      </div>
                    </div>
                    <div style={{ fontFamily:"var(--serif)", fontSize:28, fontWeight:300, color:stateColor }}>{therapistState.pct}%</div>
                  </div>
                  <div style={{ background:"var(--s3)", borderRadius:4, height:5, overflow:"hidden", marginBottom:8 }}>
                    <div style={{ height:"100%", width:`${therapistState.pct}%`, borderRadius:4,
                      background:`linear-gradient(90deg,#6366f1,${stateColor})`, transition:"width .8s" }} />
                  </div>
                  <div style={{ fontSize:12, color:"var(--muted)" }}>
                    {therapistState.pct>=70?"Condiciones óptimas para atender hoy":
                     therapistState.pct>=45?"Presta atención a tu energía durante el día":
                     "Considera ajustar tu agenda — tu bienestar primero"}
                  </div>
                </Card>
              )}

              {patients.length===0 ? (
                <div style={{ textAlign:"center", padding:"52px 0 32px" }}>
                  <div style={{ fontSize:44, marginBottom:14, opacity:0.25 }}>📅</div>
                  <div style={{ fontFamily:"var(--serif)", fontSize:22, fontWeight:300, marginBottom:8 }}>Sin sesiones hoy</div>
                  <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.7, marginBottom:28 }}>
                    Agrega tus pacientes para comenzar<br/>a organizar tu agenda
                  </div>
                  <button className="pr" onClick={()=>navTo("addPatient")} style={{
                    padding:"12px 26px", borderRadius:12, border:"none",
                    background:"linear-gradient(135deg,#6366f1,#818cf8)",
                    color:"white", fontSize:14, fontWeight:500, cursor:"pointer",
                    display:"inline-flex", alignItems:"center", gap:8 }}>
                    <Ic n="add" sz={15} c="white" /> Agregar primer paciente
                  </button>
                </div>
              ) : (
                <>
                  {/* Carga del día */}
                  <Card>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                      <div>
                        <Label>Carga emocional de pacientes</Label>
                        <div style={{ fontFamily:"var(--serif)", fontSize:36, fontWeight:300, color:loadColor, lineHeight:1 }}>{loadPct}%</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <Label>Sesiones hoy</Label>
                        <div style={{ fontFamily:"var(--serif)", fontSize:36, fontWeight:300, color:"var(--text)", lineHeight:1 }}>{patients.length}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:3, marginBottom:10 }}>
                      {patients.map(p=>(
                        <div key={p.id} style={{ flex:1, height:5, borderRadius:3,
                          background:intensityCfg(p.intensity).color, opacity:.65 }} />
                      ))}
                    </div>
                    <div style={{ fontSize:12, color:"var(--muted)" }}>
                      {optimized?"✓ Agenda optimizada · distribución balanceada":
                       hasConsec?"⚠ Sesiones de alta carga seguidas · considera optimizar":
                       "Distribución dentro de rango aceptable"}
                    </div>
                  </Card>

                  {/* Alerta día duro */}
                  {therapistState?.pct < 45 && patients.filter(p=>p.intensity>=4).length>0 && (
                    <div className="su" style={{ background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.18)",
                      borderRadius:14, padding:"13px 16px", marginBottom:10,
                      display:"flex", gap:10, alignItems:"flex-start" }}>
                      <Ic n="warn" sz={18} c="#f87171" />
                      <div>
                        <div style={{ fontSize:13, color:"#fca5a5", fontWeight:500, marginBottom:3 }}>Combinación de riesgo</div>
                        <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>
                          Tu estado de hoy es bajo y tienes {patients.filter(p=>p.intensity>=4).length} sesiones de alta carga. Considera reorganizar tu agenda.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lista pacientes */}
                  <Label>Pacientes del día</Label>
                  {patients.map((p,i) => {
                    const cfg = intensityCfg(p.intensity);
                    return (
                      <div key={p.id} className="row" onClick={()=>setSelected(p)} style={{
                        display:"flex", gap:12, marginBottom:6, cursor:"pointer",
                        padding:"13px 14px", borderRadius:16,
                        background:"var(--s1)", border:"1px solid var(--border)", alignItems:"center",
                        animation:`su ${.1+i*.05}s cubic-bezier(.16,1,.3,1) both` }}>
                        <div style={{ fontSize:11, color:"var(--muted)", width:36, flexShrink:0, fontVariantNumeric:"tabular-nums" }}>{p.time}</div>
                        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
                          background:`${p.color}18`, border:`1.5px solid ${p.color}35`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:12, color:p.color, fontWeight:600 }}>{p.initials}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:15, fontFamily:"var(--serif)", marginBottom:2 }}>
                            {p.name}
                            {p.sesionNum>1 && <span style={{ fontSize:11, color:"var(--muted)", marginLeft:6 }}>#{p.sesionNum}</span>}
                          </div>
                          <div style={{ fontSize:12, color:"var(--muted)", display:"flex", gap:5, alignItems:"center" }}>
                            <span>{dxIcon(p.diagnosis)}</span>
                            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.diagnosis}</span>
                          </div>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5 }}>
                          <div style={{ fontSize:11, padding:"2px 8px", borderRadius:8,
                            background:cfg.dim, color:cfg.color, border:`1px solid ${cfg.border}`, fontWeight:500 }}>
                            {cfg.label}
                          </div>
                          {p.postNota && <div style={{ fontSize:10, color:"#4ade80" }}>✓ Nota</div>}
                        </div>
                      </div>
                    );
                  })}

                  {optimized && (
                    <div style={{ marginTop:10, padding:"11px 14px", borderRadius:12,
                      background:"rgba(74,222,128,0.07)", border:"1px solid rgba(74,222,128,0.18)",
                      fontSize:12, color:"#4ade80", display:"flex", gap:8, alignItems:"center" }}>
                      <Ic n="chk" sz={13} c="#4ade80" /> Agenda reorganizada · distribución óptima aplicada
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══ DETALLE PACIENTE ══ */}
          {view==="dashboard" && selected && (
            <div className="fi">
              <div style={{ textAlign:"center", marginBottom:22 }}>
                <div style={{ width:68, height:68, borderRadius:18, margin:"0 auto 12px",
                  background:`${selected.color}18`, border:`2px solid ${selected.color}35`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:22, color:selected.color, fontWeight:600 }}>{selected.initials}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginBottom:2 }}>
                  {selected.time} · {selected.duration} min
                  {selected.sesionNum>1 && <span> · Sesión #{selected.sesionNum}</span>}
                </div>
              </div>

              <Card><Label>Diagnóstico</Label><div style={{ fontSize:16, fontFamily:"var(--serif)" }}>{dxIcon(selected.diagnosis)} {selected.diagnosis}</div></Card>
              {selected.enfoque && <Card><Label>Enfoque terapéutico</Label><div style={{ fontSize:15, fontFamily:"var(--serif)" }}>{selected.enfoque}</div></Card>}
              <Card><Label>Foco de la sesión</Label><div style={{ fontSize:15, fontFamily:"var(--serif)" }}>{selected.focus}</div></Card>

              {/* Intensidad */}
              <Card>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div>
                    <Label>Intensidad emocional del caso</Label>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:-4, marginBottom:6 }}>
                      Carga que representa este paciente para el terapeuta
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:intensityCfg(selected.intensity).color, fontWeight:500, flexShrink:0 }}>
                    {selected.intensity}/5
                  </div>
                </div>
                <div style={{ display:"flex", gap:5 }}>
                  {[1,2,3,4,5].map(n=>(
                    <div key={n} style={{ flex:1, height:8, borderRadius:4,
                      background:n<=selected.intensity?intensityCfg(selected.intensity).color:"var(--s3)" }} />
                  ))}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11, color:"var(--muted2)" }}>
                  <span>Menor desgaste</span><span>Mayor desgaste</span>
                </div>
              </Card>

              {/* Recomendación */}
              <div style={{ padding:"13px 16px", borderRadius:14, marginBottom:12,
                background:"rgba(129,140,248,0.08)", border:"1px solid rgba(129,140,248,0.18)",
                fontSize:13, color:"#a5b4fc", lineHeight:1.6 }}>
                💡 {selected.intensity>=4
                  ? "Sesión de alta carga — reserva al menos 15 min de recuperación antes de la siguiente."
                  : selected.intensity===3
                  ? "Intensidad moderada — 10 min de pausa recomendados entre sesiones."
                  : "Sesión de baja carga — ideal para intercalar con casos más intensos."}
              </div>

              {/* Acciones */}
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <button onClick={()=>setShowPausa(selected)} style={{ flex:1, padding:"12px", borderRadius:12,
                  background:"rgba(129,140,248,0.1)", border:"1px solid rgba(129,140,248,0.25)",
                  color:"var(--accent)", cursor:"pointer", fontSize:13, fontWeight:500,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <Ic n="pause" sz={15} c="#818cf8" /> Pausa
                </button>
                <button onClick={()=>setShowNota(selected)} style={{ flex:1, padding:"12px", borderRadius:12,
                  background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.2)",
                  color:"#4ade80", cursor:"pointer", fontSize:13, fontWeight:500,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <Ic n="note" sz={15} c="#4ade80" /> Nota
                </button>
              </div>

              {selected.postNota && (
                <Card style={{ marginBottom:10 }}>
                  <Label>Nota post-sesión</Label>
                  <div style={{ fontSize:13, color:"var(--text)", marginBottom:6 }}>
                    Estado tuyo: <span style={{ color:"#4ade80" }}>
                      {["","Agotado/a","Cansado/a","Regular","Bien","Muy bien"][selected.postNota.estado]}
                    </span>
                  </div>
                  {selected.postNota.nota && <div style={{ fontSize:13, color:"var(--muted)", fontStyle:"italic" }}>"{selected.postNota.nota}"</div>}
                </Card>
              )}

              <button className="db" onClick={()=>setConfirmDel(selected.id)} style={{
                width:"100%", padding:"13px", borderRadius:13, border:"1px solid var(--border)",
                background:"none", color:"var(--muted)", fontSize:14, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <Ic n="trash" sz={15} c="currentColor" /> Eliminar de la agenda
              </button>
            </div>
          )}

          {/* ══ OPTIMIZAR ══ */}
          {view==="optimize" && (
            <div className="fi">
              {patients.length<2 ? (
                <div style={{ textAlign:"center", padding:"60px 0" }}>
                  <div style={{ fontSize:44, marginBottom:14, opacity:0.25 }}>🧩</div>
                  <div style={{ fontFamily:"var(--serif)", fontSize:22, fontWeight:300, marginBottom:8 }}>
                    Necesitas al menos 2 pacientes
                  </div>
                  <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>
                    Agrega más sesiones para que<br/>el algoritmo pueda actuar.
                  </div>
                </div>
              ) : (
                <>
                  <Card>
                    <Label>Factores de optimización</Label>
                    {[
                      ["🌡","Carga emocional acumulada","Máximo 2 sesiones de alta intensidad seguidas"],
                      ["🧩","Tipo de diagnóstico","Diagnósticos similares agrupados estratégicamente"],
                      ["⏱","Buffers de recuperación","Espacio entre casos de alta carga"],
                      ["🌅","Ritmo circadiano","Casos complejos en tu horario de mayor energía"],
                      ["🧠","Estado del terapeuta","Tu check-in inicial ajusta el umbral de carga"],
                      ["📊","Historial de sesiones","Pacientes con más sesiones tienen peso en el orden"],
                    ].map(([ic,tt,dd])=>(
                      <div key={tt} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"flex-start" }}>
                        <span style={{ fontSize:19, flexShrink:0 }}>{ic}</span>
                        <div>
                          <div style={{ fontSize:13, color:"var(--text)", fontWeight:500, marginBottom:2 }}>{tt}</div>
                          <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>{dd}</div>
                        </div>
                      </div>
                    ))}
                  </Card>

                  {/* Preview */}
                  <Label>Orden actual → Sugerido</Label>
                  {patients.map((p,i)=>{
                    const op = optimizar(patients)[i];
                    const changed = p.id!==op.id;
                    return (
                      <div key={i} style={{ display:"flex", gap:8, marginBottom:5, alignItems:"center", fontSize:12 }}>
                        <div style={{ flex:1, padding:"8px 11px", borderRadius:10,
                          background:"var(--s1)", color:changed?"var(--muted)":"var(--text)",
                          border:"1px solid var(--border)" }}>
                          {p.time} · {p.initials} · {p.diagnosis.split(" ")[0]}
                        </div>
                        <span style={{ color:"var(--muted2)", fontSize:16 }}>→</span>
                        <div style={{ flex:1, padding:"8px 11px", borderRadius:10,
                          background:changed?"rgba(129,140,248,0.12)":"var(--s1)",
                          color:changed?"var(--accent)":"var(--text)",
                          border:changed?"1px solid rgba(129,140,248,0.3)":"1px solid var(--border)",
                          fontWeight:changed?500:400 }}>
                          {op.time} · {op.initials} · {op.diagnosis.split(" ")[0]}
                        </div>
                      </div>
                    );
                  })}

                  {/* Si día sigue cargado */}
                  {loadPct>70 && (
                    <div style={{ marginTop:14, padding:"13px 16px", borderRadius:13,
                      background:"rgba(251,146,60,0.08)", border:"1px solid rgba(251,146,60,0.2)",
                      fontSize:13, color:"#fdba74", lineHeight:1.6 }}>
                      <div style={{ fontWeight:500, marginBottom:6 }}>⚠ El día sigue siendo de alta carga</div>
                      <div style={{ fontSize:12, color:"var(--muted)" }}>
                        Aunque se optimice el orden, la carga total es alta. Considera:<br/>
                        · Extender las pausas entre sesiones intensas a 20 min<br/>
                        · Mover alguna sesión no urgente a otro día<br/>
                        · Finalizar antes de las 18:00 si es posible
                      </div>
                    </div>
                  )}

                  <button className="pr" onClick={doOptimize} disabled={optimizing||optimized} style={{
                    width:"100%", padding:15, borderRadius:14, border:"none", marginTop:16,
                    background:optimized?"rgba(74,222,128,0.12)":"linear-gradient(135deg,#6366f1,#818cf8)",
                    color:optimized?"#4ade80":"white", fontSize:15, fontWeight:500,
                    cursor:optimizing||optimized?"default":"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    {optimizing?<><div style={{ width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Analizando...</>
                     :optimized?<><Ic n="chk" sz={15} c="#4ade80"/>Agenda optimizada</>
                     :"Optimizar mi agenda"}
                  </button>

                  {optimizing && (
                    <div style={{ marginTop:14, fontSize:12, color:"var(--muted)", textAlign:"center" }}>
                      <div style={{ marginBottom:8 }}>Evaluando combinaciones de menor carga...</div>
                      <div style={{ height:3, background:"var(--s2)", borderRadius:2, overflow:"hidden" }}>
                        <div style={{ height:"100%", background:"linear-gradient(90deg,#6366f1,#818cf8)",
                          borderRadius:2, animation:"pb 2.6s ease forwards" }} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══ AGREGAR PACIENTE ══ */}
          {view==="addPatient" && (
            <div className="fi">
              {addSuccess ? (
                <div style={{ textAlign:"center", padding:"80px 0" }}>
                  <div style={{ width:70, height:70, borderRadius:"50%", margin:"0 auto 18px",
                    background:"rgba(74,222,128,0.15)", border:"2px solid rgba(74,222,128,0.3)",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Ic n="chk" sz={30} c="#4ade80" />
                  </div>
                  <div style={{ fontFamily:"var(--serif)", fontSize:24, fontWeight:300, marginBottom:6 }}>Paciente agregado</div>
                  <div style={{ fontSize:13, color:"var(--muted)" }}>Volviendo a la agenda...</div>
                </div>
              ) : (
                <>
                  {/* Nombre/etiqueta */}
                  <div style={{ marginBottom:16 }}>
                    <Label>Nombre o etiqueta</Label>
                    <input style={{ width:"100%", padding:"13px 16px", borderRadius:12, background:"var(--s2)",
                      border:"1px solid var(--border2)", color:"var(--text)", fontSize:15 }}
                      type="text" placeholder="Ej. María G. o Etiqueta Azul"
                      value={addForm.name}
                      onChange={e=>{ setAddForm({...addForm,name:e.target.value}); setFormErr(""); }} />
                    <div style={{ fontSize:11, color:"var(--muted)", marginTop:5 }}>
                      Usa etiquetas en vez de nombres reales para proteger la identidad del paciente
                    </div>
                  </div>

                  {/* Foco */}
                  <div style={{ marginBottom:16 }}>
                    <Label>Foco de trabajo en sesión</Label>
                    <input style={{ width:"100%", padding:"13px 16px", borderRadius:12, background:"var(--s2)",
                      border:"1px solid var(--border2)", color:"var(--text)", fontSize:15 }}
                      type="text" placeholder="Ej. Reestructuración cognitiva de creencias"
                      value={addForm.focus}
                      onChange={e=>{ setAddForm({...addForm,focus:e.target.value}); setFormErr(""); }} />
                  </div>

                  {/* Número de sesión */}
                  <div style={{ marginBottom:16 }}>
                    <Label>Número de sesión con este paciente</Label>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                        <button key={n} className="tag" onClick={()=>setAddForm({...addForm,sesionNum:n})} style={{
                          width:44, height:40, borderRadius:10, border:"none", cursor:"pointer", fontSize:14,
                          background:addForm.sesionNum===n?"rgba(129,140,248,0.2)":"var(--s2)",
                          color:addForm.sesionNum===n?"var(--accent)":"var(--muted)",
                          border:addForm.sesionNum===n?"1px solid rgba(129,140,248,0.35)":"1px solid var(--border)",
                          fontFamily:"var(--sans)" }}>{n}</button>
                      ))}
                      <button className="tag" onClick={()=>setAddForm({...addForm,sesionNum:11})} style={{
                        padding:"8px 14px", height:40, borderRadius:10, border:"none", cursor:"pointer", fontSize:13,
                        background:addForm.sesionNum>10?"rgba(129,140,248,0.2)":"var(--s2)",
                        color:addForm.sesionNum>10?"var(--accent)":"var(--muted)",
                        border:addForm.sesionNum>10?"1px solid rgba(129,140,248,0.35)":"1px solid var(--border)",
                        fontFamily:"var(--sans)" }}>+10</button>
                    </div>
                  </div>

                  {/* Hora */}
                  <div style={{ marginBottom:16 }}>
                    <Label>Hora de sesión</Label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {TIMES.map(t=>(
                        <button key={t} className="tag" onClick={()=>setAddForm({...addForm,time:t})} style={{
                          padding:"6px 10px", borderRadius:9, border:"none", cursor:"pointer", fontSize:12,
                          background:addForm.time===t?"rgba(129,140,248,0.2)":"var(--s2)",
                          color:addForm.time===t?"var(--accent)":"var(--muted)",
                          border:addForm.time===t?"1px solid rgba(129,140,248,0.35)":"1px solid var(--border)",
                          fontFamily:"var(--sans)" }}>{t}</button>
                      ))}
                    </div>
                  </div>

                  {/* Diagnóstico */}
                  <div style={{ marginBottom:16 }}>
                    <Label>Diagnóstico o motivo de consulta</Label>
                    <div style={{ fontSize:11, color:"var(--muted)", marginBottom:8 }}>
                      Basado en clasificaciones DSM-5 / CIE-11 y motivos frecuentes en consulta privada
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {DIAGNOSTICOS.map(d=>(
                        <button key={d} className="tag" onClick={()=>setAddForm({...addForm,diagnosis:d})} style={{
                          padding:"7px 13px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12,
                          background:addForm.diagnosis===d?"rgba(129,140,248,0.2)":"var(--s2)",
                          color:addForm.diagnosis===d?"var(--accent)":"var(--muted)",
                          border:addForm.diagnosis===d?"1px solid rgba(129,140,248,0.35)":"1px solid var(--border)",
                          fontFamily:"var(--sans)" }}>{dxIcon(d)} {d}</button>
                      ))}
                    </div>
                  </div>

                  {/* Enfoque terapéutico */}
                  <div style={{ marginBottom:16 }}>
                    <Label>Enfoque terapéutico (opcional)</Label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {ENFOQUES.map(e=>(
                        <button key={e} className="tag" onClick={()=>setAddForm({...addForm,enfoque:addForm.enfoque===e?"":e})} style={{
                          padding:"7px 13px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12,
                          background:addForm.enfoque===e?"rgba(129,140,248,0.2)":"var(--s2)",
                          color:addForm.enfoque===e?"var(--accent)":"var(--muted)",
                          border:addForm.enfoque===e?"1px solid rgba(129,140,248,0.35)":"1px solid var(--border)",
                          fontFamily:"var(--sans)" }}>{e}</button>
                      ))}
                    </div>
                  </div>

                  {/* Intensidad */}
                  <div style={{ marginBottom:24 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <Label>Intensidad emocional del caso</Label>
                      <span style={{ fontSize:13, color:intensityCfg(addForm.intensity).color, fontWeight:500 }}>
                        {addForm.intensity}/5 · {intensityCfg(addForm.intensity).label}
                      </span>
                    </div>
                    <div style={{ fontSize:11, color:"var(--muted)", marginBottom:10 }}>
                      ¿Cuánto desgaste emocional representa este caso para ti como terapeuta?
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {[1,2,3,4,5].map(n=>(
                        <button key={n} onClick={()=>setAddForm({...addForm,intensity:n})} style={{
                          flex:1, height:42, borderRadius:10, border:"none", cursor:"pointer",
                          background:n<=addForm.intensity?intensityCfg(addForm.intensity).color:"var(--s2)",
                          transition:"all .2s" }} />
                      ))}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11, color:"var(--muted2)" }}>
                      <span>Menor desgaste</span><span>Mayor desgaste</span>
                    </div>
                  </div>

                  {formErr && <div className="su" style={{ marginBottom:14, padding:"10px 14px", borderRadius:10,
                    background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)",
                    fontSize:13, color:"#fca5a5" }}>{formErr}</div>}

                  <button className="pr" onClick={doAdd} style={{ width:"100%", padding:15, borderRadius:14,
                    border:"none", background:"linear-gradient(135deg,#6366f1,#818cf8)",
                    color:"white", fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"var(--sans)" }}>
                    Agregar paciente
                  </button>
                </>
              )}
            </div>
          )}

          {/* ══ RESUMEN DEL DÍA ══ */}
          {view==="resumen" && (
            <div className="fi">
              {patients.length===0 ? (
                <div style={{ textAlign:"center", padding:"60px 0" }}>
                  <div style={{ fontSize:44, marginBottom:14, opacity:0.25 }}>📊</div>
                  <div style={{ fontFamily:"var(--serif)", fontSize:22, fontWeight:300, marginBottom:8 }}>Sin datos aún</div>
                  <div style={{ fontSize:13, color:"var(--muted)" }}>Agrega pacientes para ver el resumen del día</div>
                </div>
              ) : (
                <>
                  {/* Métricas */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                    {[
                      ["Sesiones totales", patients.length, "var(--accent)"],
                      ["Carga promedio", `${avgLoad}/5`, loadColor],
                      ["Alta intensidad", highCount, highCount>0?"#f87171":"#4ade80"],
                      ["Notas registradas", notas.length, "#4ade80"],
                    ].map(([label,val,color])=>(
                      <Card key={label} style={{ textAlign:"center", marginBottom:0 }}>
                        <div style={{ fontSize:10, color:"var(--muted)", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>{label}</div>
                        <div style={{ fontFamily:"var(--serif)", fontSize:32, fontWeight:300, color }}>{val}</div>
                      </Card>
                    ))}
                  </div>

                  {/* Por diagnóstico */}
                  <Card>
                    <Label>Distribución por diagnóstico</Label>
                    {topDx.map(([dx, count])=>(
                      <div key={dx} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                        <div style={{ fontSize:16, flexShrink:0 }}>{dxIcon(dx)}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                            <span style={{ fontSize:13 }}>{dx}</span>
                            <span style={{ fontSize:13, color:"var(--muted)" }}>{count} {count===1?"sesión":"sesiones"}</span>
                          </div>
                          <div style={{ background:"var(--s3)", borderRadius:3, height:4, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${(count/patients.length)*100}%`,
                              background:"var(--accent)", borderRadius:3, opacity:.7 }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card>

                  {/* Notas de cierre */}
                  {notas.length>0 && (
                    <Card>
                      <Label>Tus notas post-sesión</Label>
                      {notas.map((n,i)=>{
                        const p = patients.find(p=>p.id===n.pacienteId);
                        return (
                          <div key={i} style={{ marginBottom:12, paddingBottom:12,
                            borderBottom: i<notas.length-1?"1px solid var(--border)":"none" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                              <span style={{ fontSize:13, fontFamily:"var(--serif)" }}>{p?.name||"Paciente"}</span>
                              <span style={{ fontSize:12, color:["","#e879f9","#f87171","#fb923c","#a3e635","#4ade80"][n.estado] }}>
                                {["","Agotado/a","Cansado/a","Regular","Bien","Muy bien"][n.estado]}
                              </span>
                            </div>
                            {n.nota && <div style={{ fontSize:12, color:"var(--muted)", fontStyle:"italic" }}>"{n.nota}"</div>}
                          </div>
                        );
                      })}
                    </Card>
                  )}

                  {/* Recomendación final */}
                  <div style={{ padding:"14px 16px", borderRadius:14,
                    background:"rgba(129,140,248,0.08)", border:"1px solid rgba(129,140,248,0.18)",
                    fontSize:13, color:"#a5b4fc", lineHeight:1.7 }}>
                    <div style={{ fontWeight:500, marginBottom:6 }}>💜 Resumen de tu día</div>
                    {loadPct>70
                      ? "Fue un día de alta carga. Prioriza tu recuperación esta noche: desconexión temprana, actividad física suave o tiempo personal."
                      : loadPct>45
                      ? "Día de carga moderada. Dedica un momento al cierre emocional antes de tu próximo día de trabajo."
                      : "Día de carga baja. Bien gestionado. Mantén este ritmo como referencia para semanas exigentes."}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <BottomNav view={view} setView={navTo} onLogout={()=>setPhase("login")} />
      </div>
    </>
  );
}