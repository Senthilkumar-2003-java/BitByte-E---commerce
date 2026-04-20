import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, size: Math.random() * 60 + 10, x: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 12 + 15, opacity: Math.random() * 0.2 + 0.05,
}))

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  const [profile, setProfile] = useState(null)
  const canvasRef = useRef(null)

  // Elite Color Palette
  const bg      = dark ? '#020617' : '#f8fafc'
  const text    = dark ? '#f8fafc' : '#020617'
  const subtext = dark ? '#94a3b8' : '#64748b'
  const accent  = dark ? '#22d3ee' : '#2563eb'
  const border  = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const glass   = dark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.7)'
  const cardBg  = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const cardBorder = dark ? '1px solid rgba(103,232,249,0.1)' : '1px solid rgba(0,0,0,0.1)'

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
      constructor() { this.x=Math.random()*canvas.width; this.y=Math.random()*canvas.height; this.size=Math.random()*2+1; this.speedX=(Math.random()-.5)*.8; this.speedY=(Math.random()-.5)*.8 }
      update() {
        this.x+=this.speedX; this.y+=this.speedY
        if(this.x>canvas.width||this.x<0) this.speedX*=-1
        if(this.y>canvas.height||this.y<0) this.speedY*=-1
        let dx=mouse.x-this.x, dy=mouse.y-this.y, d=Math.sqrt(dx*dx+dy*dy)
        if(d<mouse.radius){const fx=dx/d,fy=dy/d,f=(mouse.radius-d)/mouse.radius;this.x-=fx*f*5;this.y-=fy*f*5}
      }
      draw() { ctx.fillStyle= dark ? 'rgba(34,211,238,0.5)' : 'rgba(37,99,235,0.4)'; ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill() }
    }
    function init(){particlesArray=[];for(let i=0;i<60;i++)particlesArray.push(new Particle())}
    function connect(){
      for(let a=0;a<particlesArray.length;a++) for(let b=a;b<particlesArray.length;b++){
        let dx=particlesArray[a].x-particlesArray[b].x,dy=particlesArray[a].y-particlesArray[b].y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<150){ctx.strokeStyle= dark ? `rgba(34,211,238,${1-d/150})` : `rgba(37,99,235,${0.5-d/300})`;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(particlesArray[a].x,particlesArray[a].y);ctx.lineTo(particlesArray[b].x,particlesArray[b].y);ctx.stroke()}
      }
    }
    function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);particlesArray.forEach(p=>{p.update();p.draw()});connect();animationFrameId=requestAnimationFrame(animate)}
    init(); animate()
    return () => { window.removeEventListener('resize',handleResize); window.removeEventListener('mousemove',handleMouseMove); cancelAnimationFrame(animationFrameId) }
  }, [dark])

  useEffect(() => {
    api.get('/dashboard/').then(res => setProfile(res.data)).catch(() => {})
  }, [])

  const card  = { background: cardBg, border: cardBorder, borderRadius:'20px', padding:'32px 36px', marginBottom:'20px' }
  const sHead = { color:'#86efac', fontSize:'13px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 20px', paddingBottom:'14px', borderBottom: cardBorder }
  const lbl   = { color: subtext, fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' }
  const val   = { color: text, fontSize:'15px' }
  const g2    = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }
  const g3    = { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }

  const Row = ({ label, value, mono }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
      <span style={lbl}>{label}</span>
      <span style={{ ...val, ...(mono ? { fontFamily:'monospace', letterSpacing:'0.05em' } : {}) }}>{value || '—'}</span>
    </div>
  )

  const Section = ({ title, children, grid }) => (
    <div style={card}>
      <p style={sHead}>{title}</p>
      <div style={grid}>{children}</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background: bg, color: text, transition:'background 0.8s ease, color 0.4s ease', fontFamily:'"Inter",system-ui,sans-serif', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes float-orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
        @keyframes antigravity{0%{transform:translateY(110vh) rotate(0deg);opacity:0}10%{opacity:var(--op)}90%{opacity:var(--op)}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .cd-fade{animation:fadeIn .45s ease both}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, pointerEvents:'none', zIndex:1, opacity:0.45 }} />

      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, top:'8%', left:'8%', width:'380px', height:'380px', background: dark ? 'rgba(34,211,238,0.08)' : 'rgba(37,99,235,0.08)' }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, bottom:'10%', right:'4%', width:'460px', height:'460px', background: dark ? 'rgba(74,222,128,0.06)' : 'rgba(16,185,129,0.06)', animationDelay:'-5s' }} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, bottom:'-100px', width:p.size, height:p.size, borderRadius:'40% 60% 60% 40% / 40% 40% 60% 60%', border:`1px solid ${accent}44`, opacity:p.opacity, animation:`antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op':p.opacity, pointerEvents:'none', zIndex:0 }} />
      ))}

      {/* Navbar */}
      <div style={{ position:'relative', zIndex:10, background: glass, borderBottom:`1px solid ${border}`, padding:'18px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', backdropFilter:'blur(16px)', transition:'background 0.8s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:38, height:38, borderRadius:'10px', background:'#4ade80', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#065f46', fontSize:'17px' }}>B</div>
          <span style={{ fontWeight:800, fontSize:'18px' }}>BitByte</span>
          <span style={{ color:'#86efac', fontWeight:700, fontSize:'14px', marginLeft:'6px' }}>👤 My Dashboard</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ color: subtext, fontSize:'14px' }}>{localStorage.getItem('email')}</span>

          {/* ── DARK / LIGHT TOGGLE ── */}
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

      <div style={{ position:'relative', zIndex:10, padding:'36px 40px', maxWidth:'1000px', margin:'0 auto' }}>
        {profile ? (
          <>
            {/* Customer ID Banner */}
            <div className="cd-fade" style={{ background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'16px', padding:'20px 28px', marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color: subtext, fontSize:'15px' }}>Customer ID</span>
              <span style={{ color:'#4ade80', fontFamily:'monospace', fontSize:'22px', fontWeight:700 }}>{profile.customer_id}</span>
            </div>

            <Section title="Personal Info" grid={g3}>
              <Row label="Full Name"  value={profile.name} />
              <Row label="Mobile"     value={profile.mobile_number} />
              <Row label="Email"      value={profile.email} />
            </Section>

            <Section title="Address" grid={g3}>
              <Row label="Door No"    value={profile.door_no} />
              <Row label="Street"     value={profile.street_name} />
              <Row label="Town"       value={profile.town_name} />
              <Row label="City"       value={profile.city_name} />
              <Row label="District"   value={profile.district} />
              <Row label="State"      value={profile.state} />
            </Section>

            <Section title="Identity" grid={g2}>
              <Row label="Aadhaar No" value={profile.aadhaar_no} mono />
              <Row label="PAN No"     value={profile.pan_no}     mono />
            </Section>

            <Section title="Occupation" grid={g3}>
              <Row label="Occupation"       value={profile.occupation} />
              <Row label="Detail"           value={profile.occupation_detail} />
              <Row label="Annual Salary"    value={profile.annual_salary} />
            </Section>

            <Section title="Admin Info" grid={g3}>
              <Row label="Admin Name"    value={profile.admin_name} />
              <Row label="Admin ID"      value={profile.admin_id} mono />
              <Row label="Admin Contact" value={profile.admin_contact_no} />
            </Section>
          </>
        ) : (
          <p style={{ color: subtext, textAlign:'center', padding:'80px 0', fontSize:'16px' }}>Loading profile...</p>
        )}
      </div>
    </div>
  )
}