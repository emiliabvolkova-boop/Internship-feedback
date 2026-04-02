import { useState, useEffect, useMemo, useCallback } from "react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzbQaPgJ1yEOuYyBgJbiqO8MGUtcY7B3_Tm-_Vm4wLl-bLOmH2cr63Rwk_P6v3m2GM/exec";
const MILESTONES = ["1 month", "3 months", "6 months"];

const INTERN_CORE = [
  { id: "tasks", label: "How well are you able to complete your assigned tasks?", low: "I struggle a lot and need frequent help", high: "I complete tasks mostly independently" },
  { id: "product", label: "How well do you understand the product context?", low: "I still lack product context", high: "I understand what the product does and why it matters" },
  { id: "workflow", label: "How well do you understand the team's workflow and tools?", low: "I'm still figuring out how things work", high: "I understand the workflow and follow it consistently" },
  { id: "communication", label: "How easy is it for you to communicate with the team?", low: "I find it hard to express my thoughts", high: "I communicate comfortably and participate in discussions" },
  { id: "support", label: "How supported do you feel by your manager and team?", low: "I don't feel supported", high: "I feel well supported" },
  { id: "enjoyment", label: "How much do you enjoy the work you are doing?", low: "I find the work uninteresting or frustrating", high: "I enjoy the work — challenging but interesting" },
  { id: "progress", label: "How would you rate your overall progress so far?", low: "I feel I'm falling behind", high: "I feel I'm progressing well for this stage" },
];
const INTERN_MILESTONES = {
  "1 month": { scales: [{ id: "expectations", label: "How clear are you on what is expected of you?", low: "I'm not sure what I should focus on", high: "I understand what I need to do" }, { id: "tools_access", label: "Do you have the access, tools, and information you need?", low: "I'm missing key access or tools", high: "I have what I need to work effectively" }], open: [{ id: "going_well", label: "What's going well right now?" }, { id: "improve", label: "What would help you improve most?" }, { id: "onboarding", label: "What would you improve in onboarding?" }, { id: "other", label: "Anything else you'd like to share?" }] },
  "3 months": { scales: [{ id: "independence", label: "How independent are you at this stage?", low: "I still need step-by-step guidance", high: "I can own tasks end-to-end" }, { id: "feedback_apply", label: "How well are you able to apply feedback?", low: "I find it hard to apply feedback", high: "I apply feedback and it improves my work" }], open: [{ id: "going_well_3", label: "What's going well right now?" }, { id: "improve_3", label: "What would help you improve most?" }, { id: "other_3", label: "Anything else you'd like to share?" }] },
  "6 months": { scales: [{ id: "impact", label: "How clear is the impact you have delivered?", low: "I'm not sure what my main results are", high: "I can clearly point to my main results" }, { id: "priorities", label: "How clear are your next priorities for growth?", low: "I'm not sure what to focus on next", high: "I know what to focus on next and why" }], open: [{ id: "went_well", label: "What went well during the internship?" }, { id: "learn_next", label: "What would you like to improve or learn next?" }, { id: "other_6", label: "Anything else you'd like to share?" }] },
};
const MGR_CORE = [
  { id: "tasks", label: "How well is the intern able to complete their assigned tasks?", low: "Struggles a lot; tasks often need rework", high: "Completes tasks mostly independently" },
  { id: "product", label: "How well does the intern understand the product context?", low: "Still lacks product context", high: "Understands the product well" },
  { id: "workflow", label: "How well does the intern understand the team's workflow?", low: "Still figuring out how things work", high: "Follows the workflow consistently" },
  { id: "communication", label: "How effectively does the intern communicate?", low: "Unclear or inconsistent", high: "Clear and proactive" },
  { id: "feedback_seeking", label: "How proactively does the intern seek support?", low: "Rarely asks for help", high: "Proactively seeks help and uses it well" },
  { id: "overall", label: "Overall performance rating", low: "Very poor", high: "Excellent" },
];
const MGR_MILESTONES = {
  "1 month": { scales: [{ id: "growth", label: "How well is the intern taking advantage of growth opportunities?", low: "Rarely uses learning opportunities", high: "Actively uses them; shows fast improvement" }, { id: "questions", label: "How effective are the intern's questions?", low: "Rare or unfocused", high: "Timely, specific, move work forward" }], open: [{ id: "going_well", label: "What's going well right now?" }, { id: "improve", label: "What would help the intern improve most?" }, { id: "commits", label: "Link to commits:", placeholder: "Paste link here..." }] },
  "3 months": { scales: [{ id: "independence", label: "How independently can the intern deliver tasks?", low: "Needs step-by-step guidance", high: "Can own tasks end-to-end" }, { id: "reliability", label: "How reliable is the intern's output?", low: "Unreliable; frequent rework", high: "Reliable; solid quality" }], open: [{ id: "going_well_3", label: "What's going well right now?" }, { id: "improve_3", label: "What would help the intern improve most?" }, { id: "commits_3", label: "Link to commits:", placeholder: "Paste link here..." }] },
  "6 months": { scales: [{ id: "impact", label: "How clear is the intern's impact so far?", low: "Hard to point to clear contributions", high: "Clear contributions and results" }, { id: "readiness", label: "How ready is the intern for the next step?", low: "Not ready yet", high: "Ready with standard onboarding" }], open: [{ id: "went_well", label: "What went well during the internship?" }, { id: "focus_grow", label: "What should the intern focus on to grow?" }, { id: "commits_6", label: "Link to commits:", placeholder: "Paste link here..." }] },
};

/* ── Hardcoded registry from Excel (initial data) ── */
const INITIAL_REGISTRY = [
  { name: "Tamar Zerekidze", team: "ELS team", startDate: "2025-10-15", endDate: "2026-04-15", result: "In progress", manager: "Ali Rustamov", feedbackStage: "6 months" },
  { name: "Giorgi Lasareshvili", team: "ELS team", startDate: "2025-10-20", endDate: "2026-04-20", result: "In progress", manager: "Ali Rustamov", feedbackStage: "6 months" },
  { name: "Eray Cepni", team: "KC", startDate: "2025-10-23", endDate: "2026-04-23", result: "In progress", manager: "Otar Magaladze", feedbackStage: "6 months" },
  { name: "Vahagn Ghazaryan", team: "KC", startDate: "2025-10-23", endDate: "2026-04-23", result: "Not successful", manager: "Otar Magaladze", feedbackStage: "6 months" },
  { name: "Volodymyr Azarov", team: "KC", startDate: "2025-10-23", endDate: "2026-04-23", result: "In progress", manager: "Otar Magaladze", feedbackStage: "6 months" },
  { name: "David Sargsyan", team: "ELS team", startDate: "2025-10-27", endDate: "2026-04-27", result: "In progress", manager: "Dmitriy Popov", feedbackStage: "6 months" },
  { name: "Konstantine Bitsadze", team: "KC", startDate: "2025-11-03", endDate: "2026-05-03", result: "In progress", manager: "Otar Magaladze", feedbackStage: "6 months" },
  { name: "Blazo Markovic", team: "ELS team", startDate: "2025-11-26", endDate: "2026-05-26", result: "In progress", manager: "Dmitriy Popov", feedbackStage: "6 months" },
  { name: "Saba Ekhvaia", team: "KC", startDate: "2025-12-10", endDate: "2026-06-10", result: "In progress", manager: "Otar Magaladze", feedbackStage: "6 months" },
  { name: "Nadezhda Filina", team: "ELS team", startDate: "2025-12-22", endDate: "2026-06-22", result: "In progress", manager: "Sofia Boldyreva", feedbackStage: "6 months" },
  { name: "Arseniy Zolotarev", team: "ELS team", startDate: "2025-09-29", endDate: "2026-03-29", result: "Successful", manager: "Dmitriy Popov", feedbackStage: "6 months" },
  { name: "Andrei Zinoviev", team: "Infra", startDate: "2026-01-21", endDate: "2026-07-21", result: "In progress", manager: "Valentin Leonov", feedbackStage: "3 months" },
  { name: "Dmitrii Pakhomov", team: "KC", startDate: "2026-03-01", endDate: "2026-09-01", result: "In progress", manager: "Vadim Panov", feedbackStage: "3 months" },
  { name: "Ioane Meparishvili", team: "", startDate: "2026-03-16", endDate: "", result: "In progress", manager: "", feedbackStage: "1 month" },
];

const TEAMS = ["ELS team", "KC", "Infra", "CLOS", "Build system team", "Cloud Image team", "RelEng"];
const RESULTS = ["In progress", "Successful", "Not successful", "Left the company"];

/* ── styles ── */
const card = { background: "var(--c-surface)", borderRadius: 16, padding: "32px 28px", border: "1px solid var(--c-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" };
const btnP = ok => ({ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: ok ? "var(--c-accent)" : "var(--c-border)", color: ok ? "#fff" : "var(--c-muted)", fontSize: 15, fontWeight: 600, cursor: ok ? "pointer" : "not-allowed", transition: "all 0.3s", fontFamily: "inherit" });
const btnBack = { flex: 1, padding: "14px", borderRadius: 12, border: "1.5px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" };
const inp = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text)", fontSize: 15, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" };
const focus = e => e.target.style.borderColor = "var(--c-accent)";
const blur = e => e.target.style.borderColor = "var(--c-border)";

/* ── components ── */
function Scale({ q, value, onChange }) {
  const [h, setH] = useState(null);
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 14, lineHeight: 1.5 }}>{q.label}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, justifyContent: "center" }}>
        {[1,2,3,4,5,6,7].map(n => {
          const s = value===n, hv = h===n, c = n<=2?"var(--c-low)":n<=5?"var(--c-mid)":"var(--c-high)";
          return <button key={n} onClick={()=>onChange(n)} onMouseEnter={()=>setH(n)} onMouseLeave={()=>setH(null)}
            style={{ width:48,height:48,borderRadius:12,border:s?`2px solid ${c}`:"1.5px solid var(--c-border)",background:s?c:hv?"var(--c-hover)":"var(--c-surface)",color:s?"#fff":"var(--c-text)",fontSize:16,fontWeight:600,cursor:"pointer",transition:"all 0.2s cubic-bezier(.4,0,.2,1)",transform:s?"scale(1.1)":hv?"scale(1.05)":"scale(1)",boxShadow:s?`0 4px 14px ${c}40`:"none",fontFamily:"inherit"}}>{n}</button>;
        })}
      </div>
      <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--c-muted)",padding:"0 4px" }}>
        <span style={{ maxWidth:"40%",lineHeight:1.4 }}>{q.low}</span>
        <span style={{ maxWidth:"40%",textAlign:"right",lineHeight:1.4 }}>{q.high}</span>
      </div>
    </div>
  );
}
function TxtIn({ q, value, onChange }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ fontSize:15,fontWeight:500,marginBottom:10,lineHeight:1.5 }}>{q.label}</div>
      <textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={q.placeholder||"Type your thoughts here..."} rows={q.placeholder?1:3}
        style={{ ...inp,resize:"vertical",lineHeight:1.6,fontSize:14 }} onFocus={focus} onBlur={blur} />
    </div>
  );
}
function Progress({ sections, current }) {
  return <div style={{ display:"flex",gap:6,marginBottom:32 }}>{sections.map((s,i) => <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6 }}><div style={{ height:4,width:"100%",borderRadius:2,background:i<current?"var(--c-accent)":i===current?"var(--c-accent-soft)":"var(--c-border)",transition:"background 0.4s" }}/><span style={{ fontSize:11,fontWeight:i===current?600:400,color:i<=current?"var(--c-accent)":"var(--c-muted)" }}>{s}</span></div>)}</div>;
}
function Field({label,children}){ return <div style={{marginBottom:24}}><label style={{fontSize:13,fontWeight:500,color:"var(--c-muted)",marginBottom:8,display:"block"}}>{label}</label>{children}</div>; }
function MSel({value,onChange}){ return <div style={{display:"flex",gap:10}}>{MILESTONES.map(m=><button key={m} onClick={()=>onChange(m)} style={{flex:1,padding:"14px 8px",borderRadius:12,border:value===m?"2px solid var(--c-accent)":"1.5px solid var(--c-border)",background:value===m?"var(--c-accent-soft)":"transparent",color:value===m?"var(--c-accent)":"var(--c-muted)",fontSize:14,fontWeight:500,cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit"}}>{m}</button>)}</div>; }
function Badge({val}){ const n=parseFloat(val),c=isNaN(n)?"var(--c-muted)":n>=6?"var(--c-high)":n>=4?"var(--c-mid)":"var(--c-low)"; return <span style={{display:"inline-block",minWidth:36,textAlign:"center",padding:"4px 10px",borderRadius:8,background:`${c}18`,color:c,fontSize:14,fontWeight:600}}>{val||"—"}</span>; }
function Bar({val,max=7}){ const n=parseFloat(val)||0,pct=n/max*100,c=n>=6?"var(--c-high)":n>=4?"var(--c-mid)":"var(--c-low)"; return <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}><div style={{flex:1,height:8,borderRadius:4,background:"var(--c-border)"}}><div style={{width:`${pct}%`,height:"100%",borderRadius:4,background:c,transition:"width 0.5s"}}/></div><span style={{fontSize:13,fontWeight:600,color:c,minWidth:24,textAlign:"right"}}>{n||"—"}</span></div>; }

function DualBar({ mgrVal, intVal, label }) {
  const m = parseFloat(mgrVal) || 0, i = parseFloat(intVal) || 0;
  const cM = m >= 6 ? "var(--c-high)" : m >= 4 ? "var(--c-mid)" : "var(--c-low)";
  const cI = i >= 6 ? "var(--c-high)" : i >= 4 ? "var(--c-mid)" : "var(--c-low)";
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--c-high)", width: 52, flexShrink: 0 }}>Manager</span>
        <div style={{ flex: 1, height: 7, borderRadius: 4, background: "var(--c-border)" }}>
          <div style={{ width: `${m / 7 * 100}%`, height: "100%", borderRadius: 4, background: cM, transition: "width 0.5s" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: cM, minWidth: 20, textAlign: "right" }}>{m || "—"}</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--c-accent)", width: 52, flexShrink: 0 }}>Intern</span>
        <div style={{ flex: 1, height: 7, borderRadius: 4, background: "var(--c-border)" }}>
          <div style={{ width: `${i / 7 * 100}%`, height: "100%", borderRadius: 4, background: cI, transition: "width 0.5s" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: cI, minWidth: 20, textAlign: "right" }}>{i || "—"}</span>
      </div>
    </div>
  );
}

/* ── Landing ── */
function Landing({onNav}) {
  const [pw,setPw]=useState(""), [show,setShow]=useState(false);
  const roles=[{id:"intern",icon:"🎓",title:"I'm an intern",desc:"Complete your self-assessment",color:"#6c63ff"},{id:"manager",icon:"👤",title:"I'm a manager",desc:"Assess your intern's progress",color:"#3bba6f"}];
  return (
    <div style={{maxWidth:480,margin:"0 auto",padding:"80px 20px",textAlign:"center"}}>
      <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#6c63ff,#4a43cc)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
      <h1 style={{fontSize:30,fontWeight:700,letterSpacing:"-0.02em",marginBottom:8}}>Internship Feedback</h1>
      <p style={{fontSize:15,color:"var(--c-muted)",marginBottom:40,lineHeight:1.6}}>Select your role to get started</p>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {roles.map(r=><button key={r.id} onClick={()=>onNav(r.id)} style={{...card,padding:"24px 28px",display:"flex",alignItems:"center",gap:18,cursor:"pointer",transition:"all 0.2s",textAlign:"left",border:"1.5px solid var(--c-border)"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=r.color;e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--c-border)";e.currentTarget.style.transform="translateY(0)";}}>
          <div style={{fontSize:28,width:52,height:52,borderRadius:14,background:`${r.color}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{r.icon}</div>
          <div><div style={{fontSize:17,fontWeight:600,marginBottom:4}}>{r.title}</div><div style={{fontSize:13,color:"var(--c-muted)"}}>{r.desc}</div></div>
          <svg style={{marginLeft:"auto",flexShrink:0,opacity:0.3}} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>)}
      </div>
      <div style={{marginTop:48}}>
        {!show ? <button onClick={()=>setShow(true)} style={{background:"none",border:"none",color:"var(--c-muted)",fontSize:13,cursor:"pointer",fontFamily:"inherit",opacity:0.6}}>Admin access</button>
        : <div style={{display:"flex",gap:8,maxWidth:300,margin:"0 auto"}}>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Enter admin password" onKeyDown={e=>e.key==="Enter"&&pw==="feedback2026"&&onNav("admin")} style={{...inp,fontSize:13,padding:"10px 14px"}} />
            <button onClick={()=>pw==="feedback2026"&&onNav("admin")} style={{padding:"10px 18px",borderRadius:12,border:"none",background:"var(--c-accent)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Go</button>
          </div>}
      </div>
    </div>
  );
}

/* ── Form ── */
function Form({type,onBack}) {
  const [step,setStep]=useState(0),[ms,setMs]=useState(null),[ans,setAns]=useState({}),[name,setName]=useState(""),[email,setEmail]=useState(""),[iName,setIName]=useState(""),[sending,setSending]=useState(false);
  const isMgr=type==="manager", coreQs=isMgr?MGR_CORE:INTERN_CORE, msQs=isMgr?MGR_MILESTONES:INTERN_MILESTONES;
  const msData=ms?msQs[ms]:null, coreOk=coreQs.every(q=>ans[q.id]), msOk=msData?.scales.every(q=>ans[q.id]);
  const introOk=isMgr?(name.trim()&&email.trim()&&iName.trim()&&ms):(name.trim()&&email.trim()&&ms);
  const set=(id,v)=>setAns(p=>({...p,[id]:v}));

  const submit=async()=>{
    setSending(true);
    const data={type,name:name.trim(),email:email.trim(),milestone:ms,...(isMgr&&{internName:iName.trim()}),answers:ans,submittedAt:new Date().toISOString()};
    try { await fetch(SCRIPT_URL,{method:"POST",body:JSON.stringify(data),mode:"no-cors"}); } catch(e){ console.log("submit err",e); }
    setTimeout(()=>{setSending(false);setStep(3);},800);
  };

  const secs=isMgr?["Info","Core",ms||"Milestone","Done"]:["Info","Core",ms||"Milestone","Done"];
  const badge=isMgr&&iName?<div style={{padding:"3px 10px",borderRadius:8,background:"var(--c-accent-soft)",color:"var(--c-accent)",fontSize:12,fontWeight:600}}>{iName}</div>:null;

  return (
    <div style={{maxWidth:640,margin:"0 auto",padding:"40px 20px"}}>
      <div style={{marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={step===0?onBack:undefined} style={{width:36,height:36,borderRadius:10,background:step===0?"var(--c-hover)":"linear-gradient(135deg,#6c63ff,#4a43cc)",display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:step===0?"pointer":"default"}}>
          {step===0?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-text)" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
        </button>
        <span style={{fontSize:13,fontWeight:500,color:"var(--c-muted)",letterSpacing:"0.05em",textTransform:"uppercase"}}>Internship feedback</span>
      </div>
      <h1 style={{fontSize:28,fontWeight:700,marginBottom:6,letterSpacing:"-0.02em"}}>{isMgr?"Manager assessment":"Intern self-assessment"}</h1>
      <p style={{fontSize:14,color:"var(--c-muted)",marginBottom:32,lineHeight:1.6}}>{isMgr?"Takes about 5 minutes. Helps prepare a feedback conversation.":"Takes about 5 minutes. Your answers help us improve your experience."}</p>
      <Progress sections={secs} current={step}/>
      <div style={{animation:"fadeUp 0.4s ease-out"}} key={step}>
        {step===0&&<div style={card}>
          <div style={{fontSize:17,fontWeight:600,marginBottom:20}}>Before we start</div>
          <Field label="Your name"><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name" style={inp} onFocus={focus} onBlur={blur}/></Field>
          <Field label="Your email"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@cloudlinux.com" style={inp} onFocus={focus} onBlur={blur}/></Field>
          {isMgr&&<Field label="Intern's name"><input type="text" value={iName} onChange={e=>setIName(e.target.value)} placeholder="Enter intern's full name" style={inp} onFocus={focus} onBlur={blur}/></Field>}
          <Field label="Internship milestone"><MSel value={ms} onChange={setMs}/></Field>
          <button onClick={()=>introOk&&setStep(1)} disabled={!introOk} style={btnP(introOk)}>Start feedback</button>
        </div>}
        {step===1&&<div style={card}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{fontSize:17,fontWeight:600}}>Core questions</div>{badge}</div>
          <div style={{fontSize:13,color:"var(--c-muted)",marginBottom:28}}>These help us spot what's working well and any blockers.</div>
          {coreQs.map(q=><Scale key={q.id} q={q} value={ans[q.id]} onChange={v=>set(q.id,v)}/>)}
          <div style={{display:"flex",gap:12}}><button onClick={()=>setStep(0)} style={btnBack}>Back</button><button onClick={()=>coreOk&&setStep(2)} disabled={!coreOk} style={{...btnP(coreOk),flex:2}}>Continue</button></div>
        </div>}
        {step===2&&msData&&<div style={card}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}><div style={{padding:"4px 12px",borderRadius:8,background:"var(--c-accent-soft)",color:"var(--c-accent)",fontSize:12,fontWeight:600}}>{ms} milestone</div>{badge}</div>
          <div style={{fontSize:17,fontWeight:600,marginBottom:28}}>Milestone-specific questions</div>
          {msData.scales.map(q=><Scale key={q.id} q={q} value={ans[q.id]} onChange={v=>set(q.id,v)}/>)}
          <div style={{height:1,background:"var(--c-border)",margin:"12px 0 28px"}}/>
          {msData.open.map(q=><TxtIn key={q.id} q={q} value={ans[q.id]} onChange={v=>set(q.id,v)}/>)}
          <div style={{display:"flex",gap:12}}><button onClick={()=>setStep(1)} style={btnBack}>Back</button>
          <button onClick={()=>msOk&&submit()} disabled={!msOk||sending} style={{...btnP(msOk),flex:2,background:msOk?"var(--c-high)":"var(--c-border)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {sending&&<div style={{width:16,height:16,border:"2px solid #fff4",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.6s linear infinite"}}/>}{sending?"Submitting...":"Submit feedback"}</button></div>
        </div>}
        {step===3&&<div style={card}><div style={{textAlign:"center",padding:"60px 20px"}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:"var(--c-high)",margin:"0 auto 24px",display:"flex",alignItems:"center",justifyContent:"center",animation:"popIn 0.5s cubic-bezier(.175,.885,.32,1.275)"}}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div style={{fontSize:22,fontWeight:600,marginBottom:8}}>Thank you!</div>
          <div style={{fontSize:15,color:"var(--c-muted)",lineHeight:1.6,maxWidth:360,margin:"0 auto 28px"}}>Your feedback has been submitted successfully.</div>
          <button onClick={onBack} style={{...btnP(true),maxWidth:200,margin:"0 auto"}}>Back to home</button>
        </div></div>}
      </div>
      <div style={{textAlign:"center",marginTop:32,fontSize:12,color:"var(--c-muted)",opacity:0.5}}>CloudLinux Internship Program — 2026</div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ ...card, padding: 20, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 10, right: 12, fontSize: 20, opacity: 0.15 }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color, marginBottom: 4, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--c-muted)", lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}

/* ── Admin ── */
function Admin({ onBack }) {
  const [tab, setTab] = useState("dashboard");
  const [sel, setSel] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [registry, setRegistry] = useState(() => {
    try { const s = localStorage.getItem("cl_intern_registry"); return s ? JSON.parse(s) : INITIAL_REGISTRY; } catch { return INITIAL_REGISTRY; }
  });
  const [editingIntern, setEditingIntern] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterResult, setFilterResult] = useState("all");

  // Persist registry
  useEffect(() => { try { localStorage.setItem("cl_intern_registry", JSON.stringify(registry)); } catch {} }, [registry]);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(SCRIPT_URL);
      const j = await r.json();
      setData(j);
    } catch (e) { setErr("Could not load data. The Google Sheet might require CloudLinux login."); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const intern = data?.["Intern Responses"] || [];
  const mgr = data?.["Manager Responses"] || [];
  const all = [...intern.map(r => ({ ...r, _type: "intern" })), ...mgr.map(r => ({ ...r, _type: "manager" }))];

  const scoreKeysIntern = ["Tasks", "Product", "Workflow", "Communication", "Support", "Enjoyment", "Progress"];
  const scoreKeysMgr = ["Tasks", "Product", "Workflow", "Communication", "Feedback Seeking", "Overall"];
  const commonKeys = ["Tasks", "Product", "Workflow", "Communication"];
  const getNum = v => { const n = parseFloat(v); return isNaN(n) ? null : n; };

  // Group by intern name — supports multiple milestones
  const internMap = useMemo(() => {
    const m = {};
    intern.forEach(r => {
      const n = r.Name || r["Intern Name"];
      if (!n) return;
      if (!m[n]) m[n] = { milestones: {} };
      const ms = r.Milestone || "unknown";
      if (!m[n].milestones[ms]) m[n].milestones[ms] = {};
      m[n].milestones[ms].intern = r;
    });
    mgr.forEach(r => {
      const n = r["Intern Name"];
      if (!n) return;
      if (!m[n]) m[n] = { milestones: {} };
      const ms = r.Milestone || "unknown";
      if (!m[n].milestones[ms]) m[n].milestones[ms] = {};
      m[n].milestones[ms].manager = r;
    });
    return m;
  }, [intern, mgr]);

  // Group by manager
  const managerMap = useMemo(() => {
    const mm = {};
    mgr.forEach(r => {
      const mName = r["Manager Name"] || "Unknown";
      if (!mm[mName]) mm[mName] = [];
      mm[mName].push(r);
    });
    return mm;
  }, [mgr]);

  // Average scores
  const avgScore = useCallback((rows, key) => {
    const nums = rows.map(r => getNum(r[key])).filter(n => n !== null);
    return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : "—";
  }, []);

  // Filtered registry
  const filteredRegistry = useMemo(() => {
    return registry.filter(r => {
      if (searchQ && !r.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
      if (filterTeam !== "all" && r.team !== filterTeam) return false;
      if (filterResult !== "all" && r.result !== filterResult) return false;
      return true;
    });
  }, [registry, searchQ, filterTeam, filterResult]);

  // CSV export
  const exportCSV = () => {
    if (!all.length) return;
    const headers = Object.keys(all[0]).filter(k => k !== "_type");
    const csv = [["Type", ...headers].join(","), ...all.map(r => [r._type, ...headers.map(h => `"${String(r[h] || "").replace(/"/g, '""')}"`)] .join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "feedback_export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const exportRegistryCSV = () => {
    const headers = ["Name", "Team", "Start Date", "End Date", "Result", "Manager", "Feedback Stage"];
    const csv = [headers.join(","), ...registry.map(r => [r.name, r.team, r.startDate, r.endDate, r.result, r.manager, r.feedbackStage].map(v => `"${(v || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "intern_registry.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const Tab = ({ id, label, icon }) => (
    <button onClick={() => { setTab(id); setSel(null); }} style={{
      padding: "9px 16px", borderRadius: 10, border: tab === id ? "1.5px solid var(--c-accent)" : "1.5px solid transparent",
      background: tab === id ? "var(--c-accent-soft)" : "transparent", color: tab === id ? "var(--c-accent)" : "var(--c-muted)",
      fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap"
    }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}{label}
    </button>
  );

  // Inline intern editor form
  function InternForm({ initial, onSave, onCancel }) {
    const [f, setF] = useState(initial || { name: "", team: "", startDate: "", endDate: "", result: "In progress", manager: "", feedbackStage: "1 month" });
    const update = (k, v) => setF(p => ({ ...p, [k]: v }));
    const sel = { ...inp, fontSize: 13, padding: "10px 14px", appearance: "none", WebkitAppearance: "none" };
    return (
      <div style={{ ...card, padding: 24, marginBottom: 16, borderColor: "var(--c-accent)", borderWidth: 2 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{initial ? "Edit intern" : "Add new intern"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Full name"><input value={f.name} onChange={e => update("name", e.target.value)} style={{ ...inp, fontSize: 13, padding: "10px 14px" }} onFocus={focus} onBlur={blur} placeholder="Full name" /></Field>
          <Field label="Team"><select value={f.team} onChange={e => update("team", e.target.value)} style={sel}><option value="">Select team</option>{TEAMS.map(t => <option key={t} value={t}>{t}</option>)}</select></Field>
          <Field label="Start date"><input type="date" value={f.startDate} onChange={e => update("startDate", e.target.value)} style={{ ...inp, fontSize: 13, padding: "10px 14px" }} /></Field>
          <Field label="End date"><input type="date" value={f.endDate} onChange={e => update("endDate", e.target.value)} style={{ ...inp, fontSize: 13, padding: "10px 14px" }} /></Field>
          <Field label="Manager"><input value={f.manager} onChange={e => update("manager", e.target.value)} style={{ ...inp, fontSize: 13, padding: "10px 14px" }} onFocus={focus} onBlur={blur} placeholder="Manager name" /></Field>
          <Field label="Status"><select value={f.result} onChange={e => update("result", e.target.value)} style={sel}>{RESULTS.map(r => <option key={r} value={r}>{r}</option>)}</select></Field>
          <Field label="Feedback stage"><select value={f.feedbackStage} onChange={e => update("feedbackStage", e.target.value)} style={sel}>{MILESTONES.map(m => <option key={m} value={m}>{m}</option>)}</select></Field>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={onCancel} style={{ ...btnBack, padding: "10px 20px", flex: 0 }}>Cancel</button>
          <button onClick={() => f.name.trim() && onSave(f)} disabled={!f.name.trim()} style={{ ...btnP(f.name.trim()), padding: "10px 24px", width: "auto" }}>Save</button>
        </div>
      </div>
    );
  }

  const resultColor = r => r === "Successful" ? "var(--c-high)" : r === "Not successful" ? "var(--c-low)" : r === "Left the company" ? "var(--c-muted)" : "var(--c-accent)";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: "var(--c-hover)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-text)" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--c-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Admin panel</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={load} style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg> Refresh
          </button>
        </div>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.02em" }}>Feedback Dashboard</h1>

      {loading && <div style={{ textAlign: "center", padding: 60 }}><div style={{ width: 24, height: 24, border: "2.5px solid var(--c-border)", borderTopColor: "var(--c-accent)", borderRadius: "50%", animation: "spin 0.6s linear infinite", margin: "0 auto 12px" }} /><div style={{ color: "var(--c-muted)", fontSize: 14 }}>Loading data from Google Sheets...</div></div>}
      {err && <div style={{ ...card, padding: "40px", textAlign: "center" }}><div style={{ fontSize: 15, color: "var(--c-low)", marginBottom: 8 }}>Could not load data</div><div style={{ fontSize: 13, color: "var(--c-muted)", marginBottom: 16 }}>{err}</div><button onClick={load} style={{ ...btnP(true), maxWidth: 200, margin: "0 auto" }}>Retry</button></div>}

      {!loading && !err && <>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          <Tab id="dashboard" label="Dashboard" icon="📊" />
          <Tab id="registry" label="Registry" icon="📋" />
          <Tab id="interns" label="By intern" icon="🎓" />
          <Tab id="managers" label="By manager" icon="👤" />
          <Tab id="responses" label="All responses" icon="💬" />
        </div>

        {/* ═══════ DASHBOARD ═══════ */}
        {tab === "dashboard" && <div style={{ animation: "fadeUp 0.3s ease-out" }}>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12, marginBottom: 24 }}>
            <StatCard label="Active interns" value={registry.filter(r => r.result === "In progress").length} color="var(--c-accent)" icon="🎓" />
            <StatCard label="Total responses" value={all.length} color="var(--c-text)" icon="💬" />
            <StatCard label="Self-assessments" value={intern.length} color="var(--c-accent)" icon="📝" />
            <StatCard label="Manager assessments" value={mgr.length} color="var(--c-high)" icon="👤" />
            <StatCard label="Unique interns w/ feedback" value={Object.keys(internMap).length} color="#e8a84a" icon="📊" />
          </div>

          {/* Avg scores summary */}
          {all.length > 0 && <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Average scores across all responses</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-high)", marginBottom: 12 }}>Manager assessments ({mgr.length})</div>
                {scoreKeysMgr.map(k => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--c-muted)", width: 100, flexShrink: 0 }}>{k}</span>
                    <Bar val={avgScore(mgr, k)} />
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-accent)", marginBottom: 12 }}>Intern self-assessments ({intern.length})</div>
                {scoreKeysIntern.map(k => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--c-muted)", width: 100, flexShrink: 0 }}>{k}</span>
                    <Bar val={avgScore(intern, k)} />
                  </div>
                ))}
              </div>
            </div>
          </div>}

          {/* Recent submissions table */}
          {all.length > 0 && <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Recent submissions</span>
              <button onClick={exportCSV} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "var(--c-accent)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> Export CSV
              </button>
            </div>
            <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ borderBottom: "1px solid var(--c-border)" }}>
                {["Name", "Milestone", "Tasks", "Product", "Workflow", "Comms", "Type", "Date"].map(h => <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 500, color: "var(--c-muted)", fontSize: 12 }}>{h}</th>)}
              </tr></thead>
              <tbody>{all.slice().reverse().map((r, i) => {
                const nm = r._type === "manager" ? r["Intern Name"] : r.Name;
                return <tr key={i} style={{ borderBottom: "1px solid var(--c-border)", cursor: "pointer" }} onClick={() => { setSel(r); setTab("responseDetail"); }} onMouseEnter={e => e.currentTarget.style.background = "var(--c-hover)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 14px", fontWeight: 500 }}>{nm}</td>
                  <td style={{ padding: "12px 14px" }}><span style={{ padding: "2px 8px", borderRadius: 6, background: "var(--c-accent-soft)", color: "var(--c-accent)", fontSize: 11, fontWeight: 600 }}>{r.Milestone}</span></td>
                  {commonKeys.map(k => <td key={k} style={{ padding: "12px 14px" }}><Badge val={r[k]} /></td>)}
                  <td style={{ padding: "12px 14px" }}><span style={{ padding: "2px 8px", borderRadius: 6, background: r._type === "manager" ? "#3bba6f18" : "#6c63ff18", color: r._type === "manager" ? "var(--c-high)" : "var(--c-accent)", fontSize: 11, fontWeight: 600 }}>{r._type}</span></td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--c-muted)" }}>{r.Timestamp ? new Date(r.Timestamp).toLocaleDateString() : "—"}</td>
                </tr>;
              })}</tbody>
            </table></div>
          </div>}

          {all.length === 0 && <div style={{ ...card, padding: 40, textAlign: "center", color: "var(--c-muted)" }}>No submissions yet. Responses will appear here once people complete their forms.</div>}
        </div>}

        {/* ═══════ REGISTRY ═══════ */}
        {tab === "registry" && <div style={{ animation: "fadeUp 0.3s ease-out" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search by name..." style={{ ...inp, width: 200, fontSize: 13, padding: "9px 14px" }} onFocus={focus} onBlur={blur} />
            <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} style={{ ...inp, width: 140, fontSize: 13, padding: "9px 14px", appearance: "auto" }}>
              <option value="all">All teams</option>
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterResult} onChange={e => setFilterResult(e.target.value)} style={{ ...inp, width: 140, fontSize: 13, padding: "9px 14px", appearance: "auto" }}>
              <option value="all">All statuses</option>
              {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={exportRegistryCSV} style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Export CSV</button>
              <button onClick={() => { setShowAddForm(true); setEditingIntern(null); }} style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: "var(--c-accent)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Add intern</button>
            </div>
          </div>

          {showAddForm && !editingIntern && <InternForm onSave={f => { setRegistry(p => [...p, f]); setShowAddForm(false); }} onCancel={() => setShowAddForm(false)} />}
          {editingIntern !== null && <InternForm initial={registry[editingIntern]} onSave={f => { setRegistry(p => p.map((r, i) => i === editingIntern ? f : r)); setEditingIntern(null); }} onCancel={() => setEditingIntern(null)} />}

          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ borderBottom: "1px solid var(--c-border)" }}>
                  {["Name", "Team", "Start", "End", "Manager", "Status", "Stage", ""].map(h => <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 500, color: "var(--c-muted)", fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filteredRegistry.map((r, idx) => {
                    const realIdx = registry.indexOf(r);
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--c-border)" }} onMouseEnter={e => e.currentTarget.style.background = "var(--c-hover)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 14px", fontWeight: 500 }}>{r.name}</td>
                        <td style={{ padding: "12px 14px" }}>{r.team || "—"}</td>
                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{r.startDate || "—"}</td>
                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{r.endDate || "—"}</td>
                        <td style={{ padding: "12px 14px" }}>{r.manager || "—"}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 6, background: `${resultColor(r.result)}18`, color: resultColor(r.result), fontSize: 11, fontWeight: 600 }}>{r.result}</span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 6, background: "var(--c-accent-soft)", color: "var(--c-accent)", fontSize: 11, fontWeight: 600 }}>{r.feedbackStage}</span>
                        </td>
                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                          <button onClick={() => { setEditingIntern(realIdx); setShowAddForm(false); }} style={{ background: "none", border: "none", color: "var(--c-accent)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 500, marginRight: 8 }}>Edit</button>
                          <button onClick={() => { if (confirm(`Remove ${r.name}?`)) setRegistry(p => p.filter((_, i) => i !== realIdx)); }} style={{ background: "none", border: "none", color: "var(--c-low)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 500 }}>Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredRegistry.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--c-muted)" }}>No interns match the current filters.</div>}
          </div>
          <div style={{ fontSize: 12, color: "var(--c-muted)", marginTop: 12 }}>Showing {filteredRegistry.length} of {registry.length} interns</div>
        </div>}

        {/* ═══════ BY INTERN ═══════ */}
        {tab === "interns" && !sel && <div style={{ animation: "fadeUp 0.3s ease-out", display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.keys(internMap).length === 0 ? <div style={{ ...card, padding: 40, textAlign: "center", color: "var(--c-muted)" }}>No intern data yet.</div>
            : Object.entries(internMap).map(([name, d]) => {
              const milestoneKeys = Object.keys(d.milestones);
              const latestMs = milestoneKeys[milestoneKeys.length - 1];
              const latestData = d.milestones[latestMs];
              const src = latestData.manager || latestData.intern || {};
              const regEntry = registry.find(r => r.name === name);
              return (
                <div key={name} style={{ ...card, padding: "24px 28px", cursor: "pointer" }} onClick={() => { setSel({ name, data: d }); setTab("internDetail"); }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-accent)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-border)"}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 17, fontWeight: 600 }}>{name}</span>
                      {regEntry && <span style={{ fontSize: 11, color: "var(--c-muted)" }}>{regEntry.team}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {milestoneKeys.map(ms => <span key={ms} style={{ padding: "3px 10px", borderRadius: 8, background: "var(--c-accent-soft)", color: "var(--c-accent)", fontSize: 12, fontWeight: 600 }}>{ms}</span>)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {commonKeys.map(k => <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 140 }}>
                      <span style={{ fontSize: 12, color: "var(--c-muted)" }}>{k}:</span><Bar val={src[k]} />
                    </div>)}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {latestData.intern && <span style={{ padding: "2px 8px", borderRadius: 6, background: "#6c63ff18", color: "var(--c-accent)", fontSize: 11, fontWeight: 600 }}>Self-assessment</span>}
                    {latestData.manager && <span style={{ padding: "2px 8px", borderRadius: 6, background: "#3bba6f18", color: "var(--c-high)", fontSize: 11, fontWeight: 600 }}>Manager assessment</span>}
                  </div>
                </div>
              );
            })}
        </div>}

        {/* ═══════ INTERN DETAIL ═══════ */}
        {tab === "internDetail" && sel && <div style={{ animation: "fadeUp 0.3s ease-out" }}>
          <button onClick={() => { setTab("interns"); setSel(null); }} style={{ ...btnBack, marginBottom: 16, width: "auto", padding: "8px 16px", fontSize: 13 }}>← Back to interns</button>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{sel.name}</span>
              {(() => { const re = registry.find(r => r.name === sel.name); return re ? <span style={{ fontSize: 12, color: "var(--c-muted)" }}>{re.team} · Manager: {re.manager}</span> : null; })()}
            </div>

            {Object.entries(sel.data.milestones).map(([ms, msData]) => (
              <div key={ms} style={{ marginTop: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <span style={{ padding: "4px 14px", borderRadius: 10, background: "var(--c-accent-soft)", color: "var(--c-accent)", fontSize: 13, fontWeight: 600 }}>{ms} milestone</span>
                  <div style={{ flex: 1, height: 1, background: "var(--c-border)" }} />
                </div>

                {/* Side by side score comparison */}
                {(msData.intern || msData.manager) && <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Score comparison</div>
                  {commonKeys.map(k => (
                    <DualBar key={k} label={k} mgrVal={msData.manager?.[k]} intVal={msData.intern?.[k]} />
                  ))}
                  {msData.manager && <>
                    <DualBar label="Feedback Seeking" mgrVal={msData.manager?.["Feedback Seeking"]} intVal={null} />
                    <DualBar label="Overall (Mgr)" mgrVal={msData.manager?.["Overall"]} intVal={null} />
                  </>}
                  {msData.intern && <>
                    <DualBar label="Support" mgrVal={null} intVal={msData.intern?.["Support"]} />
                    <DualBar label="Enjoyment" mgrVal={null} intVal={msData.intern?.["Enjoyment"]} />
                    <DualBar label="Progress" mgrVal={null} intVal={msData.intern?.["Progress"]} />
                  </>}
                </div>}

                {/* Open-ended responses */}
                <div style={{ display: "grid", gridTemplateColumns: msData.intern && msData.manager ? "1fr 1fr" : "1fr", gap: 16 }}>
                  {msData.intern && <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-accent)", marginBottom: 10 }}>Intern's comments</div>
                    {Object.entries(msData.intern).filter(([k, v]) => !["Timestamp", "Name", "Email", "Milestone", "Tasks", "Product", "Workflow", "Communication", "Support", "Enjoyment", "Progress", "Milestone Q1", "Milestone Q2"].includes(k) && v && typeof v === "string" && v.length > 2).map(([k, v]) => (
                      <div key={k} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: "var(--c-muted)", marginBottom: 4 }}>{k}</div>
                        <div style={{ fontSize: 13, padding: "10px 14px", background: "var(--c-hover)", borderRadius: 10, lineHeight: 1.6 }}>{v}</div>
                      </div>
                    ))}
                  </div>}
                  {msData.manager && <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-high)", marginBottom: 10 }}>Manager's comments</div>
                    {Object.entries(msData.manager).filter(([k, v]) => !["Timestamp", "Manager Name", "Manager Email", "Intern Name", "Milestone", "Tasks", "Product", "Workflow", "Communication", "Feedback Seeking", "Overall", "Milestone Q1", "Milestone Q2"].includes(k) && v && typeof v === "string" && v.length > 2).map(([k, v]) => (
                      <div key={k} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: "var(--c-muted)", marginBottom: 4 }}>{k}</div>
                        <div style={{ fontSize: 13, padding: "10px 14px", background: "var(--c-hover)", borderRadius: 10, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{v}</div>
                      </div>
                    ))}
                  </div>}
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* ═══════ BY MANAGER ═══════ */}
        {tab === "managers" && !sel && <div style={{ animation: "fadeUp 0.3s ease-out", display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.keys(managerMap).length === 0 ? <div style={{ ...card, padding: 40, textAlign: "center", color: "var(--c-muted)" }}>No manager assessments yet.</div>
            : Object.entries(managerMap).map(([mgrName, responses]) => {
              const interns = [...new Set(responses.map(r => r["Intern Name"]))];
              return (
                <div key={mgrName} style={{ ...card, padding: "24px 28px", cursor: "pointer" }} onClick={() => { setSel({ name: mgrName, responses }); setTab("managerDetail"); }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-high)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-border)"}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "#3bba6f14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 600 }}>{mgrName}</div>
                        <div style={{ fontSize: 12, color: "var(--c-muted)" }}>{responses.length} assessment{responses.length !== 1 ? "s" : ""} · {interns.length} intern{interns.length !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {interns.map(n => <span key={n} style={{ padding: "3px 10px", borderRadius: 8, background: "var(--c-accent-soft)", color: "var(--c-accent)", fontSize: 12, fontWeight: 500 }}>{n}</span>)}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                    {scoreKeysMgr.slice(0, 4).map(k => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 120 }}>
                        <span style={{ fontSize: 12, color: "var(--c-muted)" }}>{k}:</span>
                        <Badge val={avgScore(responses, k)} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>}

        {/* ═══════ MANAGER DETAIL ═══════ */}
        {tab === "managerDetail" && sel && <div style={{ animation: "fadeUp 0.3s ease-out" }}>
          <button onClick={() => { setTab("managers"); setSel(null); }} style={{ ...btnBack, marginBottom: 16, width: "auto", padding: "8px 16px", fontSize: 13 }}>← Back to managers</button>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "#3bba6f14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{sel.name}</div>
                <div style={{ fontSize: 13, color: "var(--c-muted)" }}>{sel.responses.length} total assessments</div>
              </div>
            </div>

            {/* Average scores */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Average scores given</div>
              {scoreKeysMgr.map(k => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--c-muted)", width: 120, flexShrink: 0 }}>{k}</span>
                  <Bar val={avgScore(sel.responses, k)} />
                </div>
              ))}
            </div>

            {/* Per-intern breakdown */}
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Per intern</div>
            {sel.responses.map((r, i) => (
              <div key={i} style={{ padding: "16px 20px", borderRadius: 12, background: "var(--c-hover)", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{r["Intern Name"]}</span>
                  <span style={{ padding: "2px 8px", borderRadius: 6, background: "var(--c-accent-soft)", color: "var(--c-accent)", fontSize: 11, fontWeight: 600 }}>{r.Milestone}</span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {scoreKeysMgr.map(k => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--c-muted)" }}>{k}:</span><Badge val={r[k]} />
                    </div>
                  ))}
                </div>
                {/* Open text */}
                {Object.entries(r).filter(([k, v]) => !["Timestamp", "Manager Name", "Manager Email", "Intern Name", "Milestone", ...scoreKeysMgr, "Milestone Q1", "Milestone Q2"].includes(k) && v && typeof v === "string" && v.length > 2).map(([k, v]) => (
                  <div key={k} style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--c-muted)", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{v}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>}

        {/* ═══════ ALL RESPONSES ═══════ */}
        {tab === "responses" && !sel && <div style={{ animation: "fadeUp 0.3s ease-out", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
            <button onClick={exportCSV} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "var(--c-accent)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> Export all CSV
            </button>
          </div>
          {all.length === 0 ? <div style={{ ...card, padding: 40, textAlign: "center", color: "var(--c-muted)" }}>No responses yet.</div>
            : all.slice().reverse().map((r, i) => {
              const nm = r._type === "manager" ? r["Intern Name"] : r.Name;
              return <div key={i} style={{ ...card, padding: "20px 24px", cursor: "pointer" }} onClick={() => { setSel(r); setTab("responseDetail"); }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-accent)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-border)"}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{nm}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 6, background: r._type === "manager" ? "#3bba6f18" : "#6c63ff18", color: r._type === "manager" ? "var(--c-high)" : "var(--c-accent)", fontSize: 11, fontWeight: 600 }}>{r._type === "manager" ? `by ${r["Manager Name"]}` : "self"}</span>
                  </div>
                  <span style={{ padding: "2px 8px", borderRadius: 6, background: "var(--c-accent-soft)", color: "var(--c-accent)", fontSize: 11, fontWeight: 600 }}>{r.Milestone}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--c-muted)" }}>{r.Timestamp ? new Date(r.Timestamp).toLocaleString() : "—"}</div>
              </div>;
            })}
        </div>}

        {/* ═══════ SINGLE RESPONSE DETAIL ═══════ */}
        {tab === "responseDetail" && sel && <div style={{ animation: "fadeUp 0.3s ease-out" }}>
          <button onClick={() => { setTab("responses"); setSel(null); }} style={{ ...btnBack, marginBottom: 16, width: "auto", padding: "8px 16px", fontSize: 13 }}>← Back</button>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 19, fontWeight: 600 }}>{sel._type === "manager" ? sel["Intern Name"] : sel.Name}</span>
              <span style={{ padding: "3px 10px", borderRadius: 8, background: sel._type === "manager" ? "#3bba6f18" : "#6c63ff18", color: sel._type === "manager" ? "var(--c-high)" : "var(--c-accent)", fontSize: 12, fontWeight: 600 }}>{sel._type === "manager" ? `Manager: ${sel["Manager Name"]}` : "Self-assessment"}</span>
              <span style={{ padding: "3px 10px", borderRadius: 8, background: "var(--c-accent-soft)", color: "var(--c-accent)", fontSize: 12, fontWeight: 600 }}>{sel.Milestone}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--c-muted)", marginBottom: 24 }}>{sel.Timestamp ? new Date(sel.Timestamp).toLocaleString() : ""}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
              {Object.entries(sel).filter(([k]) => !["_type", "Timestamp", "Name", "Email", "Manager Name", "Manager Email", "Intern Name", "Milestone"].includes(k)).map(([k, v]) =>
                <div key={k} style={{ padding: "12px 16px", borderRadius: 10, background: "var(--c-hover)" }}>
                  <div style={{ fontSize: 11, color: "var(--c-muted)", marginBottom: 4 }}>{k}</div>
                  {getNum(v) !== null ? <Bar val={v} /> : <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{v || "—"}</div>}
                </div>
              )}
            </div>
          </div>
        </div>}
      </>}

      <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "var(--c-muted)", opacity: 0.5 }}>CloudLinux Internship Program — 2026</div>
    </div>
  );
}

/* ── App ── */
export default function App() {
  const [page, setPage] = useState("landing");
  return (
    <div style={{ "--c-bg": "#f0ede6", "--c-surface": "#faf9f6", "--c-text": "#2c2a25", "--c-muted": "#8a8578", "--c-border": "#d9d5cb", "--c-accent": "#6c63ff", "--c-accent-soft": "#6c63ff18", "--c-hover": "#edeae3", "--c-low": "#e85d4a", "--c-mid": "#e8a84a", "--c-high": "#3bba6f", minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-text)", fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');@keyframes popIn{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}@keyframes fadeUp{0%{transform:translateY(16px);opacity:0}100%{transform:translateY(0);opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box;margin:0;padding:0}body{background:#f0ede6}::selection{background:#6c63ff30}textarea::placeholder,input::placeholder{color:#8a8578;opacity:0.6}`}</style>
      {page === "landing" && <Landing onNav={setPage} />}
      {page === "intern" && <Form type="intern" onBack={() => setPage("landing")} />}
      {page === "manager" && <Form type="manager" onBack={() => setPage("landing")} />}
      {page === "admin" && <Admin onBack={() => setPage("landing")} />}
    </div>
  );
}
