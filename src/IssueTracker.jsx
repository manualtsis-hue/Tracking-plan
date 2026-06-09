import { useState, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   PRODUCTION ISSUE TRACKER  —  Blue & White Edition
   Palette : #f0f4ff (bg) · #ffffff (panel/card)
             #e8eef8 (row alt) · #d0daf0 (border)
             #1a56db (accent blue) · #1e40af (accent dark)
             #dc2626 (danger) · #16a34a (success) · #d97706 (warn)
════════════════════════════════════════════════════════════ */

// ─── DATA ────────────────────────────────────────────────────
const MEMBERS = [
  { id:1, name:"สมชาย ใจดี",  role:"Engineer",   abbr:"สช", skills:["Mechanical","Electrical"] },
  { id:2, name:"วิภา รักงาน", role:"Technician", abbr:"วภ", skills:["Quality","Process"] },
  { id:3, name:"ธนา สุขใจ",   role:"Supervisor", abbr:"ธน", skills:["Management","Process"] },
  { id:4, name:"นภา ชัยดี",   role:"Engineer",   abbr:"นภ", skills:["Electrical","PLC"] },
  { id:5, name:"อรุณ มานะ",   role:"Technician", abbr:"อร", skills:["Mechanical","Welding"] },
];
const ALL_TYPES    = ["Improvement","E-memo","Safety","Quality","Maintenance","Process"];
const ALL_STATUSES = ["รอดำเนินการ","กำลังดำเนินการ","รอตรวจสอบ","เสร็จแล้ว"];
const ALL_PRI      = ["High","Medium","Low"];

const dOff = n => { const x=new Date(); x.setDate(x.getDate()+n); return x.toISOString().split("T")[0]; };
const fmt  = s => s ? new Date(s).toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"2-digit"}) : "—";
const dLeft= s => s ? Math.ceil((new Date(s)-new Date())/864e5) : null;
const mem  = id => MEMBERS.find(m=>m.id===id);

const INIT_ISSUES = [
  { id:1,  title:"ปรับปรุงสายพานลำเลียงสายการผลิต A",       desc:"สายพานมีการสึกหรอ ต้องเปลี่ยนและปรับแนว",                     type:"Improvement", pri:"High",   status:"กำลังดำเนินการ", asgn:1, s:dOff(-10),due:dOff(3),  pct:60,  sw:{"2025-06-W1":"วางแผน","2025-06-W2":"ดำเนินการ","2025-06-W3":"ทดสอบ"}, acts:[{id:1,kind:"status",txt:"เปลี่ยนสถานะ → กำลังดำเนินการ",date:dOff(-5),by:"สมชาย"}], img:null },
  { id:2,  title:"จัดทำ E-memo ขั้นตอนการตรวจสอบ QC",        desc:"สร้างเอกสาร E-memo สำหรับกระบวนการ QC ในไลน์ผลิต B",        type:"E-memo",      pri:"Medium", status:"รอดำเนินการ",    asgn:2, s:dOff(-3), due:dOff(7),  pct:0,   sw:{"2025-06-W2":"ร่างเอกสาร","2025-06-W3":"รีวิว","2025-06-W4":"อนุมัติ"}, acts:[], img:null },
  { id:3,  title:"ติดตั้งระบบป้องกันความปลอดภัย Press #3",   desc:"ติดตั้ง Light Curtain & Safety Relay ที่เครื่อง Press #3",   type:"Safety",      pri:"High",   status:"รอตรวจสอบ",     asgn:4, s:dOff(-15),due:dOff(1),  pct:90,  sw:{"2025-06-W1":"ติดตั้ง","2025-06-W2":"ทดสอบ","2025-06-W3":"รอตรวจ"}, acts:[{id:1,kind:"status",txt:"เปลี่ยนสถานะ → รอตรวจสอบ",date:dOff(-2),by:"นภา"}], img:null },
  { id:4,  title:"ปรับปรุงกระบวนการ Welding ลดของเสีย",       desc:"อัตราของเสียจาก Welding สูงกว่า Target 2% ต้องวิเคราะห์",   type:"Quality",     pri:"High",   status:"กำลังดำเนินการ", asgn:5, s:dOff(-7), due:dOff(5),  pct:45,  sw:{"2025-06-W1":"วิเคราะห์","2025-06-W2":"แก้ไข","2025-06-W3":"ติดตาม"}, acts:[], img:null },
  { id:5,  title:"PM ระบบไฮดรอลิก Injection #5",              desc:"ถึงกำหนด PM ระบบไฮดรอลิก เปลี่ยนน้ำมันและฟิลเตอร์",       type:"Maintenance", pri:"Medium", status:"เสร็จแล้ว",      asgn:1, s:dOff(-20),due:dOff(-5), pct:100, sw:{"2025-05-W3":"PM","2025-05-W4":"ตรวจรับ"}, acts:[{id:1,kind:"status",txt:"เสร็จแล้ว",date:dOff(-5),by:"สมชาย"}], img:null },
  { id:6,  title:"ออกแบบ Jig ใหม่สำหรับชิ้นงาน Part-X",      desc:"Jig เดิมไม่รองรับขนาดชิ้นงานใหม่ ต้องออกแบบและผลิตใหม่",   type:"Improvement", pri:"Low",    status:"รอดำเนินการ",    asgn:3, s:dOff(2),  due:dOff(20), pct:0,   sw:{"2025-06-W2":"ออกแบบ","2025-06-W3":"ผลิต","2025-06-W4":"ทดสอบ"}, acts:[], img:null },
  { id:7,  title:"จัดทำ E-memo SOP การบำรุงรักษารายวัน",      desc:"เอกสาร SOP ยังไม่ครอบคลุมการ PM ประจำวันของ Operator",      type:"E-memo",      pri:"Medium", status:"กำลังดำเนินการ", asgn:2, s:dOff(-5), due:dOff(10), pct:30,  sw:{"2025-06-W1":"ร่าง","2025-06-W2":"ปรับปรุง","2025-06-W3":"รีวิว"}, acts:[], img:null },
  { id:8,  title:"ติดตั้ง Sensor วัดอุณหภูมิ Oven บ่มชิ้น",  desc:"Oven บ่มชิ้นงานไม่มีการแสดงอุณหภูมิ Real-time",             type:"Improvement", pri:"Medium", status:"รอตรวจสอบ",     asgn:4, s:dOff(-8), due:dOff(2),  pct:85,  sw:{"2025-06-W1":"จัดซื้อ","2025-06-W2":"ติดตั้ง","2025-06-W3":"รอตรวจ"}, acts:[], img:null },
  { id:9,  title:"ลด Setup Time CNC 45→30 นาที",              desc:"วิเคราะห์และปรับปรุงขั้นตอน Setup เพื่อลดเวลา",             type:"Process",     pri:"High",   status:"รอดำเนินการ",    asgn:3, s:dOff(1),  due:dOff(25), pct:0,   sw:{"2025-06-W2":"วิเคราะห์","2025-06-W4":"ปรับปรุง"}, acts:[], img:null },
  { id:10, title:"ซ่อมระบบไฟฟ้าสายการผลิต C",                desc:"พบปัญหาไฟฟ้าตกบ่อยครั้งในสายการผลิต C",                     type:"Maintenance", pri:"High",   status:"เสร็จแล้ว",      asgn:4, s:dOff(-12),due:dOff(-8), pct:100, sw:{"2025-05-W4":"ตรวจสอบ","2025-06-W1":"ซ่อมแซม"}, acts:[], img:null },
];

// ─── DESIGN TOKENS ───────────────────────────────────────────
const C = {
  bg:          "#eef2fb",
  panel:       "#ffffff",
  card:        "#f7f9ff",
  line:        "#d0daf0",
  line2:       "#e8eef8",
  accent:      "#1a56db",
  accentBright:"#2563eb",
  gold:        "#d97706",
  red:         "#dc2626",
  green:       "#16a34a",
  amber:       "#d97706",
  textPrimary: "#0f172a",
  textSec:     "#334d7a",
  textMuted:   "#64748b",
};

const STATUS_CFG = {
  "รอดำเนินการ":   { color:"#475569", bg:"#f1f5f9",           border:"#cbd5e1",           icon:"○" },
  "กำลังดำเนินการ":{ color:"#1d4ed8", bg:"#dbeafe",           border:"#93c5fd",           icon:"◉" },
  "รอตรวจสอบ":     { color:"#b45309", bg:"#fef3c7",           border:"#fcd34d",           icon:"◈" },
  "เสร็จแล้ว":     { color:"#15803d", bg:"#dcfce7",           border:"#86efac",           icon:"◆" },
};
const PRI_CFG = {
  High:  { color:"#b91c1c", bg:"#fee2e2", border:"#fca5a5", symbol:"▲▲" },
  Medium:{ color:"#b45309", bg:"#fef3c7", border:"#fcd34d", symbol:"▲"  },
  Low:   { color:"#15803d", bg:"#dcfce7", border:"#86efac", symbol:"▼"  },
};
const TYPE_CFG = {
  Improvement:{ color:"#1d4ed8", bg:"#dbeafe" },
  "E-memo":   { color:"#6d28d9", bg:"#ede9fe" },
  Safety:     { color:"#b91c1c", bg:"#fee2e2" },
  Quality:    { color:"#065f46", bg:"#d1fae5" },
  Maintenance:{ color:"#9a3412", bg:"#ffedd5" },
  Process:    { color:"#0e7490", bg:"#cffafe" },
};

// ─── SHARED COMPONENTS ───────────────────────────────────────
const Chip = ({ label, cfg }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:4,
    padding:"2px 8px", fontSize:11, fontWeight:700,
    letterSpacing:"0.04em", borderRadius:2,
    color: cfg?.color || C.textSec,
    background: cfg?.bg || C.line2,
    border:`1px solid ${cfg?.border || C.line}`,
    fontFamily:"monospace",
  }}>{label}</span>
);

const StatusChip = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG["รอดำเนินการ"];
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", fontSize:11, fontWeight:700,
      letterSpacing:"0.04em", borderRadius:4,
      color:c.color, background:c.bg, border:`1px solid ${c.border}`,
    }}>
      <span style={{fontSize:9}}>{c.icon}</span>{status}
    </span>
  );
};

const PriChip = ({ pri }) => {
  const c = PRI_CFG[pri] || PRI_CFG.Low;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"2px 8px", fontSize:10, fontWeight:800,
      letterSpacing:"0.04em", borderRadius:4,
      color:c.color, background:c.bg, border:`1px solid ${c.border}`,
      fontFamily:"monospace",
    }}>{c.symbol} {pri.toUpperCase()}</span>
  );
};

const TypeChip = ({ type }) => {
  const c = TYPE_CFG[type] || { color:C.textSec, bg:C.line2 };
  return (
    <span style={{
      display:"inline-flex", padding:"2px 8px", fontSize:10, fontWeight:700,
      letterSpacing:"0.04em", borderRadius:4,
      color:c.color, background:c.bg, border:`1px solid ${c.color}55`,
    }}>{type}</span>
  );
};

const Avt = ({ m, size=28 }) => {
  const colors = ["#1a56db","#0f766e","#7c3aed","#c2410c","#0369a1"];
  const bg = colors[((m?.id||1)-1) % colors.length];
  return (
    <div style={{
      width:size, height:size, borderRadius:6, background:bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.35, fontWeight:800, color:"#fff",
      flexShrink:0, boxShadow:"0 1px 3px rgba(0,0,0,0.15)",
      fontFamily:"monospace", letterSpacing:"0.05em",
    }}>{m?.abbr||"?"}</div>
  );
};

const Bar = ({ pct, color=C.accentBright, height=4 }) => (
  <div style={{ height, background:C.line, borderRadius:2, overflow:"hidden" }}>
    <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:2, transition:"width 0.4s" }} />
  </div>
);

const Panel = ({ children, style={}, className="" }) => (
  <div className={className} style={{
    background:C.panel,
    border:`1px solid ${C.line}`,
    borderRadius:8,
    boxShadow:"0 1px 4px rgba(26,86,219,0.06)",
    ...style
  }}>{children}</div>
);

const SectionHeader = ({ label, right }) => (
  <div style={{
    display:"flex", alignItems:"center",
    padding:"10px 16px", background:C.line2,
    borderBottom:`1px solid ${C.line}`,
    borderRadius:"8px 8px 0 0",
    fontFamily:"monospace", fontSize:11, fontWeight:800,
    letterSpacing:"0.1em", color:C.textSec,
  }}>
    <span style={{flex:1}}>{label}</span>
    {right && <span>{right}</span>}
  </div>
);

const Input = ({ style={}, ...props }) => (
  <input style={{
    background:"#fff", border:`1px solid ${C.line}`,
    color:C.textPrimary, padding:"7px 10px", fontSize:13,
    outline:"none", borderRadius:6, width:"100%",
    fontFamily:"'IBM Plex Sans Thai', sans-serif",
    ...style
  }} {...props} />
);

const Select = ({ children, style={}, ...props }) => (
  <select style={{
    background:"#fff", border:`1px solid ${C.line}`,
    color:C.textPrimary, padding:"7px 10px", fontSize:13,
    outline:"none", borderRadius:6,
    fontFamily:"'IBM Plex Sans Thai', sans-serif",
    ...style
  }} {...props}>{children}</select>
);

const Btn = ({ children, variant="primary", style={}, ...props }) => {
  const vs = {
    primary: { background:C.accent,  color:"#fff",       border:`1px solid ${C.accent}`,     boxShadow:"0 1px 4px rgba(26,86,219,0.25)" },
    ghost:   { background:"#fff",    color:C.textSec,    border:`1px solid ${C.line}` },
    danger:  { background:"#fee2e2", color:C.red,        border:`1px solid #fca5a5` },
    success: { background:"#dcfce7", color:C.green,      border:`1px solid #86efac` },
    ai:      { background:"#ede9fe", color:"#6d28d9",    border:"1px solid #c4b5fd" },
  };
  return (
    <button style={{
      ...vs[variant], padding:"7px 14px", fontSize:12, fontWeight:700,
      letterSpacing:"0.04em", borderRadius:6, cursor:"pointer",
      fontFamily:"monospace", display:"inline-flex", alignItems:"center", gap:6,
      transition:"all 0.15s", ...style
    }} {...props}>{children}</button>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────
export default function App() {
  const [issues, setIssues]     = useState(INIT_ISSUES);
  const [view,   setView]       = useState("dashboard");
  const [sel,    setSel]        = useState(null);
  const [types,  setTypes]      = useState([...ALL_TYPES]);
  const [notifs, setNotifs]     = useState([
    { id:1, text:"Issue #3 — Safety Press #3 ครบกำหนดพรุ่งนี้", level:"danger", read:false, ts:"05:23" },
    { id:2, text:"Issue #8 — เปลี่ยนสถานะ → รอตรวจสอบ",          level:"info",   read:false, ts:"08:41" },
    { id:3, text:"นภา กล่าวถึงคุณใน Issue #4",                    level:"info",   read:true,  ts:"11:05" },
  ]);
  const [showNotif, setShowNotif] = useState(false);
  const [aiState,   setAiState]   = useState({ open:false, loading:false, title:"", text:"" });
  const [showNew,   setShowNew]   = useState(false);
  const unread = notifs.filter(n=>!n.read).length;

  const upsert = upd => {
    setIssues(p=>p.map(i=>i.id===upd.id?upd:i));
    if (sel?.id===upd.id) setSel(upd);
  };
  const addIssue = iss => {
    const n={...iss, id:issues.length+1, acts:[], pct:0};
    setIssues(p=>[n,...p]);
    setShowNew(false);
  };
  const openDetail = iss => { setSel(iss); setView("detail"); };

  const callAI = async (title, prompt) => {
    setAiState({open:true,loading:true,title,text:""});
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{role:"user",content:prompt}]
        })
      });
      const d = await r.json();
      setAiState(s=>({...s,loading:false,text:d.content?.map(c=>c.text||"").join("\n")||"ไม่สามารถวิเคราะห์ได้"}));
    } catch(e){ setAiState(s=>({...s,loading:false,text:"ข้อผิดพลาด: "+e.message})); }
  };

  const aiSummary = () => {
    const open = issues.filter(i=>i.status!=="เสร็จแล้ว");
    callAI("สรุปสถานการณ์วันนี้",
      `คุณเป็น Production Manager AI วิเคราะห์ issue ต่อไปนี้ (วันนี้: ${new Date().toLocaleDateString("th-TH")}):
${JSON.stringify(open.map(i=>({id:i.id,title:i.title,status:i.status,priority:i.pri,dueDate:i.due,progress:i.pct+"%"})),null,2)}
สรุปเป็นภาษาไทยกระชับ: 1) ภาพรวมน่าเป็นห่วง 2) issue ใกล้ deadline 3) ลำดับความสำคัญที่แนะนำ`);
  };
  const aiReport = () => {
    callAI("รายงานประจำสัปดาห์",
      `เขียนรายงานสรุปประจำสัปดาห์ทีม PRODUCTION จาก:
${JSON.stringify(issues.map(i=>({id:i.id,title:i.title,type:i.type,status:i.status,pri:i.pri,assignee:mem(i.asgn)?.name,pct:i.pct+"%"})),null,2)}
รายงานภาษาไทย: บทสรุปภาพรวม, ประเภทปัญหาที่เกิดบ่อย, สถิติ, insight และคำแนะนำ`);
  };

  const exportCSV = () => {
    const rows=[["#","ชื่อปัญหา","ประเภท","ความสำคัญ","ผู้รับผิดชอบ","วันกำหนด","สถานะ","ความคืบหน้า"]];
    issues.forEach(i=>rows.push([i.id,i.title,i.type,i.pri,mem(i.asgn)?.name||"-",i.due,i.status,i.pct+"%"]));
    const blob=new Blob(["\uFEFF"+rows.map(r=>r.join(",")).join("\n")],{type:"text/csv;charset=utf-8;"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="issues.csv"; a.click();
  };

  const NAV=[
    {id:"dashboard",label:"DASHBOARD",    ico:"▦"},
    {id:"list",     label:"ISSUE LIST",   ico:"≡"},
    {id:"kanban",   label:"KANBAN",       ico:"⊞"},
    {id:"gantt",    label:"GANTT CHART",  ico:"▤"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.textPrimary,
      fontFamily:"'IBM Plex Sans Thai','Sarabun','Noto Sans Thai',sans-serif",
      display:"flex",flexDirection:"column"}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Sarabun:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${C.line2};}
        ::-webkit-scrollbar-thumb{background:${C.line};border-radius:2px;}
        button{cursor:pointer;} input,select,textarea{box-sizing:border-box;}
        .nav-btn:hover{background:${C.line2}!important;color:${C.accent}!important;}
        .nav-btn.active{background:${C.accentBright}!important;color:#fff!important;border-left:3px solid ${C.accent}!important;}
        .row-hover:hover{background:${C.line2}!important;}
        .k-card:hover{border-color:${C.accentBright}!important;transform:translateY(-1px);box-shadow:0 4px 12px rgba(26,86,219,0.12)!important;}
        .k-card{transition:all 0.15s;}
        .fade{animation:fd 0.2s ease;}
        @keyframes fd{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        input:focus,select:focus,textarea:focus{border-color:${C.accentBright}!important;outline:none;box-shadow:0 0 0 3px rgba(37,99,235,0.12)!important;}
        .grid-bg{
          background-image:
            linear-gradient(rgba(26,86,219,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(26,86,219,0.04) 1px,transparent 1px);
          background-size:32px 32px;
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{height:52,background:C.accent,borderBottom:`1px solid ${C.accent}`,
        display:"flex",alignItems:"center",padding:"0 20px",gap:16,
        position:"fixed",top:0,left:0,right:0,zIndex:100,
        boxShadow:"0 2px 8px rgba(26,86,219,0.25)"}}>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginRight:12}}>
          <div style={{width:34,height:34,background:"#fff",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:14,fontWeight:900,borderRadius:4,fontFamily:"monospace",
            color:C.accent,letterSpacing:"-1px",boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}>
            PT
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,letterSpacing:"0.1em",color:"#fff",fontFamily:"monospace"}}>PRODUCTION</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.65)",letterSpacing:"0.2em",fontFamily:"monospace"}}>ISSUE TRACKER v2.0</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{display:"flex",gap:1,flex:1}}>
          {NAV.map(n=>(
            <button key={n.id}
              className={`nav-btn${view===n.id?" active":""}`}
              onClick={()=>setView(n.id)}
              style={{
                background:view===n.id?"rgba(255,255,255,0.18)":"transparent",
                border:"none",borderLeft:"3px solid transparent",
                color:view===n.id?"#fff":"rgba(255,255,255,0.75)",
                padding:"0 14px",height:52,fontSize:11,
                fontWeight:700,letterSpacing:"0.1em",fontFamily:"monospace",
                display:"flex",alignItems:"center",gap:6,
                borderBottom:view===n.id?"3px solid #fff":"3px solid transparent",
              }}>
              <span style={{fontSize:13}}>{n.ico}</span>{n.label}
            </button>
          ))}
        </div>

        {/* Right tools */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Btn variant="ai" onClick={aiSummary} style={{fontSize:11,padding:"5px 12px",background:"rgba(255,255,255,0.12)",color:"#fff",border:"1px solid rgba(255,255,255,0.3)"}}>⬡ AI สรุป</Btn>
          <Btn variant="ai" onClick={aiReport}  style={{fontSize:11,padding:"5px 12px",background:"rgba(255,255,255,0.12)",color:"#fff",border:"1px solid rgba(255,255,255,0.3)"}}>⬡ รายงาน</Btn>
          <Btn variant="ghost" onClick={exportCSV} style={{fontSize:11,padding:"5px 12px",background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.25)"}}>↓ Export</Btn>
          <Btn variant="primary" onClick={()=>setShowNew(true)} style={{fontSize:11,padding:"5px 14px",background:"#fff",color:C.accent,border:"none",fontWeight:800}}>+ NEW ISSUE</Btn>

          {/* Notif */}
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowNotif(!showNotif)}
              style={{width:36,height:36,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.25)",
                borderRadius:4,color:"#fff",fontSize:16,display:"flex",
                alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              🔔
              {unread>0&&<span style={{position:"absolute",top:-4,right:-4,
                width:17,height:17,background:C.red,borderRadius:"50%",
                fontSize:9,fontWeight:800,color:"#fff",display:"flex",
                alignItems:"center",justifyContent:"center",fontFamily:"monospace",
                border:"2px solid #fff"}}>
                {unread}
              </span>}
            </button>
            {showNotif&&<NotifPanel notifs={notifs} onRead={id=>setNotifs(p=>p.map(n=>n.id===id?{...n,read:true}:n))} onClose={()=>setShowNotif(false)}/>}
          </div>

          {/* User */}
          <div style={{display:"flex",alignItems:"center",gap:8,
            padding:"4px 10px",background:"rgba(255,255,255,0.12)",
            border:"1px solid rgba(255,255,255,0.25)",borderRadius:4}}>
            <Avt m={{id:3,abbr:"ธน"}} size={26}/>
            <div style={{lineHeight:1.2}}>
              <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>ธนา สุขใจ</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.65)",letterSpacing:"0.05em"}}>SUPERVISOR</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="grid-bg" style={{marginTop:52,flex:1,padding:20,minHeight:"calc(100vh - 52px)"}}>
        <div className="fade" key={view}>
          {view==="dashboard" && <Dashboard issues={issues} onView={openDetail} onViewAll={()=>setView("list")}/>}
          {view==="list"      && <IssueList issues={issues} onView={openDetail} onUpdate={upsert} types={types} setTypes={setTypes}/>}
          {view==="kanban"    && <Kanban    issues={issues} onUpdate={upsert}  onView={openDetail}/>}
          {view==="gantt"     && <Gantt     issues={issues}/>}
          {view==="detail"    && sel && <Detail issue={sel} onUpdate={upsert} onBack={()=>setView("list")} callAI={callAI}/>}
        </div>
      </div>

      {/* ── MODALS ── */}
      {showNew && <NewIssueModal onClose={()=>setShowNew(false)} onSave={addIssue} types={types} setTypes={setTypes}/>}

      {aiState.open&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:24}}>
          <Panel style={{width:"100%",maxWidth:640,maxHeight:"80vh",overflow:"auto",borderRadius:4}} className="fade">
            <SectionHeader label={`⬡ AI — ${aiState.title}`} right={!aiState.loading&&
              <button onClick={()=>setAiState(s=>({...s,open:false}))} style={{background:"none",border:"none",color:C.textSec,fontSize:18,cursor:"pointer"}}>✕</button>}
            />
            <div style={{padding:20}}>
              {aiState.loading?(
                <div style={{textAlign:"center",padding:40}}>
                  <div style={{width:40,height:40,border:`3px solid ${C.line}`,borderTop:`3px solid ${C.accentBright}`,
                    borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  <div style={{color:C.textSec,fontSize:13,fontFamily:"monospace"}}>ANALYZING...</div>
                </div>
              ):(
                <div style={{fontSize:13,lineHeight:1.8,color:C.textPrimary,whiteSpace:"pre-wrap"}}>{aiState.text}</div>
              )}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

// ─── NOTIFICATION PANEL ──────────────────────────────────────
function NotifPanel({ notifs, onRead, onClose }) {
  const lvlColor = { danger:C.red, info:C.accentBright, warn:C.gold };
  return (
    <div style={{position:"absolute",right:0,top:46,width:320,
      background:C.panel,border:`1px solid ${C.line}`,
      borderTop:`3px solid ${C.accent}`,zIndex:300,
      boxShadow:"0 8px 24px rgba(26,86,219,0.15)",borderRadius:"0 0 8px 8px"}}>
      <SectionHeader label="NOTIFICATIONS" right={
        <button onClick={onClose} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:16}}>✕</button>}/>
      {notifs.map(n=>(
        <div key={n.id} onClick={()=>onRead(n.id)}
          style={{padding:"10px 14px",borderBottom:`1px solid ${C.line2}`,cursor:"pointer",
            background:n.read?"transparent":C.line2,
            display:"flex",gap:10,alignItems:"flex-start",transition:"background 0.15s"}}>
          <div style={{width:3,height:"100%",minHeight:32,background:lvlColor[n.level||"info"],borderRadius:2,flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:n.read?C.textMuted:C.textPrimary,lineHeight:1.5}}>{n.text}</div>
            <div style={{fontSize:10,color:C.textMuted,fontFamily:"monospace",marginTop:3}}>{n.ts}</div>
          </div>
          {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:C.accentBright,marginTop:5,flexShrink:0}}/>}
        </div>
      ))}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({ issues, onView, onViewAll }) {
  const total   = issues.length;
  const byS     = s => issues.filter(i=>i.status===s).length;
  const open    = byS("รอดำเนินการ");
  const prog    = byS("กำลังดำเนินการ");
  const rev     = byS("รอตรวจสอบ");
  const done    = byS("เสร็จแล้ว");
  const highOpen= issues.filter(i=>i.pri==="High"&&i.status!=="เสร็จแล้ว").length;

  const weekData=[{w:"W1",o:3,d:1},{w:"W2",o:5,d:2},{w:"W3",o:4,d:3},{w:"W4",o:6,d:4},{w:"W5",o:8,d:5},{w:"NOW",o:open+prog+rev,d:done}];
  const wMax=Math.max(...weekData.map(x=>x.o+x.d),1);

  const typeStats=ALL_TYPES.map(t=>({t,n:issues.filter(i=>i.type===t).length})).filter(x=>x.n>0);
  const recent=[...issues].sort((a,b)=>b.id-a.id).slice(0,5);
  const nearDL=issues.filter(i=>{const d=dLeft(i.due);return d!==null&&d<=3&&d>=0&&i.status!=="เสร็จแล้ว";});

  const STAT_CARDS=[
    {label:"TOTAL",           val:total,    color:C.accent,  bg:"#dbeafe", sub:"Issue ทั้งหมด"},
    {label:"รอดำเนินการ",     val:open,     color:"#475569", bg:"#f1f5f9", sub:"PENDING"},
    {label:"กำลังดำเนินการ",  val:prog,     color:"#1d4ed8", bg:"#dbeafe", sub:"IN PROGRESS"},
    {label:"รอตรวจสอบ",       val:rev,      color:"#b45309", bg:"#fef3c7", sub:"REVIEW"},
    {label:"เสร็จแล้ว",       val:done,     color:"#15803d", bg:"#dcfce7", sub:"COMPLETE"},
    {label:"HIGH PRIORITY",   val:highOpen, color:"#b91c1c", bg:"#fee2e2", sub:"ยังเปิดอยู่"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Stat row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
        {STAT_CARDS.map(s=>(
          <div key={s.label} style={{
            background:s.bg, border:`1px solid ${s.color}33`,
            borderLeft:`4px solid ${s.color}`,
            borderRadius:8, padding:"14px 16px",
            boxShadow:"0 1px 4px rgba(0,0,0,0.06)"
          }}>
            <div style={{fontSize:9,fontFamily:"monospace",fontWeight:800,letterSpacing:"0.1em",color:s.color,marginBottom:6,opacity:0.8}}>{s.label}</div>
            <div style={{fontSize:34,fontWeight:800,color:s.color,fontFamily:"monospace",lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:10,color:s.color,fontFamily:"monospace",marginTop:4,opacity:0.7}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        {/* Weekly Bar Chart */}
        <Panel>
          <SectionHeader label="WEEKLY TREND — ISSUES" right={<span style={{fontSize:10,color:C.textMuted}}>● เปิด  ○ เสร็จ</span>}/>
          <div style={{padding:16}}>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120}}>
              {weekData.map((d,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{width:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end",height:100,gap:1}}>
                    <div style={{width:"100%",background:C.accentBright,opacity:0.85,
                      height:`${(d.o/wMax)*80}px`,minHeight:d.o?2:0,borderRadius:"3px 3px 0 0"}}/>
                    <div style={{width:"100%",background:C.green,opacity:0.75,
                      height:`${(d.d/wMax)*80}px`,minHeight:d.d?2:0,borderRadius:"0 0 3px 3px"}}/>
                  </div>
                  <div style={{fontSize:9,color:i===5?C.accent:C.textMuted,fontFamily:"monospace",fontWeight:i===5?800:400}}>{d.w}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Type breakdown */}
        <Panel>
          <SectionHeader label="BREAKDOWN BY TYPE"/>
          <div style={{padding:12,display:"flex",flexDirection:"column",gap:8}}>
            {typeStats.map(({t,n})=>{
              const c=TYPE_CFG[t];
              return (
                <div key={t}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <TypeChip type={t}/>
                    <span style={{fontSize:12,fontFamily:"monospace",fontWeight:800,color:c?.color||C.textSec}}>{n}</span>
                  </div>
                  <Bar pct={(n/total)*100} color={c?.color||C.accentBright} height={3}/>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Recent */}
        <Panel>
          <SectionHeader label="RECENT ISSUES" right={<button onClick={onViewAll} style={{background:"none",border:"none",color:C.accentBright,fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>VIEW ALL →</button>}/>
          {recent.map(i=>(
            <div key={i.id} className="row-hover"
              onClick={()=>onView(i)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:`1px solid ${C.line2}`,cursor:"pointer"}}>
              <span style={{fontFamily:"monospace",fontSize:10,color:C.textMuted,width:24,flexShrink:0}}>#{i.id}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:C.textPrimary,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{i.title}</div>
                <TypeChip type={i.type}/>
              </div>
              <StatusChip status={i.status}/>
            </div>
          ))}
        </Panel>

        {/* Near deadline + Workload */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Panel style={{flex:1}}>
            <SectionHeader label="⚠ NEAR DEADLINE"/>
            {nearDL.length===0?(
              <div style={{padding:20,textAlign:"center",color:C.textMuted,fontSize:12,fontFamily:"monospace"}}>NO CRITICAL DEADLINES</div>
            ):nearDL.map(i=>{
              const d=dLeft(i.due);
              return (
                <div key={i.id} className="row-hover" onClick={()=>onView(i)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",
                    borderBottom:`1px solid ${C.line2}`,cursor:"pointer",
                    borderLeft:`3px solid ${d===0?C.red:C.gold}`}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.textPrimary}}>{i.title}</div>
                    <div style={{fontSize:10,fontFamily:"monospace",color:d===0?C.red:C.gold,marginTop:2}}>
                      {d===0?"TODAY!":"D-"+d+" ("+fmt(i.due)+")"}
                    </div>
                  </div>
                  <PriChip pri={i.pri}/>
                </div>
              );
            })}
          </Panel>

          <Panel>
            <SectionHeader label="TEAM WORKLOAD"/>
            <div style={{padding:12}}>
              {MEMBERS.map(m=>{
                const load=issues.filter(i=>i.asgn===m.id&&i.status!=="เสร็จแล้ว").length;
                const c=load>=3?C.red:load>=2?C.gold:C.green;
                return (
                  <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <Avt m={m} size={24}/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                        <span style={{color:C.textPrimary}}>{m.name}</span>
                        <span style={{fontFamily:"monospace",color:c,fontWeight:800}}>{load}</span>
                      </div>
                      <Bar pct={Math.min(load*25,100)} color={c} height={3}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ─── ISSUE LIST ───────────────────────────────────────────────
function IssueList({ issues, onView, onUpdate, types, setTypes }) {
  const [q,    setQ]    = useState("");
  const [fTyp, setFTyp] = useState("ALL");
  const [fSt,  setFSt]  = useState("ALL");
  const [fPri, setFPri] = useState("ALL");
  const [editing, setEditing] = useState({});
  const [planId,  setPlanId]  = useState(null);

  const list = issues.filter(i=>{
    const mq = i.title.toLowerCase().includes(q.toLowerCase())||i.desc?.toLowerCase().includes(q.toLowerCase());
    return mq
      && (fTyp==="ALL"||i.type===fTyp)
      && (fSt==="ALL" ||i.status===fSt)
      && (fPri==="ALL"||i.pri===fPri);
  });

  const startEdit = i => setEditing(p=>({...p,[i.id]:i.status}));
  const save      = i => {
    if (editing[i.id]!==undefined && editing[i.id]!==i.status) onUpdate({...i,status:editing[i.id]});
    setEditing(p=>{const n={...p};delete n[i.id];return n;});
  };

  const MONTHS=["2025-06","2025-07"]; const WEEKS=["W1","W2","W3","W4"];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Filter bar */}
      <Panel>
        <div style={{padding:"10px 14px",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:"1 1 200px"}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.textMuted,fontSize:13}}>⌕</span>
            <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="SEARCH ISSUES..." style={{paddingLeft:30,fontSize:12,fontFamily:"monospace"}}/>
          </div>
          {[
            {label:"TYPE",   val:fTyp, set:setFTyp, opts:["ALL",...types]},
            {label:"STATUS", val:fSt,  set:setFSt,  opts:["ALL",...ALL_STATUSES]},
            {label:"PRI",    val:fPri, set:setFPri,  opts:["ALL",...ALL_PRI]},
          ].map(({label,val,set,opts})=>(
            <Select key={label} value={val} onChange={e=>set(e.target.value)} style={{fontSize:11,fontFamily:"monospace",padding:"7px 10px",minWidth:130}}>
              {opts.map(o=><option key={o} value={o}>{label}: {o}</option>)}
            </Select>
          ))}
          <div style={{fontFamily:"monospace",fontSize:11,color:C.textMuted,marginLeft:"auto"}}>
            {list.length}/{issues.length} RECORDS
          </div>
        </div>
      </Panel>

      {/* Table */}
      <Panel>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:C.line2}}>
                {["#","TITLE / ISSUE","TYPE","PRIORITY","ASSIGNED TO","DUE DATE","PROGRESS","STATUS","PLAN"].map(h=>(
                  <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:800,
                    letterSpacing:"0.1em",color:C.textMuted,fontFamily:"monospace",
                    borderBottom:`1px solid ${C.line}`,whiteSpace:"nowrap"}}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((i,idx)=>{
                const m=mem(i.asgn);
                const dl=dLeft(i.due);
                const isEd=i.id in editing;
                const urgent=dl!==null&&dl<=2&&i.status!=="เสร็จแล้ว";
                return (
                  <tr key={i.id} className="row-hover"
                    style={{borderBottom:`1px solid ${C.line2}`,background:idx%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                    <td style={{padding:"10px 12px",fontFamily:"monospace",fontSize:10,color:C.textMuted,width:36}}>
                      {String(i.id).padStart(3,"0")}
                    </td>
                    <td style={{padding:"10px 12px",maxWidth:260}}>
                      <button onClick={()=>onView(i)}
                        style={{background:"none",border:"none",color:C.textPrimary,fontSize:12,
                          fontWeight:600,textAlign:"left",cursor:"pointer",lineHeight:1.4,
                          display:"block",width:"100%"}}>
                        {i.title}
                      </button>
                    </td>
                    <td style={{padding:"10px 12px",whiteSpace:"nowrap"}}><TypeChip type={i.type}/></td>
                    <td style={{padding:"10px 12px"}}><PriChip pri={i.pri}/></td>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <Avt m={m} size={22}/>
                        <span style={{fontSize:11,color:C.textSec,whiteSpace:"nowrap"}}>{m?.name||"—"}</span>
                      </div>
                    </td>
                    <td style={{padding:"10px 12px",fontFamily:"monospace",fontSize:11,whiteSpace:"nowrap",
                      color:urgent?C.red:C.textSec,fontWeight:urgent?800:400}}>
                      {fmt(i.due)}{urgent&&<div style={{fontSize:9,color:C.red}}>D-{dl}</div>}
                    </td>
                    <td style={{padding:"10px 12px",width:100}}>
                      <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec,marginBottom:3}}>{i.pct}%</div>
                      <Bar pct={i.pct} color={i.pct===100?C.green:C.accentBright}/>
                    </td>
                    <td style={{padding:"10px 12px"}}>
                      {isEd?(
                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                          <Select value={editing[i.id]} onChange={e=>setEditing(p=>({...p,[i.id]:e.target.value}))} style={{fontSize:11,padding:"4px 6px"}}>
                            {ALL_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                          </Select>
                          <div style={{display:"flex",gap:4}}>
                            <Btn variant="success" onClick={()=>save(i)} style={{flex:1,fontSize:10,padding:"4px 8px",justifyContent:"center"}}>บันทึก</Btn>
                            <Btn variant="ghost"   onClick={()=>setEditing(p=>{const n={...p};delete n[i.id];return n;})} style={{flex:1,fontSize:10,padding:"4px 8px",justifyContent:"center"}}>ยกเลิก</Btn>
                          </div>
                        </div>
                      ):(
                        <button onClick={()=>startEdit(i)} style={{background:"none",border:"none",cursor:"pointer"}}>
                          <StatusChip status={i.status}/>
                        </button>
                      )}
                    </td>
                    <td style={{padding:"10px 12px"}}>
                      <button onClick={()=>setPlanId(planId===i.id?null:i.id)}
                        style={{background:"none",border:`1px solid ${C.line}`,color:C.textMuted,
                          fontSize:10,padding:"3px 8px",borderRadius:2,cursor:"pointer",
                          fontFamily:"monospace",letterSpacing:"0.06em"}}>
                        ▤ PLAN
                      </button>
                    </td>
                  </tr>
                );
              })}
              {list.length===0&&(
                <tr><td colSpan={9} style={{padding:40,textAlign:"center",color:C.textMuted,fontFamily:"monospace",fontSize:12}}>
                  — NO RECORDS FOUND —
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Monthly plan */}
      {planId&&(()=>{
        const i=issues.find(x=>x.id===planId); if(!i) return null;
        return (
          <Panel className="fade">
            <SectionHeader label={`MONTHLY SCHEDULE — #${i.id} ${i.title}`}
              right={<button onClick={()=>setPlanId(null)} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer"}}>✕</button>}/>
            <div style={{overflowX:"auto",padding:12}}>
              <table style={{borderCollapse:"collapse",fontSize:11}}>
                <thead>
                  <tr>
                    <th style={{padding:"6px 12px",fontFamily:"monospace",fontWeight:800,fontSize:9,letterSpacing:"0.1em",color:C.textMuted,textAlign:"left",width:80}}>MONTH</th>
                    {WEEKS.map(w=>(
                      <th key={w} style={{padding:"6px 20px",fontFamily:"monospace",fontWeight:800,fontSize:9,letterSpacing:"0.1em",color:C.textMuted,textAlign:"center",borderLeft:`1px solid ${C.line2}`}}>
                        {w}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map(mo=>(
                    <tr key={mo} style={{borderTop:`1px solid ${C.line2}`}}>
                      <td style={{padding:"8px 12px",fontFamily:"monospace",fontSize:10,color:C.textMuted}}>{mo}</td>
                      {WEEKS.map(w=>{
                        const key=`${mo}-${w}`;
                        const val=i.sw?.[key]||"";
                        return (
                          <td key={w} style={{padding:"8px 12px",borderLeft:`1px solid ${C.line2}`,textAlign:"center"}}>
                            {val?(
                              <span style={{background:C.accent+"30",color:C.accentBright,
                                padding:"3px 10px",borderRadius:2,fontSize:11,fontWeight:700,
                                border:`1px solid ${C.accent}55`,display:"inline-block"}}>
                                {val}
                              </span>
                            ):(
                              <span style={{color:C.textMuted,fontSize:10,fontFamily:"monospace"}}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        );
      })()}
    </div>
  );
}

// ─── KANBAN ───────────────────────────────────────────────────
function Kanban({ issues, onUpdate, onView }) {
  const [dragging, setDragging] = useState(null);
  const [over,     setOver]     = useState(null);

  const COL_ICONS={"รอดำเนินการ":"○","กำลังดำเนินการ":"◉","รอตรวจสอบ":"◈","เสร็จแล้ว":"◆"};

  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
      {ALL_STATUSES.map(st=>{
        const col=issues.filter(i=>i.status===st);
        const cfg=STATUS_CFG[st];
        return (
          <div key={st}
            onDragOver={e=>{e.preventDefault();setOver(st);}}
            onDrop={e=>{e.preventDefault();if(dragging&&dragging.status!==st)onUpdate({...dragging,status:st});setDragging(null);setOver(null);}}
            onDragLeave={()=>setOver(null)}
            style={{display:"flex",flexDirection:"column",gap:8}}>

            {/* Column header */}
            <div style={{background:C.panel,border:`1px solid ${C.line}`,
              borderTop:`3px solid ${cfg.color}`,padding:"10px 14px",
              borderRadius:"8px 8px 0 0",
              display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:"monospace",fontSize:14,color:cfg.color}}>{COL_ICONS[st]}</span>
                <span style={{fontSize:12,fontWeight:700,color:C.textPrimary}}>{st}</span>
              </div>
              <span style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:cfg.color,
                background:cfg.bg,border:`1px solid ${cfg.border}`,padding:"1px 8px",borderRadius:10}}>
                {col.length}
              </span>
            </div>

            {/* Drop zone */}
            <div style={{
              minHeight:400,padding:4,borderRadius:"0 0 8px 8px",
              background:over===st?C.line2:"transparent",
              border:over===st?`2px dashed ${C.accentBright}`:"2px dashed transparent",
              transition:"all 0.15s",display:"flex",flexDirection:"column",gap:8
            }}>
              {col.map(i=>{
                const m=mem(i.asgn);
                const dl=dLeft(i.due);
                const urgent=dl!==null&&dl<=2&&i.status!=="เสร็จแล้ว";
                return (
                  <div key={i.id} className="k-card"
                    draggable
                    onDragStart={()=>setDragging(i)}
                    onDragEnd={()=>{setDragging(null);setOver(null);}}
                    onClick={()=>onView(i)}
                    style={{
                      background:"#fff",
                      border:`1px solid ${urgent?C.red:C.line}`,
                      borderRadius:8,
                      padding:"10px 12px",cursor:"pointer",
                      borderLeft:`4px solid ${urgent?C.red:PRI_CFG[i.pri]?.color||C.line}`,
                      opacity:dragging?.id===i.id?0.5:1,
                      boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
                    }}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontFamily:"monospace",fontSize:9,color:C.textMuted}}>#{String(i.id).padStart(3,"0")}</span>
                      <PriChip pri={i.pri}/>
                    </div>
                    <div style={{fontSize:12,fontWeight:600,color:C.textPrimary,lineHeight:1.4,marginBottom:8}}>{i.title}</div>
                    <TypeChip type={i.type}/>
                    <div style={{marginTop:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:3}}>
                        <span style={{color:C.textMuted,fontFamily:"monospace"}}>PROGRESS</span>
                        <span style={{color:C.textSec,fontFamily:"monospace"}}>{i.pct}%</span>
                      </div>
                      <Bar pct={i.pct} color={i.pct===100?C.green:C.accentBright}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <Avt m={m} size={20}/>
                        <span style={{fontSize:10,color:C.textSec}}>{m?.name?.split(" ")[0]}</span>
                      </div>
                      <span style={{fontSize:10,fontFamily:"monospace",color:urgent?C.red:C.textMuted}}>{fmt(i.due)}</span>
                    </div>
                  </div>
                );
              })}

              {col.length===0&&(
                <div style={{padding:20,textAlign:"center",fontFamily:"monospace",fontSize:10,
                  color:C.textMuted,border:`1px dashed ${C.line2}`,borderRadius:2}}>
                  DROP HERE
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── GANTT ────────────────────────────────────────────────────
function Gantt({ issues }) {
  const now     = new Date();
  const start   = new Date(now); start.setDate(1);
  const DAYS    = 60;
  const days    = Array.from({length:DAYS},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d;});
  const todayIdx= days.findIndex(d=>d.toDateString()===now.toDateString());

  const weeks=[];
  days.forEach((d,i)=>{
    if(d.getDay()===1||i===0){
      if(weeks.length)weeks[weeks.length-1].end=i-1;
      weeks.push({start:i,end:DAYS-1,lbl:d.toLocaleDateString("th-TH",{day:"numeric",month:"short"})});
    }
  });

  const getBar=i=>{
    const s=days.findIndex(d=>d.toDateString()===new Date(i.s).toDateString());
    const e=days.findIndex(d=>d.toDateString()===new Date(i.due).toDateString());
    return {si:Math.max(0,s<0?0:s), ei:Math.min(DAYS-1,e<0?DAYS-1:e)};
  };

  const PRI_BAR={High:C.red,Medium:C.gold,Low:C.green};

  return (
    <Panel>
      <SectionHeader label="GANTT CHART — 60 DAY VIEW" right={`TODAY: ${now.toLocaleDateString("th-TH")}`}/>
      <div style={{overflowX:"auto"}}>
        <div style={{minWidth:900}}>
          {/* Week headers */}
          <div style={{display:"flex",borderBottom:`1px solid ${C.line}`}}>
            <div style={{width:220,flexShrink:0,padding:"6px 14px",fontSize:9,fontFamily:"monospace",color:C.textMuted,letterSpacing:"0.1em"}}>ISSUE</div>
            <div style={{flex:1,position:"relative",display:"flex"}}>
              {weeks.map((w,wi)=>(
                <div key={wi}
                  style={{
                    width:`${((w.end-w.start+1)/DAYS)*100}%`,
                    padding:"6px 4px",fontSize:9,fontFamily:"monospace",
                    color:C.textMuted,borderLeft:`1px solid ${C.line2}`,
                    letterSpacing:"0.05em",overflow:"hidden",whiteSpace:"nowrap"
                  }}>
                  {w.lbl}
                </div>
              ))}
            </div>
          </div>

          {/* Issue rows */}
          {issues.map((i,idx)=>{
            const m=mem(i.asgn);
            const {si,ei}=getBar(i);
            return (
              <div key={i.id} className="row-hover"
                style={{display:"flex",borderBottom:`1px solid ${C.line2}`,
                  background:idx%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                <div style={{width:220,flexShrink:0,padding:"8px 14px",display:"flex",alignItems:"center",gap:6}}>
                  <Avt m={m} size={22}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.textPrimary,
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{i.title}</div>
                    <div style={{fontSize:9,color:C.textMuted,fontFamily:"monospace"}}>{m?.name}</div>
                  </div>
                </div>
                <div style={{flex:1,position:"relative",padding:"8px 0",borderLeft:`1px solid ${C.line2}`}}>
                  {/* Today line */}
                  {todayIdx>=0&&<div style={{position:"absolute",top:0,bottom:0,width:1,
                    background:C.red+"88",left:`${(todayIdx/DAYS)*100}%`,zIndex:2}}/>}
                  {/* Bar */}
                  <div style={{position:"absolute",top:"50%",transform:"translateY(-50%)",
                    left:`${(si/DAYS)*100}%`,width:`${((ei-si+1)/DAYS)*100}%`,
                    height:20,borderRadius:2,background:`${PRI_BAR[i.pri]}33`,
                    border:`1px solid ${PRI_BAR[i.pri]}88`,overflow:"hidden"}}>
                    <div style={{width:`${i.pct}%`,height:"100%",background:`${PRI_BAR[i.pri]}66`}}/>
                    <span style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",
                      fontSize:9,fontFamily:"monospace",color:"#fff",fontWeight:800,whiteSpace:"nowrap"}}>
                      {i.pct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

// ─── ISSUE DETAIL ─────────────────────────────────────────────
function Detail({ issue, onUpdate, onBack, callAI }) {
  const [cmt, setCmt] = useState("");
  const m = mem(issue.asgn);

  const addCmt = () => {
    if(!cmt.trim()) return;
    const updated={
      ...issue,
      acts:[...issue.acts,{id:Date.now(),kind:"comment",txt:`💬 "${cmt}"`,date:new Date().toISOString().split("T")[0],by:"ธนา"}],
    };
    onUpdate(updated); setCmt("");
  };

  const aiAssignee = () => {
    const wl=MEMBERS.map(m2=>({name:m2.name,skills:m2.skills,open:INIT_ISSUES.filter(x=>x.asgn===m2.id&&x.status!=="เสร็จแล้ว").length}));
    callAI("AI แนะนำผู้รับผิดชอบ",
      `แนะนำผู้รับผิดชอบ issue: "${issue.title}" ประเภท ${issue.type} priority ${issue.pri}
ทีมงาน: ${JSON.stringify(wl,null,2)}
ตอบสั้นๆ ภาษาไทย แนะนำ 1-2 คน พร้อมเหตุผล`);
  };

  const MONTHS=["2025-06","2025-07"]; const WEEKS=["W1","W2","W3","W4"];
  const KIND_ICON={status:"▶",comment:"◇",file:"▣"};

  return (
    <div style={{maxWidth:1100}}>
      <button onClick={onBack}
        style={{background:"none",border:`1px solid ${C.line}`,color:C.textSec,
          padding:"6px 14px",fontSize:11,fontFamily:"monospace",letterSpacing:"0.1em",
          cursor:"pointer",marginBottom:16,borderRadius:2,display:"inline-flex",alignItems:"center",gap:6}}>
        ← BACK TO LIST
      </button>

      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
        {/* Left */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Header card */}
          <Panel>
            <div style={{padding:20}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:12}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontFamily:"monospace",fontSize:11,color:C.textMuted}}>#{String(issue.id).padStart(3,"0")}</span>
                    <TypeChip type={issue.type}/>
                    <PriChip pri={issue.pri}/>
                  </div>
                  <h2 style={{fontSize:18,fontWeight:700,color:"#fff",lineHeight:1.3}}>{issue.title}</h2>
                </div>
                <StatusChip status={issue.status}/>
              </div>
              <p style={{fontSize:13,color:C.textSec,lineHeight:1.7}}>{issue.desc}</p>

              {/* Image area */}
              <div style={{marginTop:16,border:`1px dashed ${C.line}`,padding:24,textAlign:"center",background:C.card}}>
                {issue.img?<img src={issue.img} alt="" style={{maxHeight:200,borderRadius:2,margin:"0 auto"}}/>:
                <div style={{color:C.textMuted,fontSize:12,fontFamily:"monospace"}}>
                  <div style={{fontSize:32,marginBottom:8}}>▣</div>
                  NO IMAGE ATTACHED
                </div>}
              </div>
            </div>
          </Panel>

          {/* Progress */}
          <Panel>
            <SectionHeader label="PROGRESS"/>
            <div style={{padding:16,display:"flex",alignItems:"center",gap:16}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:"monospace",marginBottom:6}}>
                  <span style={{color:C.textMuted}}>COMPLETION</span>
                  <span style={{color:issue.pct===100?C.green:C.accentBright,fontWeight:800}}>{issue.pct}%</span>
                </div>
                <Bar pct={issue.pct} color={issue.pct===100?C.green:C.accentBright} height={8}/>
              </div>
              <Input
                type="number" min={0} max={100} value={issue.pct}
                onChange={e=>onUpdate({...issue,pct:Math.min(100,Math.max(0,Number(e.target.value)))})}
                style={{width:60,textAlign:"center",fontFamily:"monospace",fontWeight:800}}
              />
              <span style={{fontSize:11,color:C.textMuted,fontFamily:"monospace"}}>%</span>
            </div>
          </Panel>

          {/* Schedule */}
          <Panel>
            <SectionHeader label="MONTHLY SCHEDULE"/>
            <div style={{overflowX:"auto",padding:12}}>
              <table style={{borderCollapse:"collapse",width:"100%",fontSize:11}}>
                <thead>
                  <tr>
                    <th style={{padding:"6px 12px",fontFamily:"monospace",fontSize:9,letterSpacing:"0.1em",color:C.textMuted,textAlign:"left",width:80}}>MONTH</th>
                    {WEEKS.map(w=><th key={w} style={{padding:"6px 16px",fontFamily:"monospace",fontSize:9,letterSpacing:"0.1em",color:C.textMuted,textAlign:"center",borderLeft:`1px solid ${C.line2}`}}>{w}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map(mo=>(
                    <tr key={mo} style={{borderTop:`1px solid ${C.line2}`}}>
                      <td style={{padding:"8px 12px",fontFamily:"monospace",fontSize:10,color:C.textMuted}}>{mo}</td>
                      {WEEKS.map(w=>{
                        const val=issue.sw?.[`${mo}-${w}`]||"";
                        return (
                          <td key={w} style={{padding:"8px 12px",borderLeft:`1px solid ${C.line2}`,textAlign:"center"}}>
                            {val?<span style={{background:C.accent+"25",color:C.accentBright,padding:"3px 10px",borderRadius:2,fontSize:11,fontWeight:700,border:`1px solid ${C.accent}44`}}>{val}</span>
                              :<span style={{color:C.line,fontFamily:"monospace"}}>—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Activity */}
          <Panel>
            <SectionHeader label="ACTIVITY LOG"/>
            <div style={{padding:16}}>
              {issue.acts.length===0?(
                <div style={{textAlign:"center",color:C.textMuted,fontSize:11,fontFamily:"monospace",padding:16}}>— NO ACTIVITY —</div>
              ):issue.acts.map(a=>(
                <div key={a.id} style={{display:"flex",gap:12,marginBottom:12}}>
                  <div style={{width:28,height:28,background:C.line2,border:`1px solid ${C.line}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:12,fontFamily:"monospace",color:C.textMuted,flexShrink:0,borderRadius:2}}>
                    {KIND_ICON[a.kind]||"●"}
                  </div>
                  <div style={{flex:1,borderBottom:`1px solid ${C.line2}`,paddingBottom:10}}>
                    <div style={{fontSize:12,color:C.textPrimary}}>{a.txt}</div>
                    <div style={{fontSize:10,fontFamily:"monospace",color:C.textMuted,marginTop:3}}>
                      {a.by} · {fmt(a.date)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Comment input */}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <Input value={cmt} onChange={e=>setCmt(e.target.value)}
                  placeholder="ADD COMMENT..." onKeyDown={e=>e.key==="Enter"&&addCmt()}
                  style={{flex:1,fontSize:12}}/>
                <Btn variant="primary" onClick={addCmt} style={{whiteSpace:"nowrap"}}>SEND</Btn>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right sidebar */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Info */}
          <Panel>
            <SectionHeader label="ISSUE INFO"/>
            <div style={{padding:12}}>
              {[
                ["ID",      `#${String(issue.id).padStart(3,"0")}`],
                ["START",   fmt(issue.s)],
                ["DUE",     fmt(issue.due)],
                ["TYPE",    issue.type],
                ["PRIORITY",issue.pri],
              ].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",
                  padding:"7px 0",borderBottom:`1px solid ${C.line2}`,fontSize:11}}>
                  <span style={{fontFamily:"monospace",fontSize:9,letterSpacing:"0.1em",color:C.textMuted}}>{k}</span>
                  <span style={{color:C.textPrimary,fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Assignee */}
          <Panel>
            <SectionHeader label="ASSIGNED TO"/>
            <div style={{padding:14}}>
              {m?(
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <Avt m={m} size={36}/>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{m.name}</div>
                      <div style={{fontSize:10,fontFamily:"monospace",color:C.textMuted,letterSpacing:"0.06em"}}>{m.role}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {m.skills.map(s=>(
                      <span key={s} style={{fontSize:9,fontFamily:"monospace",
                        background:C.accent+"22",color:C.accentBright,
                        padding:"2px 8px",borderRadius:2,border:`1px solid ${C.accent}44`}}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <Btn variant="ai" onClick={aiAssignee} style={{width:"100%",justifyContent:"center",marginTop:10,fontSize:10}}>
                    ⬡ AI แนะนำผู้รับผิดชอบ
                  </Btn>
                </div>
              ):<div style={{color:C.textMuted,fontSize:11,fontFamily:"monospace"}}>UNASSIGNED</div>}
            </div>
          </Panel>

          {/* Status change */}
          <Panel>
            <SectionHeader label="CHANGE STATUS"/>
            <div style={{padding:12,display:"flex",flexDirection:"column",gap:6}}>
              {ALL_STATUSES.map(s=>{
                const cfg=STATUS_CFG[s];
                const active=issue.status===s;
                return (
                  <button key={s}
                    onClick={()=>onUpdate({...issue,status:s,acts:[...issue.acts,{id:Date.now(),kind:"status",txt:`เปลี่ยนสถานะ → ${s}`,date:new Date().toISOString().split("T")[0],by:"ธนา"}]})}
                    style={{
                      display:"flex",alignItems:"center",gap:8,
                      padding:"9px 12px",borderRadius:2,cursor:"pointer",
                      background:active?cfg.bg:"transparent",
                      border:`1px solid ${active?cfg.border:C.line2}`,
                      color:active?cfg.color:C.textSec,
                      fontWeight:active?800:400,fontSize:12,
                      fontFamily:"'IBM Plex Sans Thai','Sarabun',sans-serif",
                      transition:"all 0.15s",textAlign:"left",
                    }}>
                    <span style={{fontFamily:"monospace",fontSize:11}}>{cfg.icon}</span>
                    {s}
                    {active&&<span style={{marginLeft:"auto",fontFamily:"monospace",fontSize:9,letterSpacing:"0.08em"}}>CURRENT</span>}
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ─── NEW ISSUE MODAL ─────────────────────────────────────────
function NewIssueModal({ onClose, onSave, types, setTypes }) {
  const [f, setF] = useState({
    title:"", desc:"", type:types[0], pri:"Medium",
    asgn:1, s:new Date().toISOString().split("T")[0],
    due:"", status:"รอดำเนินการ", sw:{}, img:null,
  });
  const [newType, setNewType] = useState("");
  const [sched, setSched]     = useState({mo:"2025-06",wk:"W1",lbl:""});
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  const addType = () => {
    if(newType.trim()&&!types.includes(newType.trim())){
      setTypes(p=>[...p,newType.trim()]); set("type",newType.trim()); setNewType("");
    }
  };
  const addSched = () => {
    const key=`${sched.mo}-${sched.wk}`;
    set("sw",{...f.sw,[key]:sched.lbl});
    setSched(p=>({...p,lbl:""}));
  };
  const handleImg = e => {
    const file=e.target.files[0];
    if(file){const r=new FileReader();r.onload=ev=>set("img",ev.target.result);r.readAsDataURL(file);}
  };

  const MONTHS=["2025-06","2025-07","2025-08"]; const WEEKS=["W1","W2","W3","W4"];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
      <Panel style={{width:"100%",maxWidth:680,maxHeight:"90vh",overflow:"auto"}} className="fade">

        {/* Modal header */}
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.line}`,
          display:"flex",justifyContent:"space-between",alignItems:"center",
          background:C.accent,position:"sticky",top:0,zIndex:10,
          borderRadius:"8px 8px 0 0"}}>
          <span style={{fontFamily:"monospace",fontSize:12,fontWeight:800,letterSpacing:"0.1em",color:"#fff"}}>
            + CREATE NEW ISSUE
          </span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",fontSize:16,cursor:"pointer",width:28,height:28,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        <div style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>

          {/* Title */}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:C.textSec,display:"block",marginBottom:6}}>ชื่อปัญหา *</label>
            <Input value={f.title} onChange={e=>set("title",e.target.value)} placeholder="ระบุชื่อปัญหา..."/>
          </div>

          {/* Description */}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:C.textSec,display:"block",marginBottom:6}}>รายละเอียด</label>
            <textarea value={f.desc} onChange={e=>set("desc",e.target.value)} rows={3} placeholder="รายละเอียด..."
              style={{background:"#fff",border:`1px solid ${C.line}`,color:C.textPrimary,
                padding:"8px 10px",fontSize:13,width:"100%",borderRadius:6,resize:"vertical",
                fontFamily:"'IBM Plex Sans Thai','Sarabun',sans-serif"}}/>
          </div>

          {/* Type + Priority */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.textSec,display:"block",marginBottom:6}}>ประเภท</label>
              <div style={{display:"flex",gap:6}}>
                <Select value={f.type} onChange={e=>set("type",e.target.value)} style={{flex:1}}>
                  {types.map(t=><option key={t} value={t}>{t}</option>)}
                </Select>
                <Btn variant="ghost" onClick={()=>{
                  const n=prompt("ชื่อประเภทใหม่:");
                  if(n&&n.trim()&&!types.includes(n.trim())){setTypes(p=>[...p,n.trim()]);set("type",n.trim());}
                }} style={{padding:"7px 10px",fontSize:13}}>+</Btn>
              </div>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.textSec,display:"block",marginBottom:6}}>ความสำคัญ</label>
              <div style={{display:"flex",gap:6}}>
                {ALL_PRI.map(p=>{
                  const c=PRI_CFG[p];
                  return (
                    <button key={p} onClick={()=>set("pri",p)}
                      style={{flex:1,padding:"8px 4px",borderRadius:6,cursor:"pointer",fontSize:11,
                        fontWeight:700,
                        background:f.pri===p?c.bg:"#fff",
                        color:f.pri===p?c.color:C.textMuted,
                        border:`1px solid ${f.pri===p?c.border:C.line}`}}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Assignee + Dates */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.textSec,display:"block",marginBottom:6}}>ผู้รับผิดชอบ</label>
              <Select value={f.asgn} onChange={e=>set("asgn",Number(e.target.value))} style={{width:"100%"}}>
                {MEMBERS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.textSec,display:"block",marginBottom:6}}>วันเริ่มต้น</label>
              <Input type="date" value={f.s} onChange={e=>set("s",e.target.value)}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.textSec,display:"block",marginBottom:6}}>วันกำหนดเสร็จ *</label>
              <Input type="date" value={f.due} onChange={e=>set("due",e.target.value)}/>
            </div>
          </div>

          {/* Image */}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:C.textSec,display:"block",marginBottom:6}}>แนบรูปภาพ / ไฟล์</label>
            <label style={{display:"flex",alignItems:"center",gap:10,
              background:C.line2,border:`2px dashed ${C.line}`,padding:"14px 16px",cursor:"pointer",borderRadius:8}}>
              <span style={{fontSize:22,color:C.accent}}>📎</span>
              <div>
                <div style={{fontSize:13,color:C.textSec,fontWeight:500}}>คลิกเพื่อแนบไฟล์</div>
                <div style={{fontSize:11,color:C.textMuted}}>PNG, JPG, PDF</div>
              </div>
              <input type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/>
            </label>
            {f.img&&<div style={{fontSize:12,color:C.green,fontWeight:600,marginTop:6}}>✓ อัปโหลดสำเร็จ</div>}
          </div>

          {/* Monthly Schedule */}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:C.textSec,display:"block",marginBottom:8}}>📅 แผนงานรายเดือน</label>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <Select value={sched.mo} onChange={e=>setSched(p=>({...p,mo:e.target.value}))} style={{flex:1}}>
                {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
              </Select>
              <Select value={sched.wk} onChange={e=>setSched(p=>({...p,wk:e.target.value}))} style={{width:80}}>
                {WEEKS.map(w=><option key={w} value={w}>{w}</option>)}
              </Select>
              <Input value={sched.lbl} onChange={e=>setSched(p=>({...p,lbl:e.target.value}))} placeholder="กิจกรรม..." style={{flex:2}}/>
              <Btn variant="primary" onClick={addSched} style={{whiteSpace:"nowrap"}}>เพิ่ม</Btn>
            </div>
            {Object.keys(f.sw).length>0&&(
              <div style={{border:`1px solid ${C.line}`,overflowX:"auto",borderRadius:6}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{background:C.line2}}>
                      <th style={{padding:"6px 10px",textAlign:"left",color:C.textMuted,fontWeight:700,fontSize:11}}>เดือน</th>
                      {WEEKS.map(w=><th key={w} style={{padding:"6px 14px",color:C.textMuted,fontWeight:700,fontSize:11,borderLeft:`1px solid ${C.line}`,textAlign:"center"}}>{w}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {MONTHS.filter(mo=>WEEKS.some(w=>f.sw[`${mo}-${w}`])).map(mo=>(
                      <tr key={mo} style={{borderTop:`1px solid ${C.line}`}}>
                        <td style={{padding:"7px 10px",color:C.textSec,fontWeight:600}}>{mo}</td>
                        {WEEKS.map(w=>{
                          const val=f.sw[`${mo}-${w}`]||"";
                          return (
                            <td key={w} style={{padding:"7px 10px",borderLeft:`1px solid ${C.line}`,textAlign:"center"}}>
                              {val?<span style={{background:"#dbeafe",color:C.accent,padding:"2px 10px",borderRadius:10,fontWeight:700,fontSize:11}}>{val}</span>:<span style={{color:C.line}}>—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:"14px 20px",borderTop:`1px solid ${C.line}`,
          display:"flex",gap:10,background:C.line2,position:"sticky",bottom:0,
          borderRadius:"0 0 8px 8px"}}>
          <Btn variant="ghost" onClick={onClose} style={{flex:1,justifyContent:"center"}}>ยกเลิก</Btn>
          <Btn variant="primary" onClick={()=>{if(f.title.trim()&&f.due)onSave(f);}}
            disabled={!f.title.trim()||!f.due}
            style={{flex:2,justifyContent:"center",opacity:(!f.title.trim()||!f.due)?0.4:1}}>
            ✓ สร้าง Issue
          </Btn>
        </div>
      </Panel>
    </div>
  );
}
