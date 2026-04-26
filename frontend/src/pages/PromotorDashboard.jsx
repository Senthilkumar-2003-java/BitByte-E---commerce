import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import logo from '../assets/logo.png'

const OCCUPATIONS = ['employee', 'business', 'others']
const emptyForm = {
  initial:'', first_name:'', last_name:'', mobile_number:'', email:'', password:'',
  door_no:'', street_name:'', town_name:'', city_name:'',
  district:'', state:'', aadhaar_no:'', pan_no:'',
  occupation:'', occupation_detail:'', annual_salary:'',
}

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, size: Math.random() * 60 + 10, x: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 12 + 15, opacity: Math.random() * 0.2 + 0.05,
}))

const PR_TREE_COLORS = ['#f472b6', '#a78bfa', '#22d3ee', '#4ade80', '#fb923c', '#60a5fa']

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

// ─── CHAIN POPUP ───────────────────────────────────────────────────────────────
let _prChainPopupEl = null
let _prChainHideTimer = null

function removePRChainPopup() {
  document.querySelectorAll('#pr-chain-popup').forEach(el => el.remove())
  _prChainPopupEl = null
}

function showPRChainPopup(anchorEl, customer, dark, text, subtext, superAdminEmail, promotorInfo) {
  clearTimeout(_prChainHideTimer)
  removePRChainPopup()

  const popupBg    = dark ? 'linear-gradient(160deg,#091525,#060e1c)' : 'linear-gradient(160deg,#ffffff,#f1f5f9)'
  const popupBorder = dark ? 'rgba(244,114,182,0.2)' : 'rgba(244,114,182,0.3)'

  const CHAIN_CFG = {
    super_admin: { emoji:'🛡️', label:'SUPER ADMIN', color:'#ffd700', idKey:null },
    sub_dealer:  { emoji:'🔗', label:'SUB DEALER',  color:'#f59e0b', idKey:'sub_dealer_id' },
    promotor:    { emoji:'🌟', label:'PROMOTOR',    color:'#a78bfa', idKey:'promotor_id' },
    customer:    { emoji:'👤', label:'CUSTOMER',    color:'#f472b6', idKey:'customer_id' },
  }

  const chain = [
    { type:'super_admin', data:{ email: superAdminEmail } },
    ...(promotorInfo?.sub_dealer_id ? [{
      type:'sub_dealer',
      data:{ sub_dealer_id: promotorInfo.sub_dealer_id, first_name: promotorInfo.sub_dealer_name, mobile_number: promotorInfo.sub_dealer_contact_no }
    }] : []),
    { type:'promotor', data: promotorInfo || {} },
    { type:'customer', data: customer },
  ]

  const el = document.createElement('div')
  el.id = 'pr-chain-popup'
  el.style.cssText = `
    position:fixed; z-index:9999;
    background:${popupBg}; border:1px solid ${popupBorder};
    border-radius:14px; padding:14px 16px;
    box-shadow:0 16px 48px rgba(0,0,0,0.55);
    animation:prPopupIn 0.25s cubic-bezier(0.22,1,0.36,1) both;
    min-width:210px; max-width:260px;
    max-height:82vh; overflow-y:auto; overflow-x:hidden;
    scroll-behavior:smooth; scrollbar-width:thin;
    scrollbar-color:rgba(244,114,182,0.35) transparent;
  `

  const itemsHtml = chain.map((item, idx) => {
    const isLast = idx === chain.length - 1
    const cfg = CHAIN_CFG[item.type]
    if (!cfg) return ''

    const arrowHtml = idx > 0 ? `
      <div style="display:flex;justify-content:center;padding:4px 0;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:0;">
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:9px solid rgba(244,114,182,0.6);"></div>
          <div style="width:2px;height:12px;background:linear-gradient(180deg,rgba(244,114,182,0.5),rgba(244,114,182,0.1));"></div>
        </div>
      </div>` : ''

    if (item.type === 'super_admin') {
      return `${arrowHtml}
        <div style="border-radius:9px;padding:10px 12px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.25);">
          <div style="font-size:9px;color:#ffd700;font-weight:700;margin-bottom:4px;">🛡️ SUPER ADMIN</div>
          <div style="font-size:11px;color:${subtext};word-break:break-all;">${item.data.email || '—'}</div>
        </div>`
    }

    const d = item.data || {}
    const idVal = cfg.idKey ? (d[cfg.idKey] || d.id || '—') : ''
    const name  = [d.first_name, d.last_name].filter(Boolean).join(' ') || '—'
    const phone = d.mobile_number || '—'
    const city  = d.city_name || ''

    return `${arrowHtml}
      <div style="border-radius:9px;padding:10px 12px;
        background:rgba(${hexToRgb(cfg.color)},0.06);
        border:1px solid rgba(${hexToRgb(cfg.color)},${isLast ? '0.55' : '0.2'});
        ${isLast ? `box-shadow:0 0 14px rgba(${hexToRgb(cfg.color)},0.18);` : ''}">
        <div style="font-size:9px;color:${cfg.color};font-weight:700;margin-bottom:4px;">
          ${cfg.emoji} ${cfg.label}${isLast ? ' <span style="font-size:8px;opacity:0.6;">(CURRENT)</span>' : ''}
        </div>
        ${idVal ? `<div style="font-size:10px;color:${cfg.color};font-family:monospace;margin-bottom:3px;">${idVal}</div>` : ''}
        <div style="font-size:12px;color:${text};font-weight:700;margin-bottom:4px;">${name}</div>
        ${phone !== '—' ? `<div style="font-size:11px;color:${subtext};margin-bottom:2px;">📞 ${phone}</div>` : ''}
        ${city ? `<div style="font-size:11px;color:${subtext};">📍 ${city}</div>` : ''}
      </div>`
  }).join('')

  el.innerHTML = `
    <div style="font-size:9px;color:#fbcfe8;font-weight:700;letter-spacing:1.2px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${popupBorder};">
      🔗 HIERARCHY CHAIN
    </div>
    ${itemsHtml}
  `

  document.body.appendChild(el)

  const rect = anchorEl.getBoundingClientRect()
  const popW = 260
  const popH = el.scrollHeight || 350
  let left = rect.right + 14
  let top  = rect.top
  if (left + popW > window.innerWidth - 10)  left = rect.left - popW - 14
  if (top < 8)                                top  = 8
  if (top + popH > window.innerHeight - 8)   top  = window.innerHeight - popH - 8
  el.style.left = left + 'px'
  el.style.top  = top + 'px'

  el.addEventListener('mouseenter', () => clearTimeout(_prChainHideTimer))
  el.addEventListener('mouseleave', () => { _prChainHideTimer = setTimeout(() => removePRChainPopup(), 200) })
  _prChainPopupEl = el
}

// ─── PRINT ─────────────────────────────────────────────────────────────────────
function printCustomerCard(node, color, superAdminEmail, promotorInfo) {
  const arrowDiv = `<div class="chain-arrow"><div style="display:flex;flex-direction:column;align-items:center;gap:0;"><div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:9px solid #94a3b8;"></div><div style="width:2px;height:12px;background:linear-gradient(180deg,#94a3b8,rgba(148,163,184,0.2));"></div></div></div>`

  const chain = [
    { type:'super_admin', label:'SUPER ADMIN', emoji:'🛡️', data:{ email: superAdminEmail } },
    ...(promotorInfo?.sub_dealer_id ? [{
      type:'sub_dealer', label:'SUB DEALER', emoji:'🔗',
      data:{ sub_dealer_id: promotorInfo.sub_dealer_id, first_name: promotorInfo.sub_dealer_name, mobile_number: promotorInfo.sub_dealer_contact_no }
    }] : []),
    { type:'promotor', label:'PROMOTOR', emoji:'🌟', data: promotorInfo || {} },
    { type:'customer', label:'CUSTOMER', emoji:'👤', data: node },
  ]

  const idMap = { sub_dealer:'sub_dealer_id', promotor:'promotor_id', customer:'customer_id' }

  const chainHtml = chain.map((item, idx) => {
    const isLast = idx === chain.length - 1
    const arrow  = idx < chain.length - 1 ? arrowDiv : ''
    const d = item.data || {}
    if (item.type === 'super_admin') {
      return `<div class="chain-item"><div class="chain-role">${item.emoji} ${item.label}</div><div class="chain-email">${d.email || '—'}</div></div>${arrow}`
    }
    const idVal = idMap[item.type] ? (d[idMap[item.type]] || '—') : ''
    const name  = [d.first_name, d.last_name].filter(Boolean).join(' ') || '—'
    return `
      <div class="chain-item ${isLast ? 'current' : ''}">
        <div class="chain-role">${item.emoji} ${item.label}</div>
        ${idVal ? `<div class="chain-id">${idVal}</div>` : ''}
        <div class="chain-name">${name}</div>
        <div class="chain-info">📞 ${d.mobile_number || '—'}</div>
        <div class="chain-info">📍 ${d.city_name || '—'}</div>
      </div>${arrow}`
  }).join('')

  const currentName = [node.first_name, node.last_name].filter(Boolean).join(' ') || '—'
  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html><head><title>CUSTOMER — ${currentName}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Inter',system-ui,sans-serif;background:#f8fafc;padding:40px;display:flex;justify-content:center;}.wrapper{max-width:480px;width:100%;}.header{text-align:center;margin-bottom:28px;}.header h1{font-size:20px;font-weight:800;color:#020617;}.header p{font-size:12px;color:#64748b;margin-top:4px;}.chain-item{background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px 18px;}.chain-item.current{border-color:${color};background:${color}11;box-shadow:0 4px 16px ${color}22;}.chain-role{font-size:10px;font-weight:800;color:#64748b;letter-spacing:1px;margin-bottom:4px;text-transform:uppercase;}.chain-item.current .chain-role{color:${color};}.chain-id{font-family:monospace;font-size:11px;color:${color};margin-bottom:4px;}.chain-name{font-size:16px;font-weight:800;color:#020617;margin-bottom:6px;}.chain-email{font-size:12px;color:#475569;}.chain-info{font-size:12px;color:#475569;margin-top:3px;}.chain-arrow{display:flex;justify-content:center;padding:4px 0;}.footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:24px;}@media print{body{background:white;padding:20px;}.chain-item{box-shadow:none;}}</style>
    </head><body><div class="wrapper"><div class="header"><h1>BitByte — CUSTOMER Profile</h1><p>Hierarchy Chain Report</p></div>${chainHtml}<div class="footer">Printed on ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</div></div><script>window.onload=()=>{window.print()}<\/script></body></html>`)
  win.document.close()
}

// ─── CUSTOMER LEAF NODE ────────────────────────────────────────────────────────
function CustomerLeafNode({ node, dark, text, subtext, colorIdx=0, superAdminEmail='', promotorInfo=null }) {
  const c = PR_TREE_COLORS[colorIdx % PR_TREE_COLORS.length]

  return (
    <div
      style={{
        background: dark ? `rgba(${hexToRgb(c)},0.06)` : `rgba(${hexToRgb(c)},0.08)`,
        border: `1px solid rgba(${hexToRgb(c)},0.35)`,
        borderRadius:'12px', padding:'12px 16px',
        minWidth:'160px', maxWidth:'200px',
        cursor:'default',
        transition:'all 0.3s ease', position:'relative',
      }}
      onMouseEnter={e => {
        clearTimeout(_prChainHideTimer)
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(${hexToRgb(c)},0.25)`
        e.currentTarget.style.borderColor = `rgba(${hexToRgb(c)},0.7)`
        showPRChainPopup(e.currentTarget, node, dark, text, subtext, superAdminEmail, promotorInfo)
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = `rgba(${hexToRgb(c)},0.35)`
        _prChainHideTimer = setTimeout(() => removePRChainPopup(), 300)
      }}
    >
      <div style={{ display:'inline-block', fontSize:'9px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', marginBottom:'8px', background:`rgba(${hexToRgb(c)},0.15)`, color:c, border:`1px solid rgba(${hexToRgb(c)},0.35)` }}>
        👤 CUSTOMER
      </div>
      <div style={{ color:c, fontFamily:'monospace', fontSize:'10px', marginBottom:'4px', wordBreak:'break-all' }}>{node.customer_id}</div>
      <div style={{ color:text, fontWeight:700, fontSize:'13px', marginBottom:'6px' }}>{node.first_name || '—'} {node.last_name || ''}</div>
      <div style={{ color:subtext, fontSize:'11px', marginBottom:'2px' }}>📞 {node.mobile_number}</div>
      {node.city_name && <div style={{ color:subtext, fontSize:'11px' }}>📍 {node.city_name}</div>}

      <div style={{ marginTop:'8px', width:'100%', height:2, borderRadius:2, background:`linear-gradient(90deg,rgba(${hexToRgb(c)},0.2),${c})` }} />

      <button
        onClick={e => { e.stopPropagation(); printCustomerCard(node, c, superAdminEmail, promotorInfo) }}
        style={{ marginTop:'8px', width:'100%', padding:'3px 0', fontSize:'9px', fontWeight:700, background:`rgba(${hexToRgb(c)},0.1)`, border:`1px solid rgba(${hexToRgb(c)},0.35)`, borderRadius:'6px', color:c, cursor:'pointer', letterSpacing:'0.8px', transition:'all 0.2s ease' }}
        onMouseEnter={e => e.currentTarget.style.background = `rgba(${hexToRgb(c)},0.25)`}
        onMouseLeave={e => e.currentTarget.style.background = `rgba(${hexToRgb(c)},0.1)`}
      >🖨️ PRINT</button>
    </div>
  )
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function PromotorDashboard() {
  const navigate = useNavigate()
  const [dark, setDark]               = useState(true)
  const [customers, setCustomers]     = useState([])
  const [promotorInfo, setPromotorInfo] = useState(null)
  const [showForm, setShowForm]       = useState(false)
  const [showHierarchy, setShowHierarchy] = useState(false)
  const [msg, setMsg]                 = useState('')
  const [msgType, setMsgType]         = useState('success')
  const [form, setForm]               = useState(emptyForm)
  const canvasRef = useRef(null)

  const bg         = dark ? '#020617' : '#f8fafc'
  const text       = dark ? '#f8fafc' : '#020617'
  const subtext    = dark ? '#94a3b8' : '#64748b'
  const accent     = dark ? '#f472b6' : '#db2777'
  const border     = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const glass      = dark ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.7)'
  const cardBg     = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const cardBorder = dark ? '1px solid rgba(244,114,182,0.1)' : '1px solid rgba(0,0,0,0.1)'
  const inpBg      = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const inpBorder  = dark ? '#374151' : '#d1d5db'

  // ── Particle canvas ──
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId, pts = []
    const mouse = { x: null, y: null, radius: 150 }
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    const onMouse  = e => { mouse.x = e.x; mouse.y = e.y }
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouse)
    onResize()
    class Pt {
      constructor() { this.x=Math.random()*canvas.width; this.y=Math.random()*canvas.height; this.size=Math.random()*2+1; this.sx=(Math.random()-.5)*.8; this.sy=(Math.random()-.5)*.8 }
      update() {
        this.x+=this.sx; this.y+=this.sy
        if(this.x>canvas.width||this.x<0) this.sx*=-1
        if(this.y>canvas.height||this.y<0) this.sy*=-1
        let dx=mouse.x-this.x,dy=mouse.y-this.y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<mouse.radius){const fx=dx/d,fy=dy/d,f=(mouse.radius-d)/mouse.radius;this.x-=fx*f*5;this.y-=fy*f*5}
      }
      draw() { ctx.fillStyle= dark?'rgba(244,114,182,0.5)':'rgba(219,39,119,0.4)'; ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill() }
    }
    function init(){pts=[];for(let i=0;i<60;i++)pts.push(new Pt())}
    function connect(){
      for(let a=0;a<pts.length;a++) for(let b=a;b<pts.length;b++){
        let dx=pts[a].x-pts[b].x,dy=pts[a].y-pts[b].y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<150){ctx.strokeStyle=dark?`rgba(244,114,182,${1-d/150})`:`rgba(219,39,119,${0.5-d/300})`;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(pts[a].x,pts[a].y);ctx.lineTo(pts[b].x,pts[b].y);ctx.stroke()}
      }
    }
    function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);pts.forEach(p=>{p.update();p.draw()});connect();animId=requestAnimationFrame(animate)}
    init(); animate()
    return () => { window.removeEventListener('resize',onResize); window.removeEventListener('mousemove',onMouse); cancelAnimationFrame(animId) }
  }, [dark])

  const fetchAll = async () => {
    try {
      const [custRes, dashRes] = await Promise.allSettled([
        api.get('/customers/'),
        api.get('/dashboard/'),
      ])
      if (custRes.status === 'fulfilled') setCustomers(custRes.value.data)
      if (dashRes.status === 'fulfilled') {
        setPromotorInfo(dashRes.value.data)
        if (dashRes.value.data?.super_admin_email) {
          localStorage.setItem('superAdminEmail', dashRes.value.data.super_admin_email)
        }
      }
    } catch(err) { console.error(err) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/customers/', form)
      setMsg('✅ Customer created successfully!'); setMsgType('success')
      setShowForm(false); fetchAll(); setForm(emptyForm)
    } catch(err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data)); setMsgType('error')
    }
  }

  const card     = { background: cardBg, border: cardBorder, borderRadius:'20px', padding:'32px 36px', marginBottom:'24px' }
  const secHead  = (col='#fbcfe8') => ({ color:col, fontSize:'13px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 20px', paddingBottom:'14px', borderBottom: cardBorder })
  const secLabel = (col='#fbcfe8') => ({ color:col, fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'4px 0 0', paddingBottom:'10px', borderBottom: cardBorder })
  const inp      = { width:'100%', background: inpBg, border:`1px solid ${inpBorder}`, borderRadius:'10px', padding:'12px 16px', color: text, fontSize:'14px', outline:'none', boxSizing:'border-box' }
  const lbl      = { display:'block', color: subtext, fontSize:'12px', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.04em' }

  const superAdminEmail = localStorage.getItem('superAdminEmail') || ''

  return (
    <div style={{ minHeight:'100vh', background: bg, color: text, transition:'background 0.8s ease, color 0.4s ease', fontFamily:'"Inter",system-ui,sans-serif', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes float-orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
        @keyframes antigravity{0%{transform:translateY(110vh) rotate(0deg);opacity:0}10%{opacity:var(--op)}90%{opacity:var(--op)}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes prPopupIn{from{opacity:0;transform:translateY(8px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes prPulseGlow{0%,100%{box-shadow:0 0 8px rgba(244,114,182,0.15);}50%{box-shadow:0 0 22px rgba(244,114,182,0.35);}}
        @keyframes prDotPulse{0%,100%{transform:scale(1);opacity:0.7;}50%{transform:scale(1.6);opacity:1;}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .pr-inp:focus{border-color:#f472b6 !important}
        .pr-grad-btn{position:relative;overflow:hidden}
        .pr-grad-btn::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%)}
        .pr-grad-btn:hover::after{animation:shimmer 1s infinite}
        .pr-tr:hover td{background:rgba(255,255,255,.02)}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, pointerEvents:'none', zIndex:1, opacity:0.45 }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, top:'8%', left:'8%', width:'380px', height:'380px', background: dark?'rgba(244,114,182,0.08)':'rgba(219,39,119,0.08)' }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, bottom:'10%', right:'4%', width:'460px', height:'460px', background: dark?'rgba(167,139,250,0.06)':'rgba(139,92,246,0.06)', animationDelay:'-5s' }} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, bottom:'-100px', width:p.size, height:p.size, borderRadius:'40% 60% 60% 40% / 40% 40% 60% 60%', border:`1px solid ${accent}44`, opacity:p.opacity, animation:`antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op':p.opacity, pointerEvents:'none', zIndex:0 }} />
      ))}

      {/* Navbar */}
      <div style={{ position:'relative', zIndex:10, background: glass, borderBottom:`1px solid ${border}`, padding:'18px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', backdropFilter:'blur(16px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginLeft:'10px' }}>
          <img src={logo} alt="BitByte Logo" style={{ width:60, height:50, borderRadius:'10px', objectFit:'contain' }} />
          <span style={{ color:'#fbcfe8', fontWeight:700, fontSize:'14px' }}>🌟 Promotor Dashboard</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ color: subtext, fontSize:'14px' }}>{localStorage.getItem('email')}</span>
          <button onClick={() => setDark(!dark)} style={{ padding:'8px 16px', borderRadius:'16px', border:`1px solid ${border}`, background:'transparent', color: text, cursor:'pointer', fontWeight:600, fontSize:'13px' }}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/login') }} style={{ padding:'8px 18px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'10px', fontSize:'13px', cursor:'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ position:'relative', zIndex:10, padding:'36px 40px', maxWidth:'1200px', margin:'0 auto' }}>
        {msg && (
          <div style={{ background: msgType==='success'?'rgba(244,114,182,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msgType==='success'?'rgba(244,114,182,0.25)':'rgba(239,68,68,0.3)'}`, color: msgType==='success'?'#f472b6':'#f87171', borderRadius:'12px', padding:'14px 20px', fontSize:'14px', marginBottom:'20px' }}>
            {msg}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h2 style={{ fontSize:'22px', fontWeight:800, margin:0 }}>Customer Management</h2>
          <div style={{ display:'flex', gap:'12px' }}>
            <button onClick={() => setShowHierarchy(true)}
              style={{ padding:'11px 28px', background:'rgba(244,114,182,0.08)', border:'1px solid rgba(244,114,182,0.3)', borderRadius:'12px', fontWeight:700, color:'#fbcfe8', fontSize:'14px', cursor:'pointer' }}>
              🏢 Customer Hierarchy
            </button>
            <button onClick={() => setShowForm(!showForm)} className="pr-grad-btn"
              style={{ padding:'11px 28px', background:'linear-gradient(90deg,#f472b6,#a78bfa)', border:'none', borderRadius:'12px', fontWeight:800, color:'#3b0024', fontSize:'14px', cursor:'pointer' }}>
              {showForm ? 'Cancel' : '+ Create Customer'}
            </button>
          </div>
        </div>

        {/* ── HIERARCHY MODAL ── */}
        {showHierarchy && (
          <div onClick={() => { setShowHierarchy(false); removePRChainPopup() }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'40px', overflowY:'auto' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: dark?'#0f172a':'#f8fafc', border:'1px solid rgba(244,114,182,0.2)', borderRadius:'20px', padding:'32px', maxWidth:'1100px', width:'95%', marginBottom:'40px' }}>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', paddingBottom:'14px', borderBottom:'1px solid rgba(244,114,182,0.1)' }}>
                <span style={{ color:'#fbcfe8', fontSize:'13px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>🏢 Customer Hierarchy</span>
                <button onClick={() => { setShowHierarchy(false); removePRChainPopup() }}
                  style={{ background:'transparent', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'8px', padding:'6px 14px', cursor:'pointer', fontSize:'12px' }}>
                  ✕ Close
                </button>
              </div>

              <div style={{ overflowX:'auto', overflowY:'auto', scrollBehavior:'smooth', scrollbarWidth:'thin', scrollbarColor:'rgba(244,114,182,0.35) transparent' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:'max-content', margin:'0 auto' }}>

                  {/* Promotor Root */}
                  <div style={{
                    background:'linear-gradient(135deg,rgba(244,114,182,0.13),rgba(167,139,250,0.08))',
                    border:'1px solid rgba(244,114,182,0.55)',
                    borderRadius:'16px', padding:'16px 48px',
                    fontWeight:800, fontSize:'16px', color:'#f472b6',
                    animation:'prPulseGlow 3s ease-in-out infinite',
                    boxShadow:'0 0 24px rgba(244,114,182,0.1)',
                  }}>
                    🌟 Promotor
                    <div style={{ fontSize:'11px', color:'#94a3b8', fontWeight:400, marginTop:'4px', textAlign:'center' }}>
                      {localStorage.getItem('email')}
                    </div>
                  </div>

                  <div style={{ width:2, height:32, background:'linear-gradient(180deg,#f472b6,rgba(244,114,182,0.3))' }}>
                    <div style={{ position:'relative' }}>
                      <div style={{ position:'absolute', bottom:-4, left:'50%', transform:'translateX(-50%)', width:7, height:7, borderRadius:'50%', background:'#f472b6', animation:'prDotPulse 2s ease-in-out infinite' }} />
                    </div>
                  </div>

                  {customers.length > 0 ? (
                    <>
                      <div style={{ height:2, background:'linear-gradient(90deg,transparent,rgba(244,114,182,0.5),transparent)', width:'80%' }} />
                      <div style={{ display:'flex', gap:'32px', justifyContent:'center', alignItems:'flex-start', flexWrap:'wrap', paddingTop:0 }}>
                        {customers.map((cust, ci) => (
                          <div key={cust.id} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                            <div style={{ width:2, height:24, background:'rgba(244,114,182,0.5)', position:'relative' }}>
                              <div style={{ position:'absolute', bottom:-3, left:'50%', transform:'translateX(-50%)', width:6, height:6, borderRadius:'50%', background:PR_TREE_COLORS[ci % PR_TREE_COLORS.length], animation:`prDotPulse ${1.8+ci*0.2}s ease-in-out infinite` }} />
                            </div>
                            <CustomerLeafNode
                              node={cust}
                              dark={dark}
                              text={text}
                              subtext={subtext}
                              colorIdx={ci}
                              superAdminEmail={superAdminEmail}
                              promotorInfo={promotorInfo}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ color:subtext, padding:'60px', textAlign:'center', fontSize:'15px' }}>No customers yet.</div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', justifyContent:'center', marginTop:'28px', paddingTop:'20px', borderTop:'1px solid rgba(244,114,182,0.1)' }}>
                {[
                  { role:'Promotor', color:'#f472b6', emoji:'🌟' },
                  { role:'Customer', color:'#a78bfa', emoji:'👤' },
                ].map(l => (
                  <div key={l.role} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background: l.color }} />
                    <span style={{ color: subtext, fontSize:'12px' }}>{l.emoji} {l.role}</span>
                  </div>
                ))}
                <div style={{ color: subtext, fontSize:'12px', width:'100%', textAlign:'center', marginTop:'4px' }}>
                  💡 Hover any node to see full hierarchy chain
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE FORM ── */}
        {showForm && (
          <div style={card}>
            <p style={secHead('#fbcfe8')}>Create New Customer</p>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

              <p style={secLabel('#fbcfe8')}>👤 Personal Info</p>
              <div style={{ display:'grid', gridTemplateColumns:'0.4fr 1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Initial</label><input name="initial" value={form.initial} onChange={handleChange} maxLength={5} className="pr-inp" style={inp}/></div>
                <div><label style={lbl}>First Name *</label><input name="first_name" value={form.first_name} onChange={handleChange} required maxLength={100} className="pr-inp" style={inp}/></div>
                <div><label style={lbl}>Last Name *</label><input name="last_name" value={form.last_name} onChange={handleChange} required maxLength={100} className="pr-inp" style={inp}/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Mobile *</label><input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required className="pr-inp" style={inp}/></div>
                <div><label style={lbl}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required className="pr-inp" style={inp}/></div>
                <div><label style={lbl}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required className="pr-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#fbcfe8')}>📍 Address</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Door No *</label><input name="door_no" value={form.door_no} onChange={handleChange} required className="pr-inp" style={inp}/></div>
                <div><label style={lbl}>Street Name *</label><input name="street_name" value={form.street_name} onChange={handleChange} required className="pr-inp" style={inp}/></div>
                <div><label style={lbl}>Town *</label><input name="town_name" value={form.town_name} onChange={handleChange} required className="pr-inp" style={inp}/></div>
                <div><label style={lbl}>City *</label><input name="city_name" value={form.city_name} onChange={handleChange} required className="pr-inp" style={inp}/></div>
                <div><label style={lbl}>District *</label><input name="district" value={form.district} onChange={handleChange} required className="pr-inp" style={inp}/></div>
                <div><label style={lbl}>State *</label><input name="state" value={form.state} onChange={handleChange} required className="pr-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#fbcfe8')}>🪪 Identity</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Aadhaar No *</label><input name="aadhaar_no" value={form.aadhaar_no} onChange={handleChange} required maxLength={12} className="pr-inp" style={inp}/></div>
                <div><label style={lbl}>PAN No *</label><input name="pan_no" value={form.pan_no} onChange={handleChange} required maxLength={10} className="pr-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#fbcfe8')}>💼 Occupation</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Occupation *</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} required className="pr-inp" style={{ ...inp, cursor:'pointer' }}>
                    <option value="" style={{ background:'#1a1f26' }}>Select</option>
                    {OCCUPATIONS.map(o => <option key={o} value={o} style={{ background:'#1a1f26' }}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} className="pr-inp" style={inp}/></div>
                <div><label style={lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required className="pr-inp" style={inp}/></div>
              </div>

              <div style={{ display:'flex', gap:'12px', marginTop:'6px' }}>
                <button type="submit" className="pr-grad-btn"
                  style={{ padding:'12px 28px', background:'linear-gradient(90deg,#f472b6,#a78bfa)', border:'none', borderRadius:'12px', fontWeight:800, color:'#3b0024', fontSize:'14px', cursor:'pointer' }}>
                  Create Customer
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding:'12px 24px', background: inpBg, border:`1px solid ${border}`, borderRadius:'12px', color: subtext, fontSize:'14px', cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── CUSTOMERS TABLE ── */}
        <div style={card}>
          <p style={secHead('#fbcfe8')}>My Customers ({customers.length})</p>
          {customers.length === 0 ? (
            <p style={{ color: subtext, textAlign:'center', padding:'60px 0', fontSize:'15px' }}>No customers yet!</p>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'15px' }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${inpBorder}` }}>
                    {['Customer ID','First Name','Last Name','Email','Mobile','City','Created'].map(h => (
                      <th key={h} style={{ padding:'14px 16px', textAlign:'left', color: subtext, fontSize:'13px', fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={i} className="pr-tr" style={{ borderBottom:`1px solid ${border}` }}>
                      <td style={{ padding:'14px 16px', color:'#f472b6', fontFamily:'monospace', fontSize:'13px' }}>{c.customer_id}</td>
                      <td style={{ padding:'14px 16px', color: text }}>{c.first_name}</td>
                      <td style={{ padding:'14px 16px', color: text }}>{c.last_name}</td>
                      <td style={{ padding:'14px 16px', color: subtext }}>{c.email}</td>
                      <td style={{ padding:'14px 16px', color: subtext }}>{c.mobile_number}</td>
                      <td style={{ padding:'14px 16px', color: subtext }}>{c.city_name}</td>
                      <td style={{ padding:'14px 16px', color: subtext, whiteSpace:'nowrap' }}>{new Date(c.created_at).toLocaleDateString()}</td>
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