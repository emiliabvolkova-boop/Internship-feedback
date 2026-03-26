import { useState, useEffect } from "react";

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

/* ── Admin ── */
function Admin({onBack}) {
  const [tab,setTab]=useState("overview"),[sel,setSel]=useState(null),[data,setData]=useState(null),[loading,setLoading]=useState(true),[err,setErr]=useState(null);

  const load=async()=>{
    setLoading(true); setErr(null);
    try {
      const r=await fetch(SCRIPT_URL);
      const j=await r.json();
      setData(j);
    } catch(e){ setErr("Could not load data. The Google Sheet might require CloudLinux login."); }
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const intern=data?.["Intern Responses"]||[];
  const mgr=data?.["Manager Responses"]||[];
  const all=[...intern.map(r=>({...r,_type:"intern"})),...mgr.map(r=>({...r,_type:"manager"}))];

  const exportCSV=()=>{
    if(!all.length) return;
    const headers=Object.keys(all[0]).filter(k=>k!=="_type");
    const csv=[["Type",...headers].join(","),...all.map(r=>[r._type,...headers.map(h=>`"${String(r[h]||"").replace(/"/g,'""')}"`)] .join(","))].join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="feedback_export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const scoreKeys=["Tasks","Product","Workflow","Communication"];
  const getNum=v=>{const n=parseFloat(v);return isNaN(n)?null:n;};

  // Group by intern name
  const internMap={};
  intern.forEach(r=>{const n=r.Name||r["Intern Name"];if(n)internMap[n]={...(internMap[n]||{}),intern:r};});
  mgr.forEach(r=>{const n=r["Intern Name"];if(n)internMap[n]={...(internMap[n]||{}),manager:r};});

  const Tab=({id,label})=><button onClick={()=>{setTab(id);setSel(null);}} style={{padding:"8px 16px",borderRadius:10,border:tab===id?"1.5px solid var(--c-accent)":"1.5px solid transparent",background:tab===id?"var(--c-accent-soft)":"transparent",color:tab===id?"var(--c-accent)":"var(--c-muted)",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>{label}</button>;

  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"40px 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
        <button onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"var(--c-hover)",display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-text)" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <span style={{fontSize:13,fontWeight:500,color:"var(--c-muted)",letterSpacing:"0.05em",textTransform:"uppercase"}}>Admin panel</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={load} style={{padding:"8px 14px",borderRadius:10,border:"1.5px solid var(--c-border)",background:"transparent",color:"var(--c-muted)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg> Refresh
          </button>
          <button onClick={exportCSV} style={{padding:"8px 14px",borderRadius:10,border:"none",background:"var(--c-accent)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export CSV
          </button>
        </div>
      </div>
      <h1 style={{fontSize:28,fontWeight:700,marginBottom:24,letterSpacing:"-0.02em"}}>Feedback Dashboard</h1>

      {loading&&<div style={{textAlign:"center",padding:60}}><div style={{width:24,height:24,border:"2.5px solid var(--c-border)",borderTopColor:"var(--c-accent)",borderRadius:"50%",animation:"spin 0.6s linear infinite",margin:"0 auto 12px"}}/><div style={{color:"var(--c-muted)",fontSize:14}}>Loading data from Google Sheets...</div></div>}

      {err&&<div style={{...card,padding:"40px",textAlign:"center"}}><div style={{fontSize:15,color:"var(--c-low)",marginBottom:8}}>Could not load data</div><div style={{fontSize:13,color:"var(--c-muted)",marginBottom:16}}>{err}</div><button onClick={load} style={{...btnP(true),maxWidth:200,margin:"0 auto"}}>Retry</button></div>}

      {!loading&&!err&&<>
        <div style={{display:"flex",gap:8,marginBottom:24}}><Tab id="overview" label="Overview"/><Tab id="interns" label="By intern"/><Tab id="responses" label="All responses"/></div>

        {tab==="overview"&&!sel&&<div style={{animation:"fadeUp 0.3s ease-out"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
            {[{l:"Total responses",v:all.length,c:"var(--c-accent)"},{l:"Intern self-assessments",v:intern.length,c:"var(--c-accent)"},{l:"Manager assessments",v:mgr.length,c:"var(--c-high)"}].map((s,i)=>
              <div key={i} style={{...card,padding:20,textAlign:"center"}}><div style={{fontSize:28,fontWeight:700,color:s.c,marginBottom:4}}>{s.v}</div><div style={{fontSize:12,color:"var(--c-muted)"}}>{s.l}</div></div>)}
          </div>
          {all.length===0?<div style={{...card,padding:40,textAlign:"center",color:"var(--c-muted)"}}>No submissions yet. Responses will appear here once people complete their forms.</div>
          :<div style={{...card,padding:0,overflow:"hidden"}}>
            <div style={{padding:"16px 24px",borderBottom:"1px solid var(--c-border)",fontSize:15,fontWeight:600}}>Recent submissions</div>
            <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{borderBottom:"1px solid var(--c-border)"}}>
                {["Name","Milestone","Tasks","Product","Workflow","Comms","Type"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"left",fontWeight:500,color:"var(--c-muted)",fontSize:12}}>{h}</th>)}
              </tr></thead>
              <tbody>{all.map((r,i)=>{
                const nm=r._type==="manager"?r["Intern Name"]:r.Name;
                return <tr key={i} style={{borderBottom:"1px solid var(--c-border)",cursor:"pointer"}} onClick={()=>setSel(r)} onMouseEnter={e=>e.currentTarget.style.background="var(--c-hover)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"12px 16px",fontWeight:500}}>{nm}</td>
                  <td style={{padding:"12px 16px"}}><span style={{padding:"2px 8px",borderRadius:6,background:"var(--c-accent-soft)",color:"var(--c-accent)",fontSize:11,fontWeight:600}}>{r.Milestone}</span></td>
                  {scoreKeys.map(k=><td key={k} style={{padding:"12px 16px"}}><Badge val={r[k]}/></td>)}
                  <td style={{padding:"12px 16px"}}><span style={{padding:"2px 8px",borderRadius:6,background:r._type==="manager"?"#3bba6f18":"#6c63ff18",color:r._type==="manager"?"var(--c-high)":"var(--c-accent)",fontSize:11,fontWeight:600}}>{r._type}</span></td>
                </tr>;
              })}</tbody>
            </table></div>
          </div>}
        </div>}

        {tab==="interns"&&!sel&&<div style={{animation:"fadeUp 0.3s ease-out",display:"flex",flexDirection:"column",gap:12}}>
          {Object.keys(internMap).length===0?<div style={{...card,padding:40,textAlign:"center",color:"var(--c-muted)"}}>No intern data yet.</div>
          :Object.entries(internMap).map(([name,d])=>{
            const src=d.manager||d.intern||{};
            return <div key={name} style={{...card,padding:"24px 28px",cursor:"pointer"}} onClick={()=>{setSel({name,data:d});setTab("internDetail");}} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--c-accent)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--c-border)"}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontSize:17,fontWeight:600}}>{name}</div>
                <span style={{padding:"3px 10px",borderRadius:8,background:"var(--c-accent-soft)",color:"var(--c-accent)",fontSize:12,fontWeight:600}}>{src.Milestone||"—"}</span>
              </div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                {scoreKeys.map(k=><div key={k} style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:12,color:"var(--c-muted)"}}>{k}:</span><Bar val={src[k]}/>
                </div>)}
              </div>
              <div style={{display:"flex",gap:6,marginTop:10}}>
                {d.intern&&<span style={{padding:"2px 8px",borderRadius:6,background:"#6c63ff18",color:"var(--c-accent)",fontSize:11,fontWeight:600}}>Self-assessment</span>}
                {d.manager&&<span style={{padding:"2px 8px",borderRadius:6,background:"#3bba6f18",color:"var(--c-high)",fontSize:11,fontWeight:600}}>Manager assessment</span>}
              </div>
            </div>;
          })}
        </div>}

        {tab==="internDetail"&&sel&&<div style={{animation:"fadeUp 0.3s ease-out"}}>
          <button onClick={()=>{setTab("interns");setSel(null);}} style={{...btnBack,marginBottom:16,width:"auto",padding:"8px 16px",fontSize:13}}>← Back to interns</button>
          <div style={card}>
            <div style={{fontSize:22,fontWeight:700,marginBottom:4}}>{sel.name}</div>
            <div style={{fontSize:13,color:"var(--c-muted)",marginBottom:24}}>{(sel.data.manager||sel.data.intern||{}).Milestone||""} milestone</div>

            {/* Side by side comparison */}
            <div style={{display:"grid",gridTemplateColumns:sel.data.intern&&sel.data.manager?"1fr 1fr":"1fr",gap:16}}>
              {sel.data.intern&&<div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:12,color:"var(--c-accent)"}}>Self-assessment</div>
                {Object.entries(sel.data.intern).filter(([k])=>!["Timestamp","Name","Email","Milestone"].includes(k)).map(([k,v])=>
                  <div key={k} style={{marginBottom:10}}>
                    <div style={{fontSize:11,color:"var(--c-muted)",marginBottom:4}}>{k}</div>
                    {getNum(v)!==null?<Bar val={v}/>:<div style={{fontSize:13,padding:"8px 12px",background:"var(--c-hover)",borderRadius:8,lineHeight:1.5}}>{v||"—"}</div>}
                  </div>
                )}
              </div>}
              {sel.data.manager&&<div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:12,color:"var(--c-high)"}}>Manager assessment</div>
                {Object.entries(sel.data.manager).filter(([k])=>!["Timestamp","Manager Name","Manager Email","Intern Name","Milestone"].includes(k)).map(([k,v])=>
                  <div key={k} style={{marginBottom:10}}>
                    <div style={{fontSize:11,color:"var(--c-muted)",marginBottom:4}}>{k}</div>
                    {getNum(v)!==null?<Bar val={v}/>:<div style={{fontSize:13,padding:"8px 12px",background:"var(--c-hover)",borderRadius:8,lineHeight:1.5}}>{v||"—"}</div>}
                  </div>
                )}
              </div>}
            </div>
          </div>
        </div>}

        {tab==="responses"&&!sel&&<div style={{animation:"fadeUp 0.3s ease-out",display:"flex",flexDirection:"column",gap:12}}>
          {all.length===0?<div style={{...card,padding:40,textAlign:"center",color:"var(--c-muted)"}}>No responses yet.</div>
          :all.map((r,i)=>{
            const nm=r._type==="manager"?r["Intern Name"]:r.Name;
            return <div key={i} style={{...card,padding:"20px 24px",cursor:"pointer"}} onClick={()=>setSel(r)} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--c-accent)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--c-border)"}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontWeight:600,fontSize:15}}>{nm}</span>
                  <span style={{padding:"2px 8px",borderRadius:6,background:r._type==="manager"?"#3bba6f18":"#6c63ff18",color:r._type==="manager"?"var(--c-high)":"var(--c-accent)",fontSize:11,fontWeight:600}}>{r._type==="manager"?`by ${r["Manager Name"]}`:"self"}</span>
                </div>
                <span style={{padding:"2px 8px",borderRadius:6,background:"var(--c-accent-soft)",color:"var(--c-accent)",fontSize:11,fontWeight:600}}>{r.Milestone}</span>
              </div>
              <div style={{fontSize:12,color:"var(--c-muted)"}}>{r.Timestamp}</div>
            </div>;
          })}
        </div>}

        {sel&&!sel.data&&tab!=="internDetail"&&<div style={{animation:"fadeUp 0.3s ease-out"}}>
          <button onClick={()=>setSel(null)} style={{...btnBack,marginBottom:16,width:"auto",padding:"8px 16px",fontSize:13}}>← Back</button>
          <div style={card}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
              <span style={{fontSize:19,fontWeight:600}}>{sel._type==="manager"?sel["Intern Name"]:sel.Name}</span>
              <span style={{padding:"3px 10px",borderRadius:8,background:sel._type==="manager"?"#3bba6f18":"#6c63ff18",color:sel._type==="manager"?"var(--c-high)":"var(--c-accent)",fontSize:12,fontWeight:600}}>{sel._type==="manager"?`Manager: ${sel["Manager Name"]}`:"Self-assessment"}</span>
              <span style={{padding:"3px 10px",borderRadius:8,background:"var(--c-accent-soft)",color:"var(--c-accent)",fontSize:12,fontWeight:600}}>{sel.Milestone}</span>
            </div>
            <div style={{fontSize:12,color:"var(--c-muted)",marginBottom:24}}>{sel.Timestamp}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
              {Object.entries(sel).filter(([k,v])=>!["_type","Timestamp","Name","Email","Manager Name","Manager Email","Intern Name","Milestone"].includes(k)).map(([k,v])=>
                <div key={k} style={{padding:"12px 16px",borderRadius:10,background:"var(--c-hover)"}}>
                  <div style={{fontSize:11,color:"var(--c-muted)",marginBottom:4}}>{k}</div>
                  {getNum(v)!==null?<Bar val={v}/>:<div style={{fontSize:13,lineHeight:1.5}}>{v||"—"}</div>}
                </div>
              )}
            </div>
          </div>
        </div>}
      </>}
    </div>
  );
}

/* ── App ── */
export default function App() {
  const [page,setPage]=useState("landing");
  return (
    <div style={{"--c-bg":"#f0ede6","--c-surface":"#faf9f6","--c-text":"#2c2a25","--c-muted":"#8a8578","--c-border":"#d9d5cb","--c-accent":"#6c63ff","--c-accent-soft":"#6c63ff18","--c-hover":"#edeae3","--c-low":"#e85d4a","--c-mid":"#e8a84a","--c-high":"#3bba6f",minHeight:"100vh",background:"var(--c-bg)",color:"var(--c-text)",fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');@keyframes popIn{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}@keyframes fadeUp{0%{transform:translateY(16px);opacity:0}100%{transform:translateY(0);opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box;margin:0;padding:0}body{background:#f0ede6}::selection{background:#6c63ff30}textarea::placeholder,input::placeholder{color:#8a8578;opacity:0.6}`}</style>
      {page==="landing"&&<Landing onNav={setPage}/>}
      {page==="intern"&&<Form type="intern" onBack={()=>setPage("landing")}/>}
      {page==="manager"&&<Form type="manager" onBack={()=>setPage("landing")}/>}
      {page==="admin"&&<Admin onBack={()=>setPage("landing")}/>}
    </div>
  );
}
