import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import logo from '../assets/logo.png'

const OCCUPATION_OPTIONS = ['employee', 'business', 'others']


const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, size: Math.random() * 60 + 10, x: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 12 + 15, opacity: Math.random() * 0.2 + 0.05,
}))


const COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#f472b6']

const HIERARCHY_STYLES = `
@keyframes pulseGlow {
  0%,100% { box-shadow: 0 0 8px rgba(34,211,238,0.15); }
  50%      { box-shadow: 0 0 22px rgba(34,211,238,0.35); }
}
@keyframes shimmerSlide {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes dotPulse {
  0%,100% { transform:scale(1); opacity:0.7; }
  50%      { transform:scale(1.6); opacity:1; }
}
.h-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(165,243,252,0.18);
  border-radius: 14px;
  padding: 14px 18px;
  min-width: 150px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition:
    background 0.35s ease,
    border-color 0.35s ease,
    transform 0.4s cubic-bezier(0.34,1.4,0.64,1),
    box-shadow 0.35s ease;
}
.h-card::before {
  content:'';
  position:absolute; inset:0; border-radius:14px;
  background: linear-gradient(120deg,transparent 30%,rgba(34,211,238,0.07) 50%,transparent 70%);
  background-size:200% 100%;
  opacity:0;
  transition:opacity 0.3s;
  pointer-events:none;
}
.h-card.h-active::before {
  opacity:1;
  animation: shimmerSlide 2s infinite linear;
}
.h-card.h-active {
  background: rgba(34,211,238,0.07);
  border-color: rgba(34,211,238,0.65);
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 32px rgba(34,211,238,0.18), 0 0 0 1px rgba(34,211,238,0.08);
  animation: pulseGlow 2.5s ease-in-out infinite;
}
.h-panel {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1);
}
.h-panel.h-visible { opacity:1; transform:translateX(0); pointer-events:auto; }
.h-panel.h-hidden  { opacity:0; transform:translateX(14px); pointer-events:none; }
.h-pinner {
  position:absolute; top:0; left:0; width:100%;
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.22,1,0.36,1);
}
.h-pinner.h-show { opacity:1; transform:translateY(0); }
.h-pinner.h-hide { opacity:0; transform:translateY(8px); pointer-events:none; }
.sa-box {
  border-radius:9px; padding:11px; margin-bottom:10px;
  background:rgba(255,215,0,0.05);
  border:1px solid rgba(255,215,0,0.2);
  transition: background 0.35s ease, border-color 0.35s ease,
              box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.34,1.4,0.64,1);
}
.sa-box:hover {
  background:rgba(255,215,0,0.12);
  border-color:rgba(255,215,0,0.55);
  box-shadow:0 6px 20px rgba(255,215,0,0.15);
  transform:translateY(-3px) scale(1.02);
}
`
let _popupEl = null
let _hideTimer = null

function removeAdminPopup() {
  document.querySelectorAll('#admin-popup').forEach(el => el.remove())
  _popupEl = null
}

function scheduleHidePopup(setActiveAdmin) {
  clearTimeout(_hideTimer)
  _hideTimer = setTimeout(() => {
    removeAdminPopup()
    setActiveAdmin(null)
  }, 120)
}

function createAdminPopup(a, i, anchorEl, dark, subtext, text) {
  removeAdminPopup()
  const c = COLORS[i % COLORS.length]
  const popupBg = dark ? 'linear-gradient(160deg,#091525,#060e1c)' : 'linear-gradient(160deg,#ffffff,#f1f5f9)'
  const popupBorder = dark ? 'rgba(34,211,238,0.25)' : 'rgba(37,99,235,0.25)'
  const saBoxBg = dark ? 'rgba(255,215,0,0.05)' : 'rgba(255,193,7,0.08)'
  const saBoxBorder = dark ? 'rgba(255,215,0,0.22)' : 'rgba(255,193,7,0.35)'
  const adminBoxBg = dark ? 'rgba(34,211,238,0.04)' : 'rgba(37,99,235,0.05)'
  const adminBoxBd = dark ? 'rgba(34,211,238,0.14)' : 'rgba(37,99,235,0.2)'
  const accentColor = dark ? '#22d3ee' : '#2563eb'

  const el = document.createElement('div')
  el.id = 'admin-popup'
  el.style.cssText = `
    position:fixed; z-index:9999;
    background:${popupBg}; border:1px solid ${popupBorder};
    border-radius:14px; padding:14px;
    box-shadow:0 16px 48px rgba(0,0,0,0.45);
    animation:popupIn 0.25s cubic-bezier(0.22,1,0.36,1) both;
    min-width:200px; max-width:240px;
  `
  el.innerHTML = `
    <div style="font-size:9px;color:${accentColor};font-weight:700;letter-spacing:1.3px;margin-bottom:11px;padding-bottom:9px;border-bottom:1px solid ${popupBorder};display:flex;align-items:center;gap:6px;">
      <span style="width:5px;height:5px;border-radius:50%;background:${accentColor};display:inline-block;"></span>
      CREATED BY
    </div>
    <div style="border-radius:9px;padding:11px;margin-bottom:10px;background:${saBoxBg};border:1px solid ${saBoxBorder};">
      <div style="font-size:9px;color:#ffd700;font-weight:700;margin-bottom:5px;">🛡️ SUPER ADMIN</div>
      <div style="font-size:11px;color:${subtext};word-break:break-all;">${localStorage.getItem('email')}</div>
      <div style="margin-top:6px;font-size:9px;padding:2px 8px;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.25);border-radius:20px;color:#ffd700;display:inline-block;">● ONLINE</div>
    </div>
<div style="display:flex;justify-content:center;align-items:center;padding:4px 0;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid ${accentColor};"></div>
        <div style="width:2px;height:7px;background:linear-gradient(180deg,${accentColor},${accentColor}44);"></div>
      </div>
    </div>

    <div style="background:${adminBoxBg};border:1px solid ${adminBoxBd};border-radius:10px;padding:11px;">      <div style="display:inline-block;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(34,211,238,0.12);color:#22d3ee;border:1px solid rgba(34,211,238,0.25);margin-bottom:6px;">ADMIN</div>
      <div style="font-size:10px;color:${c};font-family:monospace;margin-bottom:3px;">${a.admin_id}</div>
<div style="font-size:13px;color:${text};font-weight:700;margin-bottom:6px;">${a.first_name}</div>
<div style="font-size:11px;color:${subtext};margin-bottom:3px;">📞 ${a.mobile_number}</div>   
      <div style="font-size:11px;color:${subtext};">📍 ${a.city_name}</div>
    </div>
  `
  document.body.appendChild(el)

  const rect = anchorEl.getBoundingClientRect()
  const popW = el.offsetWidth || 230
  const popH = el.offsetHeight || 220
  let left = rect.right + 14
  let top = rect.top + (rect.height / 2) - (popH / 2)
  if (left + popW > window.innerWidth - 10) left = rect.left - popW - 14
  if (top < 8) top = 8
  if (top + popH > window.innerHeight - 8) top = window.innerHeight - popH - 8
  el.style.left = left + 'px'
  el.style.top = top + 'px'

  el.addEventListener('mouseenter', () => clearTimeout(_hideTimer))
  el.addEventListener('mouseleave', () => scheduleHidePopup(setActiveAdmin))
  _popupEl = el
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  const [admins, setAdmins] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showHierarchy, setShowHierarchy] = useState(false)
  const [activeAdmin, setActiveAdmin] = useState(null)
  const hideTimer = useRef(null)
  const popupRef = useRef(null)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    initial: '', first_name: '', last_name: '', mobile_number: '', door_no: '', street_name: '', town_name: '',
    city_name: '', district: '', state: '', email: '', password: '',
    aadhaar_no: '', pan_no: '', occupation: 'employee', occupation_detail: '',
    annual_salary: '', admin_name: '', admin_id: '', admin_contact_no: ''
  })
  const canvasRef = useRef(null)

  const bg = dark ? '#020617' : '#f8fafc'
  const text = dark ? '#f8fafc' : '#020617'
  const subtext = dark ? '#94a3b8' : '#64748b'
  const accent = dark ? '#22d3ee' : '#2563eb'
  const border = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const glass = dark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.7)'
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const cardBorder = dark ? '1px solid rgba(103,232,249,0.1)' : '1px solid rgba(0,0,0,0.1)'
  const inpBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const inpBorder = dark ? '#374151' : '#d1d5db'

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId, particlesArray = []
    const mouse = { x: null, y: null, radius: 150 }
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    const handleMouseMove = (e) => { mouse.x = e.x; mouse.y = e.y }
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    handleResize()
    class Particle {
      constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.size = Math.random() * 2 + 1; this.speedX = (Math.random() - .5) * .8; this.speedY = (Math.random() - .5) * .8 }
      update() {
        this.x += this.speedX; this.y += this.speedY
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1
        let dx = mouse.x - this.x, dy = mouse.y - this.y, d = Math.sqrt(dx * dx + dy * dy)
        if (d < mouse.radius) { const fx = dx / d, fy = dy / d, f = (mouse.radius - d) / mouse.radius; this.x -= fx * f * 5; this.y -= fy * f * 5 }
      }
      draw() { ctx.fillStyle = dark ? 'rgba(34,211,238,0.5)' : 'rgba(37,99,235,0.4)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill() }
    }
    function init() { particlesArray = []; for (let i = 0; i < 60; i++)particlesArray.push(new Particle()) }
    function connect() {
      for (let a = 0; a < particlesArray.length; a++) for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x, dy = particlesArray[a].y - particlesArray[b].y, d = Math.sqrt(dx * dx + dy * dy)
        if (d < 150) { ctx.strokeStyle = dark ? `rgba(34,211,238,${1 - d / 150})` : `rgba(37,99,235,${0.5 - d / 300})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(particlesArray[a].x, particlesArray[a].y); ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke() }
      }
    }
    function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); particlesArray.forEach(p => { p.update(); p.draw() }); connect(); animationFrameId = requestAnimationFrame(animate) }
    init(); animate()
    return () => { window.removeEventListener('resize', handleResize); window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationFrameId) }
  }, [dark])

  const fetchAdmins = async () => {
    try { const res = await api.get('/admins/'); setAdmins(res.data) } catch { }
  }
  useEffect(() => { fetchAdmins() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/admins/', form)
      setMsg('✅ Admin created successfully!')
      setShowForm(false)
      fetchAdmins()
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data))
    }
  }

  // Hierarchy hover handlers
  const handleCardEnter = (a) => {
    clearTimeout(hideTimer.current)
    setActiveAdmin(a)
  }
  const handleCardLeave = (a) => {
    hideTimer.current = setTimeout(() => {
      setActiveAdmin(prev => prev?.id === a.id ? null : prev)
    }, 90)
  }

  const s = {
    card: { background: cardBg, border: cardBorder, borderRadius: '20px', padding: '32px 36px', marginBottom: '24px' },
    secHead: { color: '#a5f3fc', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px', paddingBottom: '14px', borderBottom: cardBorder },
    secSub: { color: '#a5f3fc', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0', paddingBottom: '10px', borderBottom: cardBorder },
    lbl: { display: 'block', color: subtext, fontSize: '12px', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.04em' },
    inp: { width: '100%', background: inpBg, border: `1px solid ${inpBorder}`, borderRadius: '10px', padding: '12px 16px', color: text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, transition: 'background 0.8s ease, color 0.4s ease', fontFamily: '"Inter",system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`
  @keyframes float-orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
  @keyframes antigravity{0%{transform:translateY(110vh) rotate(0deg);opacity:0}10%{opacity:var(--op)}90%{opacity:var(--op)}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}
  @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
  .sa-inp:focus{border-color:#22d3ee !important}
  .sa-grad-btn{position:relative;overflow:hidden}
  .sa-grad-btn::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%)}
  .sa-grad-btn:hover::after{animation:shimmer 1s infinite}
  .sa-tr:hover td{background:rgba(255,255,255,.02)}
  @keyframes pulseGlow{0%,100%{box-shadow:0 0 8px rgba(34,211,238,0.15);}50%{box-shadow:0 0 22px rgba(34,211,238,0.35);}}
  @keyframes dotPulse{0%,100%{transform:scale(1);opacity:0.7;}50%{transform:scale(1.6);opacity:1;}}
  @keyframes popupIn{from{opacity:0;transform:translateY(8px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
  .h-card{background:rgba(255,255,255,0.03);border:1px solid rgba(165,243,252,0.18);border-radius:14px;padding:14px 18px;min-width:140px;cursor:pointer;position:relative;overflow:hidden;transition:background 0.35s ease,border-color 0.35s ease,transform 0.4s cubic-bezier(0.34,1.4,0.64,1),box-shadow 0.35s ease;}
  .h-card.h-active{background:rgba(34,211,238,0.07);border-color:rgba(34,211,238,0.65);transform:translateY(-6px) scale(1.02);box-shadow:0 12px 32px rgba(34,211,238,0.18);animation:pulseGlow 2.5s ease-in-out infinite;}
`}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.45 }} />

      <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', animation: 'float-orb 20s infinite ease-in-out', zIndex: 0, top: '8%', left: '8%', width: '380px', height: '380px', background: dark ? 'rgba(34,211,238,0.08)' : 'rgba(37,99,235,0.08)' }} />
      <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', animation: 'float-orb 20s infinite ease-in-out', zIndex: 0, bottom: '10%', right: '4%', width: '460px', height: '460px', background: dark ? 'rgba(236,72,153,0.05)' : 'rgba(219,39,119,0.05)', animationDelay: '-5s' }} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position: 'absolute', left: `${p.x}%`, bottom: '-100px', width: p.size, height: p.size, borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%', border: `1px solid ${accent}44`, opacity: p.opacity, animation: `antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op': p.opacity, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      {/* Navbar */}
      <div style={{ position: 'relative', zIndex: 10, background: glass, borderBottom: `1px solid ${border}`, padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(16px)', transition: 'background 0.8s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '10px' }}>
          <img src={logo} alt="BitByte Logo" style={{ width: 60, height: 50, borderRadius: '10px', objectFit: 'contain' }} />
          <span style={{ color: '#a5f3fc', fontWeight: 700, fontSize: '14px' }}>🛡️ Super Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ color: subtext, fontSize: '14px' }}>{localStorage.getItem('email')}</span>
          <button onClick={() => setDark(!dark)}
            style={{ padding: '8px 16px', borderRadius: '16px', border: `1px solid ${border}`, background: 'transparent', color: text, cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.3s ease' }}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ padding: '8px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: '36px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        {msg && (
          <div style={{ background: msg.includes('✅') ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('✅') ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.3)'}`, color: msg.includes('✅') ? '#4ade80' : '#f87171', borderRadius: '12px', padding: '14px 20px', fontSize: '14px', marginBottom: '20px' }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Admin Management</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowHierarchy(true)}
              style={{ padding: '11px 28px', background: 'rgba(165,243,252,0.08)', border: '1px solid rgba(103,232,249,0.3)', borderRadius: '12px', fontWeight: 700, color: '#a5f3fc', fontSize: '14px', cursor: 'pointer' }}>
              🏢 Admin Hierarchy
            </button>
            <button onClick={() => setShowForm(!showForm)} className="sa-grad-btn"
              style={{ padding: '11px 28px', background: 'linear-gradient(90deg,#22d3ee,#4ade80)', border: 'none', borderRadius: '12px', fontWeight: 800, color: '#006165', fontSize: '14px', cursor: 'pointer' }}>
              {showForm ? 'Cancel' : '+ Create Admin'}
            </button>
          </div>
        </div>

        {/* ── HIERARCHY MODAL ── */}
        {showHierarchy && (
          <div
            onClick={() => { setShowHierarchy(false); setActiveAdmin(null); removeAdminPopup() }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: dark ? '#0f172a' : '#f8fafc', border: '1px solid rgba(103,232,249,0.2)', borderRadius: '20px', padding: '32px', maxWidth: '980px', width: '95%', maxHeight: '80vh', overflowY: 'auto' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', paddingBottom: '14px', borderBottom: '1px solid rgba(103,232,249,0.1)' }}>
                <span style={{ color: '#a5f3fc', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>🏢 Admin Hierarchy</span>
                <button onClick={() => { setShowHierarchy(false); setActiveAdmin(null); removeAdminPopup() }}
                  style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px' }}>
                  ✕ Close
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* Super Admin node */}
                <div style={{ background: 'linear-gradient(135deg,rgba(34,211,238,0.13),rgba(74,222,128,0.08))', border: '1px solid rgba(34,211,238,0.55)', borderRadius: '14px', padding: '13px 36px', fontWeight: 800, fontSize: '15px', color: '#22d3ee', whiteSpace: 'nowrap', animation: 'pulseGlow 3s ease-in-out infinite' }}>
                  🛡️ Super Admin
                </div>

                {/* Vertical stem */}
                <div style={{ width: 2, height: 32, background: 'linear-gradient(180deg,#22d3ee,rgba(34,211,238,0.3))', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 7, height: 7, borderRadius: '50%', background: '#22d3ee', animation: 'dotPulse 2s ease-in-out infinite' }} />
                </div>

                {/* Horizontal bar */}
                <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,rgba(34,211,238,0.5),transparent)', alignSelf: 'stretch', margin: '0 40px' }} />

                {/* Admin cards */}
                <div style={{ display: 'flex', gap: 0, justifyContent: 'space-around', alignSelf: 'stretch', alignItems: 'flex-start' }}>
                  {admins.length === 0 && <div style={{ color: '#94a3b8', padding: '40px' }}>No admins yet.</div>}
                  {admins.map((a, i) => {
                    const c = COLORS[i % COLORS.length]
                    const isActive = activeAdmin?.id === a.id
                    return (
                      <div key={a.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{ width: 2, height: 28, background: `linear-gradient(180deg,${c}88,${c}33)`, position: 'relative' }}>
                          <div style={{ position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: c, animation: `dotPulse ${1.8 + i * 0.3}s ease-in-out infinite` }} />
                        </div>
                        <div
                          className={`h-card${isActive ? ' h-active' : ''}`}
                          onMouseEnter={e => {
                            clearTimeout(_hideTimer)
                            setActiveAdmin(a)
                            createAdminPopup(a, i, e.currentTarget, dark, subtext, text)
                          }}
                          onMouseLeave={() => scheduleHidePopup(setActiveAdmin)}
                        >
                          <div style={{ fontSize: 9, color: c, fontFamily: 'monospace', marginBottom: 4 }}>{a.admin_id}</div>
                          <div style={{ color: text, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{a.first_name}</div>
                          <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>📞 {a.mobile_number}</div> 
                          <div style={{ color: '#94a3b8', fontSize: 11 }}>📍 {a.city_name}</div>
                          <div style={{ marginTop: 8, width: '100%', height: 2, borderRadius: 2, background: `linear-gradient(90deg,${c}44,${c}cc)` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div style={s.card}>
            <p style={s.secHead}>Create New Admin</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={s.secSub}>👤 Personal Info</p>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Initial</label>
<                input name="initial" maxLength={5} value={form.initial} onChange={handleChange} className="sa-inp" style={s.inp} />
                </div>
                <div><label style={s.lbl}>First Name *</label>
                  <input name="first_name" maxLength={100} value={form.first_name} onChange={handleChange} required className="sa-inp" style={s.inp} />
                </div>
                <div><label style={s.lbl}>Last Name *</label>
                  <input name="last_name" maxLength={100} value={form.last_name} onChange={handleChange} required className="sa-inp" style={s.inp} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Mobile *</label>
                  <input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required className="sa-inp" style={s.inp} />
                </div>
                {/* Admin ID preview — auto-generated badge */}
                <div>
                  <label style={s.lbl}>Admin ID</label>
                  <div style={{ ...s.inp, opacity: 0.55, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#22d3ee', fontFamily: 'monospace', fontSize: '13px' }}>
                      BBADM{new Date().getFullYear()}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>
                      &lt;auto-generated&gt;
                    </span>
                  </div>
                </div>
              </div>

              <p style={s.secSub}>Account Info</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className="sa-inp" style={s.inp} />
                </div>
                <div><label style={s.lbl}>Password *</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} required className="sa-inp" style={s.inp} />
                </div>
              </div>

              
              <p style={s.secSub}>📍 Address</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Door No *</label><input name="door_no" value={form.door_no} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>Street Name *</label><input name="street_name" value={form.street_name} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>Town *</label><input name="town_name" value={form.town_name} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>City *</label><input name="city_name" value={form.city_name} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>District *</label><input name="district" value={form.district} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>State *</label><input name="state" value={form.state} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
              </div>

              <p style={s.secSub}>🪪 Identity</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Aadhaar No *</label><input name="aadhaar_no" maxLength={12} value={form.aadhaar_no} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>PAN No *</label><input name="pan_no" maxLength={10} value={form.pan_no} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
              </div>

              <p style={s.secSub}>💼 Occupation</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div><label style={s.lbl}>Occupation *</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} className="sa-inp" style={{ ...s.inp, cursor: 'pointer' }}>
                    {OCCUPATION_OPTIONS.map(o => <option key={o} value={o} style={{ background: '#1a1f26' }}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={s.lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} className="sa-inp" style={s.inp} /></div>
                <div><label style={s.lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required className="sa-inp" style={s.inp} /></div>
              </div>

              {/* ✅ Admin Info section REMOVED — all auto-generated from above fields */}
              {/* admin_name = first_name, admin_contact_no = mobile_number, admin_id = BBADM{year}{seq} */}

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="submit" className="sa-grad-btn"
                  style={{ padding: '12px 28px', background: 'linear-gradient(90deg,#22d3ee,#4ade80)', border: 'none', borderRadius: '12px', fontWeight: 800, color: '#006165', fontSize: '14px', cursor: 'pointer' }}>
                  Create Admin
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding: '12px 24px', background: inpBg, border: `1px solid ${border}`, borderRadius: '12px', color: subtext, fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div style={s.card}>
          <p style={s.secHead}>All Admins ({admins.length})</p>
          {admins.length === 0 ? (
            <p style={{ color: subtext, textAlign: 'center', padding: '60px 0', fontSize: '15px' }}>No admins yet!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${inpBorder}` }}>
                    {['First Name', 'Last Name', 'Email', 'Mobile', 'Admin ID', 'City'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: subtext, fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a, i) => (
                    <tr key={i} className="sa-tr" style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: '14px 16px', color: text }}>{a.first_name}</td>
                      <td style={{ padding: '14px 16px', color: text }}>{a.last_name}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{a.email}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{a.mobile_number}</td>
                      <td style={{ padding: '14px 16px', color: '#22d3ee', fontFamily: 'monospace' }}>{a.admin_id}</td>
                      <td style={{ padding: '14px 16px', color: subtext }}>{a.city_name}</td>
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