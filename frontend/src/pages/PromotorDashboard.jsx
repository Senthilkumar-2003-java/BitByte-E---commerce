import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import logo from '../assets/logo.png'

const OCCUPATIONS = ['employee', 'business', 'others']
const emptyForm = {
  initial:'', first_name:'', last_name:'', mobile_number:'', email:'', password:'',
  door_no:'', street_name:'', town_name:'', city_name:'',
  district:'', state:'', aadhaar_no:'', pan_no:'',
  occupation:'', occupation_detail:'', annual_salary:''
}

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, size: Math.random() * 60 + 10, x: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 12 + 15, opacity: Math.random() * 0.2 + 0.05,
}))

const CUSTOMER_COLORS = ['#f472b6', '#22d3ee', '#4ade80', '#a78bfa', '#fb923c']

let _cpopupEl = null
let _chideTimer = null

function removeCustomerPopup() {
  document.querySelectorAll('#customer-popup').forEach(el => el.remove())
  _cpopupEl = null
}

function scheduleCustomerHide(setActiveCustomer) {
  clearTimeout(_chideTimer)
  _chideTimer = setTimeout(() => {
    removeCustomerPopup()
    setActiveCustomer(null)
  }, 120)
}

function createCustomerPopup(cust, i, anchorEl, dark, hierarchy) {
  removeCustomerPopup()

  const c           = CUSTOMER_COLORS[i % CUSTOMER_COLORS.length]
  const popupBg     = dark ? 'linear-gradient(160deg,#091525,#060e1c)' : 'linear-gradient(160deg,#ffffff,#f1f5f9)'
  const popupBorder = dark ? 'rgba(244,114,182,0.25)' : 'rgba(219,39,119,0.25)'
  const divider     = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const accentColor = dark ? '#f472b6' : '#db2777'
  const text2       = dark ? '#f8fafc' : '#020617'
  const subtext2    = dark ? '#94a3b8' : '#64748b'

  const { superAdminEmail, admin, dealer, subDealer, promotor } = hierarchy

  function tierBox(badge, badgeColor, boxBg, boxBorder, id, name, contact, city) {
    return `
      <div style="border-radius:9px;padding:10px;margin-bottom:6px;background:${boxBg};border:1px solid ${boxBorder};">
        <div style="display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;
          background:${boxBg};color:${badgeColor};border:1px solid ${boxBorder};margin-bottom:6px;">${badge}</div>
        <div style="font-size:10px;color:${badgeColor};font-family:monospace;margin-bottom:3px;">${id || '—'}</div>
        <div style="font-size:13px;font-weight:700;color:${text2};margin-bottom:4px;">${name || '—'}</div>
        <div style="font-size:11px;color:${subtext2};margin-bottom:2px;">📞 ${contact || '—'}</div>
        <div style="font-size:11px;color:${subtext2};">📍 ${city || '—'}</div>
      </div>`
  }

  function arrow(fromColor) {
    return `
      <div style="display:flex;justify-content:center;padding:2px 0;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid ${fromColor};"></div>
          <div style="width:2px;height:6px;background:linear-gradient(180deg,${fromColor},${fromColor}44);"></div>
        </div>
      </div>`
  }

  const el = document.createElement('div')
  el.id = 'customer-popup'
  el.style.cssText = `
    position:fixed; z-index:9999;
    background:${popupBg}; border:1px solid ${popupBorder};
    border-radius:14px; padding:14px;
    box-shadow:0 16px 48px rgba(0,0,0,0.5);
    animation:custPopupIn 0.25s cubic-bezier(0.22,1,0.36,1) both;
    min-width:220px; max-width:260px;
    display:flex; flex-direction:column; align-items:stretch;
  `

  el.innerHTML = `
    <div style="font-size:9px;color:${accentColor};font-weight:700;letter-spacing:1.3px;margin-bottom:10px;
      padding-bottom:8px;border-bottom:1px solid ${divider};display:flex;align-items:center;gap:6px;">
      <span style="width:5px;height:5px;border-radius:50%;background:${accentColor};display:inline-block;"></span>
      CREATED BY
    </div>

    <!-- Super Admin -->
    <div style="border-radius:9px;padding:10px;margin-bottom:4px;background:rgba(255,215,0,0.05);border:1px solid rgba(255,215,0,0.22);">
      <div style="display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;
        background:rgba(255,215,0,0.12);color:#ffd700;border:1px solid rgba(255,215,0,0.3);margin-bottom:6px;">🛡️ SUPER ADMIN</div>
      <div style="font-size:11px;color:${subtext2};word-break:break-all;">${superAdminEmail}</div>
      <div style="margin-top:4px;font-size:9px;padding:2px 7px;background:rgba(255,215,0,0.1);
        border:1px solid rgba(255,215,0,0.25);border-radius:20px;color:#ffd700;display:inline-block;">● ONLINE</div>
    </div>

    ${arrow('#ffd700')}

    ${tierBox('🛡️ ADMIN','#4ade80','rgba(74,222,128,0.05)','rgba(74,222,128,0.2)',
      admin?.admin_id,
      admin?.first_name || admin?.admin_name,
      admin?.mobile_number || admin?.admin_contact_no,
      admin?.city_name
    )}

    ${arrow('#4ade80')}

    ${tierBox('🏪 DEALER','#22d3ee','rgba(34,211,238,0.04)','rgba(34,211,238,0.18)',
      dealer?.dealer_id,
      dealer?.first_name,
      dealer?.mobile_number,
      dealer?.city_name
    )}

    ${arrow('#22d3ee')}

    ${tierBox('💎 SUB DEALER','#f59e0b','rgba(245,158,11,0.05)','rgba(245,158,11,0.2)',
      subDealer?.sub_dealer_id,
      subDealer?.first_name,
      subDealer?.mobile_number,
      subDealer?.city_name
    )}

    ${arrow('#f59e0b')}

    ${tierBox('🌟 PROMOTOR','#a78bfa','rgba(167,139,250,0.05)','rgba(167,139,250,0.2)',
      promotor?.promotor_id,
      promotor?.first_name,
      promotor?.mobile_number || promotor?.promotor_contact_no,
      promotor?.city_name
    )}

    ${arrow(c)}

    <!-- Customer -->
    <div style="background:rgba(244,114,182,0.05);border:1px solid rgba(244,114,182,0.2);border-radius:10px;padding:10px;">
      <div style="display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;
        background:rgba(244,114,182,0.12);color:${c};border:1px solid rgba(244,114,182,0.25);margin-bottom:6px;">👤 CUSTOMER</div>
      <div style="font-size:10px;color:${c};font-family:monospace;margin-bottom:3px;">${cust.customer_id || '—'}</div>
      <div style="font-size:14px;font-weight:700;color:${text2};margin-bottom:6px;">${cust.first_name || ''}</div>
      <div style="font-size:11px;color:${subtext2};margin-bottom:2px;">📞 ${cust.mobile_number || '—'}</div>
      <div style="font-size:11px;color:${subtext2};">📍 ${cust.city_name || '—'}</div>
    </div>
  `

  document.body.appendChild(el)

  const rect = anchorEl.getBoundingClientRect()
  const popW = el.offsetWidth  || 260
  const popH = el.offsetHeight || 580
  let left   = rect.right + 14
  let top    = rect.top + (rect.height / 2) - (popH / 2)
  if (left + popW > window.innerWidth  - 10) left = rect.left - popW - 14
  if (top < 8)                               top  = 8
  if (top + popH > window.innerHeight  - 8) top  = window.innerHeight - popH - 8
  el.style.left = left + 'px'
  el.style.top  = top  + 'px'

  el.addEventListener('mouseenter', () => clearTimeout(_chideTimer))
  el.addEventListener('mouseleave', () => scheduleCustomerHide(() => {}))
  _cpopupEl = el
}

// ─────────────────────────────────────────────
export default function PromotorDashboard() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  const [customers,       setCustomers]       = useState([])
  const [promotors,       setPromotors]       = useState([])
  const [subDealers,      setSubDealers]      = useState([])
  const [dealers,         setDealers]         = useState([])
  const [admins,          setAdmins]          = useState([])
  const [selectedPromotor, setSelectedPromotor] = useState(null)
  const [showForm,        setShowForm]        = useState(false)
  const [showHierarchy,   setShowHierarchy]   = useState(false)
  const [activeCustomer,  setActiveCustomer]  = useState(null)
  const [msg,     setMsg]     = useState('')
  const [msgType, setMsgType] = useState('success')
  const [form,    setForm]    = useState(emptyForm)
  const canvasRef = useRef(null)

  const bg         = dark ? '#020617' : '#f8fafc'
  const text       = dark ? '#f8fafc' : '#020617'
  const subtext    = dark ? '#94a3b8' : '#64748b'
  const accent     = dark ? '#f472b6' : '#db2777'
  const border     = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const glass      = dark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.7)'
  const cardBg     = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const cardBorder = dark ? '1px solid rgba(244,114,182,0.1)' : '1px solid rgba(0,0,0,0.1)'
  const inpBg      = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const inpBorder  = dark ? '#374151' : '#d1d5db'

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId, particlesArray = []
    const mouse = { x: null, y: null, radius: 150 }
    const handleResize    = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    const handleMouseMove = (e) => { mouse.x = e.x; mouse.y = e.y }
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    handleResize()
    class Particle {
      constructor() { this.x=Math.random()*canvas.width; this.y=Math.random()*canvas.height; this.size=Math.random()*2+1; this.speedX=(Math.random()-.5)*.8; this.speedY=(Math.random()-.5)*.8 }
      update() {
        this.x+=this.speedX; this.y+=this.speedY
        if(this.x>canvas.width||this.x<0) this.speedX*=-1
        if(this.y>canvas.height||this.y<0) this.speedY*=-1
        let dx=mouse.x-this.x,dy=mouse.y-this.y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<mouse.radius){const fx=dx/d,fy=dy/d,f=(mouse.radius-d)/mouse.radius;this.x-=fx*f*5;this.y-=fy*f*5}
      }
      draw() { ctx.fillStyle= dark ? 'rgba(244,114,182,0.5)' : 'rgba(219,39,119,0.4)'; ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill() }
    }
    function init(){particlesArray=[];for(let i=0;i<60;i++)particlesArray.push(new Particle())}
    function connect(){
      for(let a=0;a<particlesArray.length;a++) for(let b=a;b<particlesArray.length;b++){
        let dx=particlesArray[a].x-particlesArray[b].x,dy=particlesArray[a].y-particlesArray[b].y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<150){ctx.strokeStyle= dark ? `rgba(244,114,182,${1-d/150})` : `rgba(219,39,119,${0.5-d/300})`;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(particlesArray[a].x,particlesArray[a].y);ctx.lineTo(particlesArray[b].x,particlesArray[b].y);ctx.stroke()}
      }
    }
    function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);particlesArray.forEach(p=>{p.update();p.draw()});connect();animationFrameId=requestAnimationFrame(animate)}
    init(); animate()
    return () => { window.removeEventListener('resize',handleResize); window.removeEventListener('mousemove',handleMouseMove); cancelAnimationFrame(animationFrameId) }
  }, [dark])

  const fetchAll = async () => {
    try {
      const [custRes, proRes, sdRes, dlRes, adRes] = await Promise.all([
        api.get('/customers/'),
        api.get('/promotors/list/'),
        api.get('/sub-dealers/list/'),
        api.get('/dealers/list/'),
        api.get('/admins/list/'),
      ])
      const proList = proRes.data
      const sdList  = sdRes.data
      const dlList  = dlRes.data
      const adList  = adRes.data

      const enriched = custRes.data.map(cust => {
        // Find promotor who created this customer
        const promotor = proList.find(p =>
          String(p.id) === String(cust.assigned_promotor_id) ||
          String(p.promotor_id) === String(cust.promotor_id) ||
          String(p.id) === String(cust.promotor) ||
          String(p.id) === String(cust.created_by)
        ) || null

        // Find sub dealer of that promotor
        const subDealer = sdList.find(s =>
          String(s.id) === String(promotor?.assigned_sub_dealer_id) ||
          String(s.sub_dealer_id) === String(promotor?.sub_dealer_id) ||
          String(s.id) === String(promotor?.sub_dealer)
        ) || null

        // Find dealer of that sub dealer
        const dealer = dlList.find(d =>
          String(d.id) === String(subDealer?.assigned_dealer_id) ||
          String(d.dealer_id) === String(subDealer?.dealer_id) ||
          String(d.id) === String(subDealer?.dealer)
        ) || null

        // Find admin of that dealer
        const admin = adList.find(a =>
          String(a.id) === String(dealer?.assigned_admin_id) ||
          String(a.id) === String(dealer?.admin_id) ||
          String(a.admin_id) === String(dealer?.admin_id) ||
          String(a.id) === String(dealer?.admin)
        ) || null

        return { ...cust, _promotor: promotor, _subDealer: subDealer, _dealer: dealer, _admin: admin }
      })

      setCustomers(enriched)
      setPromotors(proList)
      setSubDealers(sdList)
      setDealers(dlList)
      setAdmins(adList)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handlePromotorChange = (e) => {
    const id = parseInt(e.target.value)
    const pro = promotors.find(p => p.id === id)
    setSelectedPromotor(pro || null)
    setForm({ ...form, assigned_promotor_id: id })
  }
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/customers/', form)
      setMsg('✅ Customer created successfully!'); setMsgType('success')
      setShowForm(false); fetchAll(); setForm(emptyForm); setSelectedPromotor(null)
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data)); setMsgType('error')
    }
  }

  const card     = { background: cardBg, border: cardBorder, borderRadius:'20px', padding:'32px 36px', marginBottom:'24px' }
  const secHead  = (color='#f9a8d4') => ({ color, fontSize:'13px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 20px', paddingBottom:'14px', borderBottom: cardBorder })
  const secLabel = (color='#f9a8d4') => ({ color, fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'4px 0 0', paddingBottom:'10px', borderBottom: cardBorder })
  const inp      = { width:'100%', background: inpBg, border:`1px solid ${inpBorder}`, borderRadius:'10px', padding:'12px 16px', color: text, fontSize:'14px', outline:'none', boxSizing:'border-box' }
  const lbl      = { display:'block', color: subtext, fontSize:'12px', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.04em' }

  return (
    <div style={{ minHeight:'100vh', background: bg, color: text, transition:'background 0.8s ease, color 0.4s ease', fontFamily:'"Inter",system-ui,sans-serif', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes float-orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
        @keyframes antigravity{0%{transform:translateY(110vh) rotate(0deg);opacity:0}10%{opacity:var(--op)}90%{opacity:var(--op)}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes custPopupIn{from{opacity:0;transform:translateY(8px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes custPulseGlow{0%,100%{box-shadow:0 0 8px rgba(244,114,182,0.15);}50%{box-shadow:0 0 22px rgba(244,114,182,0.35);}}
        @keyframes custDotPulse{0%,100%{transform:scale(1);opacity:0.7;}50%{transform:scale(1.6);opacity:1;}}
        .pro-inp:focus{border-color:#f472b6 !important}
        .pro-grad-btn{position:relative;overflow:hidden}
        .pro-grad-btn::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%)}
        .pro-grad-btn:hover::after{animation:shimmer 1s infinite}
        .pro-tr:hover td{background:rgba(255,255,255,.02)}
        .c-card{background:rgba(255,255,255,0.03);border:1px solid rgba(244,114,182,0.18);border-radius:14px;padding:14px 18px;min-width:140px;cursor:pointer;position:relative;overflow:hidden;transition:background 0.35s ease,border-color 0.35s ease,transform 0.4s cubic-bezier(0.34,1.4,0.64,1),box-shadow 0.35s ease;}
        .c-card.c-active{background:rgba(244,114,182,0.07);border-color:rgba(244,114,182,0.65);transform:translateY(-6px) scale(1.02);box-shadow:0 12px 32px rgba(244,114,182,0.18);animation:custPulseGlow 2.5s ease-in-out infinite;}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, pointerEvents:'none', zIndex:1, opacity:0.45 }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, top:'8%', left:'8%', width:'380px', height:'380px', background: dark ? 'rgba(244,114,182,0.08)' : 'rgba(219,39,119,0.06)' }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, bottom:'10%', right:'4%', width:'460px', height:'460px', background: dark ? 'rgba(251,146,60,0.06)' : 'rgba(251,146,60,0.04)', animationDelay:'-5s' }} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, bottom:'-100px', width:p.size, height:p.size, borderRadius:'40% 60% 60% 40% / 40% 40% 60% 60%', border:`1px solid ${accent}44`, opacity:p.opacity, animation:`antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op':p.opacity, pointerEvents:'none', zIndex:0 }} />
      ))}

      {/* Navbar */}
      <div style={{ position:'relative', zIndex:10, background: glass, borderBottom:`1px solid ${border}`, padding:'18px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', backdropFilter:'blur(16px)', transition:'background 0.8s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginLeft:'10px' }}>
          <img src={logo} alt="BitByte Logo" style={{ width:60, height:50, borderRadius:'10px', objectFit:'contain' }} />
          <span style={{ color:'#f9a8d4', fontWeight:700, fontSize:'14px' }}>🌟 Promotor Dashboard</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ color: subtext, fontSize:'14px' }}>{localStorage.getItem('email')}</span>
          <button onClick={() => setDark(!dark)}
            style={{ padding:'8px 16px', borderRadius:'16px', border:`1px solid ${border}`, background:'transparent', color: text, cursor:'pointer', fontWeight:600, fontSize:'13px', transition:'all 0.3s ease' }}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ padding:'8px 18px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'10px', fontSize:'13px', cursor:'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ position:'relative', zIndex:10, padding:'36px 40px', maxWidth:'1200px', margin:'0 auto' }}>
        {msg && (
          <div style={{ background: msgType==='success' ? 'rgba(244,114,182,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${msgType==='success' ? 'rgba(244,114,182,0.25)' : 'rgba(239,68,68,0.3)'}`, color: msgType==='success' ? '#f472b6' : '#f87171', borderRadius:'12px', padding:'14px 20px', fontSize:'14px', marginBottom:'20px' }}>
            {msg}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h2 style={{ fontSize:'22px', fontWeight:800, margin:0 }}>Customer Management</h2>
          <div style={{ display:'flex', gap:'12px' }}>
            <button onClick={() => setShowHierarchy(true)}
              style={{ padding:'11px 28px', background:'rgba(244,114,182,0.08)', border:'1px solid rgba(244,114,182,0.3)', borderRadius:'12px', fontWeight:700, color:'#f9a8d4', fontSize:'14px', cursor:'pointer' }}>
              🏢 Customer Hierarchy
            </button>
            <button onClick={() => setShowForm(!showForm)} className="pro-grad-btn"
              style={{ padding:'11px 28px', background:'linear-gradient(90deg,#f472b6,#a78bfa)', border:'none', borderRadius:'12px', fontWeight:800, color:'#3b0030', fontSize:'14px', cursor:'pointer' }}>
              {showForm ? 'Cancel' : '+ Create Customer'}
            </button>
          </div>
        </div>

        {/* CUSTOMER HIERARCHY MODAL */}
        {showHierarchy && (
          <div onClick={() => { setShowHierarchy(false); setActiveCustomer(null); removeCustomerPopup() }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: dark ? '#0f172a' : '#f8fafc', border:'1px solid rgba(244,114,182,0.2)', borderRadius:'20px', padding:'32px', maxWidth:'960px', width:'95%', maxHeight:'80vh', overflowY:'auto' }}>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', paddingBottom:'14px', borderBottom:'1px solid rgba(244,114,182,0.1)' }}>
                <span style={{ color:'#f9a8d4', fontSize:'13px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>🏢 Customer Hierarchy</span>
                <button onClick={() => { setShowHierarchy(false); setActiveCustomer(null); removeCustomerPopup() }}
                  style={{ background:'transparent', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'8px', padding:'6px 14px', cursor:'pointer', fontSize:'12px' }}>
                  ✕ Close
                </button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>

                {/* Promotor node — top */}
                <div style={{
                  background:'linear-gradient(135deg,rgba(244,114,182,0.13),rgba(167,139,250,0.08))',
                  border:'1px solid rgba(244,114,182,0.55)',
                  borderRadius:'14px', padding:'13px 36px',
                  fontWeight:800, fontSize:'15px', color:'#f472b6',
                  whiteSpace:'nowrap', animation:'custPulseGlow 3s ease-in-out infinite'
                }}>
                  🌟 Promotor
                </div>

                <div style={{ width:2, height:28, background:'linear-gradient(180deg,#f472b6,rgba(244,114,182,0.3))', position:'relative' }}>
                  <div style={{ position:'absolute', bottom:-4, left:'50%', transform:'translateX(-50%)', width:7, height:7, borderRadius:'50%', background:'#f472b6', animation:'custDotPulse 2s ease-in-out infinite' }} />
                </div>

                <div style={{ height:2, background:'linear-gradient(90deg,transparent,rgba(244,114,182,0.5),transparent)', alignSelf:'stretch', margin:'0 40px' }} />

                {/* Customer cards */}
                <div style={{ display:'flex', gap:0, justifyContent:'space-around', alignSelf:'stretch', alignItems:'flex-start' }}>
                  {customers.length === 0 && <div style={{ color:'#94a3b8', padding:'40px' }}>No customers yet.</div>}
                  {customers.map((cust, i) => {
                    const c = CUSTOMER_COLORS[i % CUSTOMER_COLORS.length]
                    const isActive = activeCustomer?.id === cust.id
                    return (
                      <div key={cust.id || i} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                        <div style={{ width:2, height:28, background:`linear-gradient(180deg,${c}88,${c}33)`, position:'relative' }}>
                          <div style={{ position:'absolute', bottom:-3, left:'50%', transform:'translateX(-50%)', width:6, height:6, borderRadius:'50%', background:c, animation:`custDotPulse ${1.8+i*0.3}s ease-in-out infinite` }} />
                        </div>
                        <div
                          className={`c-card${isActive ? ' c-active' : ''}`}
                          onMouseEnter={e => {
                            clearTimeout(_chideTimer)
                            setActiveCustomer(cust)
                            createCustomerPopup(cust, i, e.currentTarget, dark, {
                              superAdminEmail: localStorage.getItem('superAdminEmail') || localStorage.getItem('email') || '—',
                              admin:     cust._admin,
                              dealer:    cust._dealer,
                              subDealer: cust._subDealer,
                              promotor:  cust._promotor,
                            })
                          }}
                          onMouseLeave={() => scheduleCustomerHide(setActiveCustomer)}
                        >
                          <div style={{ fontSize:9, color:c, fontFamily:'monospace', marginBottom:4 }}>{cust.customer_id || '—'}</div>
                          <div style={{ color:text, fontWeight:700, fontSize:13, marginBottom:6 }}>{cust.first_name || ''}</div>
                          <div style={{ color:'#94a3b8', fontSize:11, marginBottom:2 }}>📞 {cust.mobile_number}</div>
                          <div style={{ color:'#94a3b8', fontSize:11 }}>📍 {cust.city_name}</div>
                          <div style={{ marginTop:8, width:'100%', height:2, borderRadius:2, background:`linear-gradient(90deg,${c}44,${c}cc)` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Customer Form */}
        {showForm && (
          <div style={card}>
            <p style={secHead('#f9a8d4')}>Create New Customer</p>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

              <p style={secLabel('#f9a8d4')}>Account Info</p>
              <div style={{ display:'grid', gridTemplateColumns:'0.4fr 1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Initial</label><input name="initial" value={form.initial} onChange={handleChange} maxLength={5} className="pro-inp" style={inp}/></div>
                <div><label style={lbl}>First Name *</label><input name="first_name" value={form.first_name} onChange={handleChange} required maxLength={100} className="pro-inp" style={inp}/></div>
                <div><label style={lbl}>Last Name *</label><input name="last_name" value={form.last_name} onChange={handleChange} required maxLength={100} className="pro-inp" style={inp}/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Mobile *</label><input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required placeholder="10-digit" className="pro-inp" style={inp}/></div>
                <div><label style={lbl}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" className="pro-inp" style={inp}/></div>
                <div><label style={lbl}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required className="pro-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#f9a8d4')}>Address</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Door No *</label><input name="door_no" value={form.door_no} onChange={handleChange} required maxLength={25} className="pro-inp" style={inp}/></div>
                <div><label style={lbl}>Street Name *</label><input name="street_name" value={form.street_name} onChange={handleChange} required maxLength={100} className="pro-inp" style={inp}/></div>
                <div><label style={lbl}>Town *</label><input name="town_name" value={form.town_name} onChange={handleChange} required maxLength={100} className="pro-inp" style={inp}/></div>
                <div><label style={lbl}>City *</label><input name="city_name" value={form.city_name} onChange={handleChange} required maxLength={25} className="pro-inp" style={inp}/></div>
                <div><label style={lbl}>District *</label><input name="district" value={form.district} onChange={handleChange} required maxLength={25} className="pro-inp" style={inp}/></div>
                <div><label style={lbl}>State *</label><input name="state" value={form.state} onChange={handleChange} required maxLength={25} className="pro-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#f9a8d4')}>Identity</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Aadhaar No *</label><input name="aadhaar_no" value={form.aadhaar_no} onChange={handleChange} required maxLength={12} placeholder="12-digit" className="pro-inp" style={inp}/></div>
                <div><label style={lbl}>PAN No *</label><input name="pan_no" value={form.pan_no} onChange={handleChange} required maxLength={10} placeholder="ABCDE1234F" className="pro-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#f9a8d4')}>Occupation</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Occupation *</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} required className="pro-inp" style={{ ...inp, cursor:'pointer' }}>
                    <option value="" style={{ background:'#1a1f26' }}>Select</option>
                    {OCCUPATIONS.map(o => <option key={o} value={o} style={{ background:'#1a1f26' }}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} maxLength={25} className="pro-inp" style={inp}/></div>
                <div><label style={lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required maxLength={10} placeholder="e.g. 500000" className="pro-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#f9a8d4')}>Promotor Info</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Promotor ID *</label>
                  <select onChange={handlePromotorChange} className="pro-inp" style={{ ...inp, cursor:'pointer' }}>
                    <option value="" style={{ background:'#1a1f26' }}>Select Promotor ID</option>
                    {promotors.map(p => <option key={p.id} value={p.id} style={{ background:'#1a1f26' }}>{p.promotor_id}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Promotor Name</label>
                  <input value={selectedPromotor?.first_name || ''} readOnly placeholder="Auto fetch" style={{ ...inp, opacity:0.5, cursor:'not-allowed' }}/>
                </div>
                <div><label style={lbl}>Promotor Contact</label>
                  <input value={selectedPromotor?.mobile_number || selectedPromotor?.promotor_contact_no || ''} readOnly placeholder="Auto fetch" style={{ ...inp, opacity:0.5, cursor:'not-allowed' }}/>
                </div>
              </div>

              <div style={{ display:'flex', gap:'12px', marginTop:'6px' }}>
                <button type="submit" className="pro-grad-btn"
                  style={{ padding:'12px 28px', background:'linear-gradient(90deg,#f472b6,#a78bfa)', border:'none', borderRadius:'12px', fontWeight:800, color:'#3b0030', fontSize:'14px', cursor:'pointer' }}>
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

        {/* Customers Table */}
        <div style={card}>
          <p style={secHead('#f9a8d4')}>My Customers ({customers.length})</p>
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
                  {customers.map((cust, i) => (
                    <tr key={i} className="pro-tr" style={{ borderBottom:`1px solid ${border}` }}>
                      <td style={{ padding:'14px 16px', color:'#f472b6', fontFamily:'monospace', fontSize:'13px' }}>{cust.customer_id}</td>
                      <td style={{ padding:'14px 16px', color: text }}>{cust.first_name}</td>
                      <td style={{ padding:'14px 16px', color: text }}>{cust.last_name}</td>
                      <td style={{ padding:'14px 16px', color: subtext }}>{cust.email}</td>
                      <td style={{ padding:'14px 16px', color: subtext }}>{cust.mobile_number}</td>
                      <td style={{ padding:'14px 16px', color: subtext }}>{cust.city_name}</td>
                      <td style={{ padding:'14px 16px', color: subtext, whiteSpace:'nowrap' }}>{new Date(cust.created_at).toLocaleDateString()}</td>
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