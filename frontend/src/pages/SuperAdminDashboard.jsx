import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import logo from '../assets/logo.png'

const OCCUPATION_OPTIONS = ['employee', 'business', 'others']
const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, size: Math.random() * 60 + 10, x: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 12 + 15, opacity: Math.random() * 0.2 + 0.05,
}))
const COLORS = ['#22d3ee','#a78bfa','#34d399','#f472b6','#f59e0b','#60a5fa']
const ROLE_CFG = {
  admin:      { color:'#22d3ee', label:'🛡️ ADMIN',      idKey:'admin_id',      childKey:'dealers',     childRole:'dealer' },
  dealer:     { color:'#4ade80', label:'🏪 DEALER',     idKey:'dealer_id',     childKey:'sub_dealers', childRole:'sub_dealer' },
  sub_dealer: { color:'#f59e0b', label:'🔗 SUB DEALER', idKey:'sub_dealer_id', childKey:'promotors',   childRole:'promotor' },
  promotor:   { color:'#a78bfa', label:'🌟 PROMOTOR',   idKey:'promotor_id',   childKey:'customers',   childRole:'customer' },
  customer:   { color:'#f472b6', label:'👤 CUSTOMER',   idKey:'customer_id',   childKey:null,          childRole:null },
}

function hexToRgb(hex) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`
}

// ── LEFT-TO-RIGHT TREE NODE ───────────────────────────────────────────────────
function TreeNode({ node, role, dark, text, subtext }) {
  const [expanded, setExpanded] = useState(true)
  const cfg = ROLE_CFG[role]
  const c = cfg.color
  const children = cfg.childKey ? (node[cfg.childKey] || []) : []
  const hasChildren = children.length > 0

  return (
    <div style={{ display:'flex', flexDirection:'row', alignItems:'flex-start' }}>

      {/* ── Card ── */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
        <div
          onClick={() => hasChildren && setExpanded(e => !e)}
          style={{
            background:`rgba(${hexToRgb(c)},0.07)`,
            border:`1.5px solid rgba(${hexToRgb(c)},0.45)`,
            borderRadius:'14px', padding:'13px 15px', width:'175px',
            cursor: hasChildren ? 'pointer' : 'default',
            position:'relative', transition:'all 0.22s ease', flexShrink:0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 22px rgba(${hexToRgb(c)},0.28)`; e.currentTarget.style.borderColor=`rgba(${hexToRgb(c)},0.85)` }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=`rgba(${hexToRgb(c)},0.45)` }}
        >
          <div style={{ fontSize:'9px', fontWeight:800, padding:'2px 8px', borderRadius:'20px', marginBottom:'7px', display:'inline-block', background:`rgba(${hexToRgb(c)},0.18)`, color:c, border:`1px solid rgba(${hexToRgb(c)},0.35)`, letterSpacing:'0.04em' }}>
            {cfg.label}
          </div>
          <div style={{ color:c, fontFamily:'monospace', fontSize:'9px', marginBottom:'4px', wordBreak:'break-all' }}>
            {node[cfg.idKey]}
          </div>
          <div style={{ color:text, fontWeight:700, fontSize:'12px', marginBottom:'5px', lineHeight:1.3 }}>
            {node.first_name} {node.last_name||''}
          </div>
          <div style={{ color:subtext, fontSize:'10px', marginBottom:'2px' }}>📞 {node.mobile_number}</div>
          {node.city_name && <div style={{ color:subtext, fontSize:'10px' }}>📍 {node.city_name}</div>}
          <div style={{ marginTop:'9px', height:2, borderRadius:2, background:`linear-gradient(90deg,rgba(${hexToRgb(c)},0.15),${c},rgba(${hexToRgb(c)},0.15))` }} />
          {hasChildren && (
            <div style={{ position:'absolute', top:'9px', right:'9px', color:c, fontSize:'9px', transition:'transform 0.25s ease', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</div>
          )}
        </div>

        {/* horizontal connector going right */}
        {hasChildren && expanded && (
          <div style={{ width:2, height:'100%', display:'none' }} />
        )}
      </div>

      {/* ── Children ── */}
      {hasChildren && expanded && (
        <div style={{ display:'flex', flexDirection:'row', alignItems:'flex-start', flexShrink:0 }}>
          {/* H-line from card to vertical rail */}
          <div style={{ width:'28px', height:2, background:`rgba(${hexToRgb(c)},0.5)`, marginTop:'38px', flexShrink:0 }} />

          {/* Vertical rail + children */}
          <div style={{ display:'flex', flexDirection:'column', flexShrink:0 }}>
            {children.map((child, ci) => (
              <div key={child.id} style={{ display:'flex', flexDirection:'row', alignItems:'flex-start', marginBottom: ci < children.length-1 ? '16px' : '0' }}>
                {/* Vertical rail segment */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, width:'2px' }}>
                  {/* top half */}
                  <div style={{ width:2, height: ci===0 ? '38px' : '38px', background: children.length>1 ? `rgba(${hexToRgb(c)},0.35)` : 'transparent' }} />
                  {/* bottom half (only if not last) */}
                </div>
                {/* Tick to child */}
                <div style={{ width:'16px', height:2, background:`rgba(${hexToRgb(c)},0.5)`, marginTop:'38px', flexShrink:0 }} />
                <TreeNode node={child} role={cfg.childRole} dark={dark} text={text} subtext={subtext} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── POPUP ─────────────────────────────────────────────────────────────────────
let _popupEl=null, _hideTimer=null
function removeAdminPopup() { document.querySelectorAll('#admin-popup').forEach(el=>el.remove()); _popupEl=null }
function scheduleHidePopup(set) { clearTimeout(_hideTimer); _hideTimer=setTimeout(()=>{removeAdminPopup();set(null)},120) }
function createAdminPopup(a,i,anchorEl,dark,subtext,text) {
  removeAdminPopup()
  const c=COLORS[i%COLORS.length]
  const el=document.createElement('div'); el.id='admin-popup'
  el.style.cssText=`position:fixed;z-index:9999;background:${dark?'linear-gradient(160deg,#091525,#060e1c)':'linear-gradient(160deg,#fff,#f1f5f9)'};border:1px solid rgba(34,211,238,0.25);border-radius:14px;padding:14px;box-shadow:0 16px 48px rgba(0,0,0,0.45);animation:popupIn 0.25s cubic-bezier(0.22,1,0.36,1) both;min-width:200px;max-width:240px;`
  el.innerHTML=`
    <div style="font-size:9px;color:#22d3ee;font-weight:700;letter-spacing:1.3px;margin-bottom:11px;padding-bottom:9px;border-bottom:1px solid rgba(34,211,238,0.2);">CREATED BY</div>
    <div style="border-radius:9px;padding:10px;margin-bottom:8px;background:rgba(255,215,0,0.05);border:1px solid rgba(255,215,0,0.22);">
      <div style="font-size:9px;color:#ffd700;font-weight:700;margin-bottom:4px;">🛡️ SUPER ADMIN</div>
      <div style="font-size:11px;color:${subtext};word-break:break-all;">${localStorage.getItem('email')}</div>
    </div>
    <div style="display:flex;justify-content:center;padding:4px 0;"><div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid #22d3ee;"></div></div>
    <div style="background:rgba(34,211,238,0.04);border:1px solid rgba(34,211,238,0.14);border-radius:10px;padding:10px;">
      <div style="font-size:9px;color:#22d3ee;font-weight:700;margin-bottom:5px;">ADMIN</div>
      <div style="font-size:10px;color:${c};font-family:monospace;margin-bottom:3px;">${a.admin_id}</div>
      <div style="font-size:13px;color:${text};font-weight:700;margin-bottom:5px;">${a.first_name}</div>
      <div style="font-size:11px;color:${subtext};margin-bottom:2px;">📞 ${a.mobile_number}</div>
      <div style="font-size:11px;color:${subtext};">📍 ${a.city_name}</div>
    </div>`
  document.body.appendChild(el)
  const rect=anchorEl.getBoundingClientRect(), popW=el.offsetWidth||230, popH=el.offsetHeight||220
  let left=rect.right+14, top=rect.top+(rect.height/2)-(popH/2)
  if(left+popW>window.innerWidth-10) left=rect.left-popW-14
  if(top<8) top=8; if(top+popH>window.innerHeight-8) top=window.innerHeight-popH-8
  el.style.left=left+'px'; el.style.top=top+'px'
  el.addEventListener('mouseenter',()=>clearTimeout(_hideTimer))
  el.addEventListener('mouseleave',()=>scheduleHidePopup(()=>{}))
  _popupEl=el
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  const [admins, setAdmins] = useState([])
  const [hierarchyData, setHierarchyData] = useState(null)
  const [hierarchyLoading, setHierarchyLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showHierarchy, setShowHierarchy] = useState(false)
  const [activeAdmin, setActiveAdmin] = useState(null)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    initial:'', first_name:'', last_name:'', mobile_number:'', door_no:'', street_name:'', town_name:'',
    city_name:'', district:'', state:'', email:'', password:'',
    aadhaar_no:'', pan_no:'', occupation:'employee', occupation_detail:'',
    annual_salary:'', admin_name:'', admin_id:'', admin_contact_no:''
  })
  const canvasRef = useRef(null)
  const treeRef = useRef(null)

  // drag-to-scroll
  useEffect(() => {
    const el = treeRef.current; if(!el) return
    let down=false, sx, sy, sl, st
    const md = e => { down=true; el.style.cursor='grabbing'; sx=e.pageX-el.offsetLeft; sy=e.pageY-el.offsetTop; sl=el.scrollLeft; st=el.scrollTop }
    const mu = () => { down=false; el.style.cursor='grab' }
    const mm = e => { if(!down) return; e.preventDefault(); el.scrollLeft=sl-(e.pageX-el.offsetLeft-sx); el.scrollTop=st-(e.pageY-el.offsetTop-sy) }
    el.addEventListener('mousedown',md); el.addEventListener('mouseup',mu); el.addEventListener('mouseleave',mu); el.addEventListener('mousemove',mm)
    return () => { el.removeEventListener('mousedown',md); el.removeEventListener('mouseup',mu); el.removeEventListener('mouseleave',mu); el.removeEventListener('mousemove',mm) }
  }, [showHierarchy, hierarchyData])

  const bg=dark?'#020617':'#f8fafc', text=dark?'#f8fafc':'#020617', subtext=dark?'#94a3b8':'#64748b'
  const accent=dark?'#22d3ee':'#2563eb', border=dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'
  const glass=dark?'rgba(15,23,42,0.65)':'rgba(255,255,255,0.7)'
  const cardBg=dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)'
  const cardBorder=dark?'1px solid rgba(103,232,249,0.1)':'1px solid rgba(0,0,0,0.1)'
  const inpBg=dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'
  const inpBorder=dark?'#374151':'#d1d5db'

  useEffect(() => {
    const canvas=canvasRef.current, ctx=canvas.getContext('2d')
    let animId, arr=[]
    const mouse={x:null,y:null,radius:150}
    const resize=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight}
    const mmove=e=>{mouse.x=e.x;mouse.y=e.y}
    window.addEventListener('resize',resize); window.addEventListener('mousemove',mmove); resize()
    class P { constructor(){this.x=Math.random()*canvas.width;this.y=Math.random()*canvas.height;this.size=Math.random()*2+1;this.sx=(Math.random()-.5)*.8;this.sy=(Math.random()-.5)*.8} update(){this.x+=this.sx;this.y+=this.sy;if(this.x>canvas.width||this.x<0)this.sx*=-1;if(this.y>canvas.height||this.y<0)this.sy*=-1;let dx=mouse.x-this.x,dy=mouse.y-this.y,d=Math.sqrt(dx*dx+dy*dy);if(d<mouse.radius){const fx=dx/d,fy=dy/d,f=(mouse.radius-d)/mouse.radius;this.x-=fx*f*5;this.y-=fy*f*5}} draw(){ctx.fillStyle=dark?'rgba(34,211,238,0.5)':'rgba(37,99,235,0.4)';ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fill()} }
    function init(){arr=[];for(let i=0;i<60;i++)arr.push(new P())}
    function connect(){for(let a=0;a<arr.length;a++)for(let b=a;b<arr.length;b++){let dx=arr[a].x-arr[b].x,dy=arr[a].y-arr[b].y,d=Math.sqrt(dx*dx+dy*dy);if(d<150){ctx.strokeStyle=dark?`rgba(34,211,238,${1-d/150})`:`rgba(37,99,235,${0.5-d/300})`;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(arr[a].x,arr[a].y);ctx.lineTo(arr[b].x,arr[b].y);ctx.stroke()}}}
    function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);arr.forEach(p=>{p.update();p.draw()});connect();animId=requestAnimationFrame(animate)}
    init();animate()
    return ()=>{window.removeEventListener('resize',resize);window.removeEventListener('mousemove',mmove);cancelAnimationFrame(animId)}
  },[dark])

  const fetchAdmins=async()=>{try{const r=await api.get('/admins/');setAdmins(r.data)}catch{}}
  const fetchHierarchy=async()=>{setHierarchyLoading(true);try{const r=await api.get('/hierarchy/full/');setHierarchyData(r.data)}catch(e){console.error(e)};setHierarchyLoading(false)}
  useEffect(()=>{fetchAdmins()},[])

  const handleOpenHierarchy=()=>{setShowHierarchy(true);fetchHierarchy()}
  const handleChange=e=>setForm({...form,[e.target.name]:e.target.value})
  const handleSubmit=async e=>{e.preventDefault();try{await api.post('/admins/',form);setMsg('✅ Admin created successfully!');setShowForm(false);fetchAdmins()}catch(err){setMsg('❌ Error: '+JSON.stringify(err.response?.data))}}

  const totalStats=hierarchyData?{
    admins:hierarchyData.admins.length,
    dealers:hierarchyData.admins.reduce((a,ad)=>a+ad.dealers.length,0),
    subDealers:hierarchyData.admins.reduce((a,ad)=>a+ad.dealers.reduce((b,d)=>b+d.sub_dealers.length,0),0),
    promotors:hierarchyData.admins.reduce((a,ad)=>a+ad.dealers.reduce((b,d)=>b+d.sub_dealers.reduce((c,sd)=>c+sd.promotors.length,0),0),0),
    customers:hierarchyData.admins.reduce((a,ad)=>a+ad.dealers.reduce((b,d)=>b+d.sub_dealers.reduce((c,sd)=>c+sd.promotors.reduce((e,pr)=>e+pr.customers.length,0),0),0),0),
  }:null

  const s={
    card:{background:cardBg,border:cardBorder,borderRadius:'20px',padding:'32px 36px',marginBottom:'24px'},
    secHead:{color:'#a5f3fc',fontSize:'13px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 20px',paddingBottom:'14px',borderBottom:cardBorder},
    secSub:{color:'#a5f3fc',fontSize:'12px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',margin:'4px 0 0',paddingBottom:'10px',borderBottom:cardBorder},
    lbl:{display:'block',color:subtext,fontSize:'12px',marginBottom:'7px',textTransform:'uppercase',letterSpacing:'0.04em'},
    inp:{width:'100%',background:inpBg,border:`1px solid ${inpBorder}`,borderRadius:'10px',padding:'12px 16px',color:text,fontSize:'14px',outline:'none',boxSizing:'border-box'},
  }

  return (
    <div style={{minHeight:'100vh',background:bg,color:text,transition:'background 0.8s ease,color 0.4s ease',fontFamily:'"Inter",system-ui,sans-serif',position:'relative',overflow:'hidden'}}>
      <style>{`
        @keyframes float-orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
        @keyframes antigravity{0%{transform:translateY(110vh) rotate(0deg);opacity:0}10%{opacity:var(--op)}90%{opacity:var(--op)}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 8px rgba(34,211,238,0.15);}50%{box-shadow:0 0 22px rgba(34,211,238,0.35);}}
        @keyframes popupIn{from{opacity:0;transform:translateY(8px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        .sa-inp:focus{border-color:#22d3ee !important}
        .sa-grad-btn{position:relative;overflow:hidden}
        .sa-grad-btn::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%)}
        .sa-grad-btn:hover::after{animation:shimmer 1s infinite}
        .sa-tr:hover td{background:rgba(255,255,255,.02)}
        .tree-area::-webkit-scrollbar{width:7px;height:7px}
        .tree-area::-webkit-scrollbar-track{background:rgba(255,255,255,0.03);border-radius:10px}
        .tree-area::-webkit-scrollbar-thumb{background:rgba(34,211,238,0.35);border-radius:10px}
        .tree-area::-webkit-scrollbar-thumb:hover{background:rgba(34,211,238,0.6)}
        .tree-area{scrollbar-width:thin;scrollbar-color:rgba(34,211,238,0.35) rgba(255,255,255,0.03)}
        .node-in{animation:fadeIn 0.3s ease both}
      `}</style>

      <canvas ref={canvasRef} style={{position:'fixed',top:0,left:0,pointerEvents:'none',zIndex:1,opacity:0.45}}/>
      <div style={{position:'absolute',borderRadius:'50%',filter:'blur(80px)',animation:'float-orb 20s infinite ease-in-out',zIndex:0,top:'8%',left:'8%',width:'380px',height:'380px',background:dark?'rgba(34,211,238,0.08)':'rgba(37,99,235,0.08)'}}/>
      <div style={{position:'absolute',borderRadius:'50%',filter:'blur(80px)',animation:'float-orb 20s infinite ease-in-out',zIndex:0,bottom:'10%',right:'4%',width:'460px',height:'460px',background:dark?'rgba(236,72,153,0.05)':'rgba(219,39,119,0.05)',animationDelay:'-5s'}}/>
      {PARTICLES.map(p=>(
        <div key={p.id} style={{position:'absolute',left:`${p.x}%`,bottom:'-100px',width:p.size,height:p.size,borderRadius:'40% 60% 60% 40% / 40% 40% 60% 60%',border:`1px solid ${accent}44`,opacity:p.opacity,animation:`antigravity ${p.duration}s ${p.delay}s infinite linear`,'--op':p.opacity,pointerEvents:'none',zIndex:0}}/>
      ))}

      {/* Navbar */}
      <div style={{position:'relative',zIndex:10,background:glass,borderBottom:`1px solid ${border}`,padding:'18px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',backdropFilter:'blur(16px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginLeft:'10px'}}>
          <img src={logo} alt="BitByte Logo" style={{width:60,height:50,borderRadius:'10px',objectFit:'contain'}}/>
          <span style={{color:'#a5f3fc',fontWeight:700,fontSize:'14px'}}>🛡️ Super Admin</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <span style={{color:subtext,fontSize:'14px'}}>{localStorage.getItem('email')}</span>
          <button onClick={()=>setDark(!dark)} style={{padding:'8px 16px',borderRadius:'16px',border:`1px solid ${border}`,background:'transparent',color:text,cursor:'pointer',fontWeight:600,fontSize:'13px'}}>
            {dark?'☀️ Light':'🌙 Dark'}
          </button>
          <button onClick={()=>{localStorage.clear();navigate('/login')}} style={{padding:'8px 18px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',borderRadius:'10px',fontSize:'13px',cursor:'pointer'}}>
            Logout
          </button>
        </div>
      </div>

      <div style={{position:'relative',zIndex:10,padding:'36px 40px',maxWidth:'1200px',margin:'0 auto'}}>
        {msg&&<div style={{background:msg.includes('✅')?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${msg.includes('✅')?'rgba(74,222,128,0.25)':'rgba(239,68,68,0.3)'}`,color:msg.includes('✅')?'#4ade80':'#f87171',borderRadius:'12px',padding:'14px 20px',fontSize:'14px',marginBottom:'20px'}}>{msg}</div>}

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
          <h2 style={{fontSize:'22px',fontWeight:800,margin:0}}>Admin Management</h2>
          <div style={{display:'flex',gap:'12px'}}>
            <button onClick={handleOpenHierarchy} style={{padding:'11px 28px',background:'rgba(165,243,252,0.08)',border:'1px solid rgba(103,232,249,0.3)',borderRadius:'12px',fontWeight:700,color:'#a5f3fc',fontSize:'14px',cursor:'pointer'}}>
              🏢 Admin Hierarchy
            </button>
            <button onClick={()=>setShowForm(!showForm)} className="sa-grad-btn" style={{padding:'11px 28px',background:'linear-gradient(90deg,#22d3ee,#4ade80)',border:'none',borderRadius:'12px',fontWeight:800,color:'#006165',fontSize:'14px',cursor:'pointer'}}>
              {showForm?'Cancel':'+ Create Admin'}
            </button>
          </div>
        </div>

        {/* ── HIERARCHY MODAL ── */}
        {showHierarchy&&(
          <div onClick={()=>{setShowHierarchy(false);setActiveAdmin(null);removeAdminPopup()}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(14px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div onClick={e=>e.stopPropagation()}
              style={{background:dark?'#07101f':'#f1f5f9',border:'1px solid rgba(103,232,249,0.15)',borderRadius:'24px',width:'96vw',maxWidth:'1350px',height:'88vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.5)'}}>

              {/* Modal Header */}
              <div style={{padding:'22px 30px',borderBottom:'1px solid rgba(103,232,249,0.1)',flexShrink:0,background:dark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'16px'}}>
                  <div style={{flex:1}}>
                    <div style={{color:'#a5f3fc',fontSize:'13px',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:'12px'}}>
                      🏢 Full Organization Hierarchy
                    </div>
                    {/* Stats */}
                    {totalStats&&(
                      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'12px'}}>
                        {[
                          {label:'Admins',count:totalStats.admins,color:'#22d3ee'},
                          {label:'Dealers',count:totalStats.dealers,color:'#4ade80'},
                          {label:'Sub Dealers',count:totalStats.subDealers,color:'#f59e0b'},
                          {label:'Promotors',count:totalStats.promotors,color:'#a78bfa'},
                          {label:'Customers',count:totalStats.customers,color:'#f472b6'},
                        ].map(st=>(
                          <div key={st.label} style={{display:'flex',alignItems:'center',gap:'5px',background:`rgba(${hexToRgb(st.color)},0.1)`,border:`1px solid rgba(${hexToRgb(st.color)},0.3)`,borderRadius:'20px',padding:'4px 12px'}}>
                            <span style={{color:st.color,fontWeight:800,fontSize:'13px'}}>{st.count}</span>
                            <span style={{color:subtext,fontSize:'11px'}}>{st.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Legend */}
                    <div style={{display:'flex',gap:'14px',flexWrap:'wrap',alignItems:'center'}}>
                      {[{r:'Super Admin',c:'#ffd700'},{r:'Admin',c:'#22d3ee'},{r:'Dealer',c:'#4ade80'},{r:'Sub Dealer',c:'#f59e0b'},{r:'Promotor',c:'#a78bfa'},{r:'Customer',c:'#f472b6'}].map(l=>(
                        <div key={l.r} style={{display:'flex',alignItems:'center',gap:'5px'}}>
                          <div style={{width:8,height:8,borderRadius:'50%',background:l.c,flexShrink:0}}/>
                          <span style={{color:subtext,fontSize:'11px'}}>{l.r}</span>
                        </div>
                      ))}
                      <span style={{color:subtext,fontSize:'11px',marginLeft:'8px'}}>🖱️ Drag to pan · Click card to expand/collapse</span>
                    </div>
                  </div>
                  <button onClick={()=>{setShowHierarchy(false);setActiveAdmin(null);removeAdminPopup()}}
                    style={{background:'transparent',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',borderRadius:'8px',padding:'7px 16px',cursor:'pointer',fontSize:'12px',flexShrink:0}}>
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Tree canvas area */}
              <div ref={treeRef} className="tree-area"
                style={{flex:1,overflow:'auto',padding:'36px 40px',cursor:'grab',userSelect:'none'}}>

                {hierarchyLoading&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:'14px'}}>
                    <div style={{width:36,height:36,border:'3px solid rgba(34,211,238,0.2)',borderTop:'3px solid #22d3ee',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
                    <span style={{color:subtext,fontSize:'14px'}}>Loading hierarchy...</span>
                  </div>
                )}

                {!hierarchyLoading&&hierarchyData&&(
                  <div style={{display:'flex',flexDirection:'row',alignItems:'flex-start',minWidth:'max-content',gap:0}}>

                    {/* Super Admin root */}
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
                      <div style={{
                        background:'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,215,0,0.05))',
                        border:'2px solid rgba(255,215,0,0.6)',
                        borderRadius:'16px',padding:'18px 22px',
                        fontWeight:800,fontSize:'13px',color:'#ffd700',
                        boxShadow:'0 0 28px rgba(255,215,0,0.12)',
                        animation:'pulseGlow 3s ease-in-out infinite',
                        width:'175px',textAlign:'center',flexShrink:0,
                      }}>
                        🛡️ Super Admin
                        <div style={{fontSize:'10px',color:'#94a3b8',fontWeight:400,marginTop:'6px',wordBreak:'break-all'}}>
                          {localStorage.getItem('email')}
                        </div>
                        <div style={{marginTop:'8px',height:2,borderRadius:2,background:'linear-gradient(90deg,rgba(255,215,0,0.2),#ffd700,rgba(255,215,0,0.2))'}}/>
                      </div>
                    </div>

                    {/* SA → Admins connector */}
                    {hierarchyData.admins.length>0&&(
                      <div style={{display:'flex',flexDirection:'row',alignItems:'flex-start',flexShrink:0}}>
                        {/* H-line */}
                        <div style={{width:'28px',height:2,background:'rgba(255,215,0,0.5)',marginTop:'38px',flexShrink:0}}/>

                        {/* Admins column */}
                        <div style={{display:'flex',flexDirection:'column',gap:'20px',flexShrink:0}}>
                          {hierarchyData.admins.map((admin,ai)=>(
                            <div key={admin.id} className="node-in" style={{display:'flex',flexDirection:'row',alignItems:'flex-start',animationDelay:`${ai*0.04}s`}}>
                              {/* Vertical rail tick */}
                              {hierarchyData.admins.length>1&&(
                                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',flexShrink:0}}>
                                  <div style={{display:'flex',alignItems:'center'}}>
                                    <div style={{width:2,height:'38px',background:'rgba(255,215,0,0.3)',flexShrink:0}}/>
                                    <div style={{width:'14px',height:2,background:'rgba(255,215,0,0.5)',marginTop:'0px'}}/>
                                  </div>
                                </div>
                              )}
                              <TreeNode node={admin} role="admin" dark={dark} text={text} subtext={subtext}/>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hierarchyData.admins.length===0&&!hierarchyLoading&&(
                      <div style={{display:'flex',alignItems:'center',marginLeft:'32px'}}>
                        <div style={{width:'32px',height:2,background:'rgba(255,215,0,0.3)'}}/>
                        <div style={{color:subtext,padding:'18px 22px',background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',fontSize:'14px'}}>
                          No admins created yet
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Admin Form */}
        {showForm&&(
          <div style={s.card}>
            <p style={s.secHead}>Create New Admin</p>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'18px'}}>
              <p style={s.secSub}>👤 Personal Info</p>
              <div style={{display:'grid',gridTemplateColumns:'0.4fr 1fr 1fr',gap:'14px'}}>
                <div><label style={s.lbl}>Initial</label><input name="initial" maxLength={5} value={form.initial} onChange={handleChange} className="sa-inp" style={s.inp}/></div>
                <div><label style={s.lbl}>First Name *</label><input name="first_name" maxLength={100} value={form.first_name} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
                <div><label style={s.lbl}>Last Name *</label><input name="last_name" maxLength={100} value={form.last_name} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div><label style={s.lbl}>Mobile *</label><input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
                <div><label style={s.lbl}>Admin ID</label>
                  <div style={{...s.inp,opacity:0.55,cursor:'not-allowed',display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{color:'#22d3ee',fontFamily:'monospace',fontSize:'13px'}}>BBADM{new Date().getFullYear()}</span>
                    <span style={{color:'#64748b',fontSize:'12px'}}>&lt;auto-generated&gt;</span>
                  </div>
                </div>
              </div>
              <p style={s.secSub}>Account Info</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div><label style={s.lbl}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
                <div><label style={s.lbl}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
              </div>
              <p style={s.secSub}>📍 Address</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'14px'}}>
                <div><label style={s.lbl}>Door No *</label><input name="door_no" value={form.door_no} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
                <div><label style={s.lbl}>Street Name *</label><input name="street_name" value={form.street_name} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
                <div><label style={s.lbl}>Town *</label><input name="town_name" value={form.town_name} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
                <div><label style={s.lbl}>City *</label><input name="city_name" value={form.city_name} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
                <div><label style={s.lbl}>District *</label><input name="district" value={form.district} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
                <div><label style={s.lbl}>State *</label><input name="state" value={form.state} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
              </div>
              <p style={s.secSub}>🪪 Identity</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div><label style={s.lbl}>Aadhaar No *</label><input name="aadhaar_no" maxLength={12} value={form.aadhaar_no} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
                <div><label style={s.lbl}>PAN No *</label><input name="pan_no" maxLength={10} value={form.pan_no} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
              </div>
              <p style={s.secSub}>💼 Occupation</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'14px'}}>
                <div><label style={s.lbl}>Occupation *</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} className="sa-inp" style={{...s.inp,cursor:'pointer'}}>
                    {OCCUPATION_OPTIONS.map(o=><option key={o} value={o} style={{background:'#1a1f26'}}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={s.lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} className="sa-inp" style={s.inp}/></div>
                <div><label style={s.lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required className="sa-inp" style={s.inp}/></div>
              </div>
              <div style={{display:'flex',gap:'12px',marginTop:'6px'}}>
                <button type="submit" className="sa-grad-btn" style={{padding:'12px 28px',background:'linear-gradient(90deg,#22d3ee,#4ade80)',border:'none',borderRadius:'12px',fontWeight:800,color:'#006165',fontSize:'14px',cursor:'pointer'}}>Create Admin</button>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:'12px 24px',background:inpBg,border:`1px solid ${border}`,borderRadius:'12px',color:subtext,fontSize:'14px',cursor:'pointer'}}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Admins Table */}
        <div style={s.card}>
          <p style={s.secHead}>All Admins ({admins.length})</p>
          {admins.length===0?(
            <p style={{color:subtext,textAlign:'center',padding:'60px 0',fontSize:'15px'}}>No admins yet!</p>
          ):(
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'15px'}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${inpBorder}`}}>
                    {['First Name','Last Name','Email','Mobile','Admin ID','City'].map(h=>(
                      <th key={h} style={{padding:'14px 16px',textAlign:'left',color:subtext,fontSize:'13px',fontWeight:600,whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a,i)=>(
                    <tr key={i} className="sa-tr" style={{borderBottom:`1px solid ${border}`}}>
                      <td style={{padding:'14px 16px',color:text}}>{a.first_name}</td>
                      <td style={{padding:'14px 16px',color:text}}>{a.last_name}</td>
                      <td style={{padding:'14px 16px',color:subtext}}>{a.email}</td>
                      <td style={{padding:'14px 16px',color:subtext}}>{a.mobile_number}</td>
                      <td style={{padding:'14px 16px',color:'#22d3ee',fontFamily:'monospace'}}>{a.admin_id}</td>
                      <td style={{padding:'14px 16px',color:subtext}}>{a.city_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}