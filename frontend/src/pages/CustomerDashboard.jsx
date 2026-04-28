import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import logo from '../assets/logo.png'

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, size: Math.random() * 60 + 10, x: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 12 + 15, opacity: Math.random() * 0.2 + 0.05,
}))

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
const [profile, setProfile] = useState(null)
const [showAnnouncements, setShowAnnouncements] = useState(false)
const [announcements, setAnnouncements] = useState([])
const [unreadCount, setUnreadCount] = useState(0)
const [showProfile, setShowProfile] = useState(false)
const canvasRef = useRef(null)

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
  constructor() {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 4 + 2 
    this.speedX = (Math.random() - 0.5) * 0.3
    this.speedY = (Math.random() - 0.5) * 0.3
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
    if (this.x > canvas.width || this.x < 0) this.speedX *= -1
    if (this.y > canvas.height || this.y < 0) this.speedY *= -1

    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - this.x
      let dy = mouse.y - this.y
      let distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < mouse.radius) {
        const forceDirectionX = dx / distance
        const forceDirectionY = dy / distance
        const force = (mouse.radius - distance) / mouse.radius
        this.x += forceDirectionX * force * 2
        this.y += forceDirectionY * force * 2
      }
    }
  }                          // ← update() ends here

draw() {
  ctx.fillStyle = dark ? 'rgba(34, 211, 238, 0.9)' : 'rgba(37, 99, 235, 0.8)'
  ctx.save()
  ctx.translate(this.x, this.y)
  ctx.beginPath()
  
  const spikes = 5
  const outerRadius = this.size * 1
  const innerRadius = this.size * 0.4
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / spikes - Math.PI / 2
    if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
  }
  
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

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

const fetchAnnouncements = async () => {
  try {
    const res = await api.get('/announcements/')
    const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setAnnouncements(sorted)
    const lastSeen = parseInt(localStorage.getItem('customerAnnouncementSeen') || '0')
    setUnreadCount(sorted.filter(a => new Date(a.created_at).getTime() > lastSeen).length)
  } catch {}
}

function isCurrentUserMentioned(title) {
    const myId = profile?.customer_id
    if (!myId) return false
    return extractIdsFromTitle(title).includes(myId)
  }

useEffect(() => {
  api.get('/dashboard/').then(res => setProfile(res.data)).catch(() => {})
  fetchAnnouncements()
  const interval = setInterval(fetchAnnouncements, 30000)
  return () => clearInterval(interval)
}, [])

  const card  = { background: cardBg, border: cardBorder, borderRadius:'20px', padding:'32px 36px', marginBottom:'20px' }
  const sHead = { color:'#34d399', fontSize:'13px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 20px', paddingBottom:'14px', borderBottom: cardBorder }
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
        .cu-fade{animation:fadeIn .45s ease both}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, pointerEvents:'none', zIndex:1, opacity:0.45 }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, top:'8%', left:'8%', width:'380px', height:'380px', background: dark ? 'rgba(52,211,153,0.08)' : 'rgba(16,185,129,0.08)' }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, bottom:'10%', right:'4%', width:'460px', height:'460px', background: dark ? 'rgba(110,231,183,0.06)' : 'rgba(52,211,153,0.06)', animationDelay:'-5s' }} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, bottom:'-100px', width:p.size, height:p.size, borderRadius:'40% 60% 60% 40% / 40% 40% 60% 60%', border:`1px solid ${accent}44`, opacity:p.opacity, animation:`antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op':p.opacity, pointerEvents:'none', zIndex:0 }} />
      ))}

      {/* Navbar */}
      <div style={{ position:'relative', zIndex:10, background: glass, borderBottom:`1px solid ${border}`, padding:'18px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', backdropFilter:'blur(16px)' }}>
<div style={{ display:'flex', alignItems:'center', gap:'12px',marginLeft: '10px' }}>
  <img 
    src={logo} 
    alt="BitByte Logo" 
    style={{ width: 60, height: 50, borderRadius: '10px', objectFit: 'contain' }} 
  />
  <span style={{ color:'#6ee7b7', fontWeight:700, fontSize:'14px' }}>👤 Customer Dashboard</span>
</div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
<div
  onClick={() => setShowProfile(true)}
  style={{ cursor:'pointer', width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,rgba(52,211,153,0.25),rgba(34,211,238,0.15))', border:'2px solid rgba(52,211,153,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', transition:'all 0.25s ease' }}
  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(52,211,153,0.3)'; e.currentTarget.style.borderColor='rgba(52,211,153,0.9)' }}
  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(52,211,153,0.5)' }}
  title="View Profile"
>👤</div>

          {/* 📢 Announcement Bell */}
          <div
            onClick={() => { setShowAnnouncements(true); localStorage.setItem('customerAnnouncementSeen', Date.now().toString()); setUnreadCount(0) }}
            style={{ position: 'relative', cursor: 'pointer', padding: '6px', borderRadius: '10px', border: '1px solid rgba(52,211,153,0.35)', background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>📢</span>
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: '-7px', right: '-7px', background: 'linear-gradient(135deg,#34d399,#22d3ee)', color: '#000', borderRadius: '50%', minWidth: '18px', height: '18px', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', boxShadow: '0 2px 8px rgba(52,211,153,0.5)', border: '1.5px solid #020617' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>

          
          <button onClick={() => setDark(!dark)} style={{ padding:'8px 16px', borderRadius:'16px', border:`1px solid ${border}`, background:'transparent', color: text, cursor:'pointer', fontWeight:600, fontSize:'13px' }}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/login') }} style={{ padding:'8px 18px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'10px', fontSize:'13px', cursor:'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ position:'relative', zIndex:10, padding:'36px 40px', maxWidth:'1000px', margin:'0 auto' }}>


{/* ── CUSTOMER PROFILE MODAL ── */}
{showProfile && (
  <div onClick={() => setShowProfile(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(10px)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div onClick={e => e.stopPropagation()} style={{ background: dark ? 'linear-gradient(145deg,#0a1628,#060e1c)' : '#f8fafc', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'24px', width:'95%', maxWidth:'580px', maxHeight:'88vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.7)' }}>
      <div style={{ flexShrink:0, padding:'24px 28px', borderBottom:'1px solid rgba(52,211,153,0.15)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'linear-gradient(135deg,rgba(52,211,153,0.25),rgba(34,211,238,0.15))', border:'2px solid rgba(52,211,153,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>👤</div>
          <div>
            <div style={{ color:'#34d399', fontWeight:800, fontSize:'15px' }}>MY PROFILE</div>
            <div style={{ color:subtext, fontSize:'11px', fontFamily:'monospace' }}>{profile?.customer_id || '—'}</div>
          </div>
        </div>
        <button onClick={() => setShowProfile(false)} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'8px', padding:'6px 14px', cursor:'pointer', fontSize:'12px' }}>✕ Close</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:'20px', scrollbarWidth:'thin' }}>
        {!profile ? <div style={{ textAlign:'center', color:subtext, padding:'60px 0' }}>Loading...</div> : (
          <>
            {[
              { title:'ACCOUNT INFO', color:'#34d399', fields:[
                { label:'Customer ID', value:profile.customer_id, mono:true, color:'#34d399' },
                { label:'Initial', value:profile.initial },
                { label:'First Name', value:profile.first_name },
                { label:'Last Name', value:profile.last_name },
                { label:'Email', value:profile.email },
                { label:'Mobile', value:profile.mobile_number },
              ]},
              { title:'ADDRESS', color:'#22d3ee', fields:[
                { label:'Door No', value:profile.door_no },
                { label:'Street', value:profile.street_name },
                { label:'Town', value:profile.town_name },
                { label:'City', value:profile.city_name },
                { label:'District', value:profile.district },
                { label:'State', value:profile.state },
              ]},
              { title:'IDENTITY', color:'#a78bfa', fields:[
                { label:'Aadhaar No', value:profile.aadhaar_no, mask:true },
                { label:'PAN No', value:profile.pan_no, pan:true, mono:true },
              ]},
              { title:'OCCUPATION', color:'#f59e0b', fields:[
                { label:'Type', value:profile.occupation ? profile.occupation.charAt(0).toUpperCase()+profile.occupation.slice(1) : '—' },
                { label:'Detail', value:profile.occupation_detail },
                { label:'Annual Salary', value:profile.annual_salary ? `₹ ${Number(profile.annual_salary).toLocaleString('en-IN')}` : '—' },
              ]},
              { title:'PROMOTOR INFO', color:'#f472b6', fields:[
                { label:'Promotor ID', value:profile.promotor_id, mono:true, color:'#f472b6' },
                { label:'Promotor Name', value:profile.promotor_name },
                { label:'Promotor Contact', value:profile.promotor_contact_no },
                { label:'Member Since', value:profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : '—' },
              ]},
            ].map(section => (
              <div key={section.title} style={{ background:`rgba(${section.color==='#34d399'?'52,211,153':section.color==='#22d3ee'?'34,211,238':section.color==='#a78bfa'?'167,139,250':section.color==='#f59e0b'?'245,158,11':'244,114,182'},0.04)`, border:`1px solid rgba(${section.color==='#34d399'?'52,211,153':section.color==='#22d3ee'?'34,211,238':section.color==='#a78bfa'?'167,139,250':section.color==='#f59e0b'?'245,158,11':'244,114,182'},0.18)`, borderRadius:'16px', padding:'18px 20px' }}>
                <div style={{ color:section.color, fontSize:'10px', fontWeight:800, letterSpacing:'1.5px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:section.color, display:'inline-block' }} />{section.title}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:section.fields.length===3?'1fr 1fr 1fr':'1fr 1fr', gap:'12px' }}>
                  {section.fields.map(f => (
                    <div key={f.label}>
                      <div style={{ color:subtext, fontSize:'10px', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:'4px' }}>{f.label}</div>
                      <div style={{ color:f.color||text, fontSize:'13px', fontWeight:f.mono?700:500, fontFamily:f.mono?'monospace':'inherit', wordBreak:'break-all' }}>
                        {f.mask&&f.value?`XXXX-XXXX-${f.value.slice(-4)}`:f.pan&&f.value?`XXXXXXX${f.value.slice(-4)}`:(f.value||'—')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  </div>
)}        
{/* ── ANNOUNCEMENT VIEW MODAL (Customer) ── */}

{showAnnouncements && (
  <div onClick={() => setShowAnnouncements(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div onClick={e => e.stopPropagation()} style={{ background: dark ? 'linear-gradient(145deg,#0a1628,#060e1c)' : '#f8fafc', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '24px', width: '95%', maxWidth: '560px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: 'fadeIn 0.3s cubic-bezier(0.22,1,0.36,1)' }}>
      <div style={{ flexShrink: 0, padding: '24px 28px', borderBottom: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,rgba(52,211,153,0.25),rgba(34,211,238,0.15))', border: '1px solid rgba(52,211,153,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📢</div>
          <div>
            <div style={{ color: '#34d399', fontWeight: 800, fontSize: '14px' }}>ANNOUNCEMENTS</div>
            <div style={{ color: subtext, fontSize: '11px', marginTop: '2px' }}>{announcements.length} total from Super Admin</div>
          </div>
        </div>
        <button onClick={() => setShowAnnouncements(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px' }}>✕ Close</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {announcements.length === 0 ? (
          <div style={{ textAlign: 'center', color: subtext, padding: '60px 0', fontSize: '15px' }}>No announcements yet.</div>
        ) : announcements.map((ann, idx) => (
          <div key={ann.id} style={{ background: idx === 0 ? (dark ? 'rgba(52,211,153,0.07)' : 'rgba(52,211,153,0.05)') : (dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'), border: `1px solid ${idx === 0 ? 'rgba(52,211,153,0.35)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')}`, borderRadius: '14px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {idx === 0 && <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>● NEW</span>}
                <span style={{ color: idx === 0 ? '#34d399' : text, fontWeight: 700, fontSize: '14px' }}>{ann.title}</span>
              </div>
              <span style={{ color: subtext, fontSize: '10px', whiteSpace: 'nowrap' }}>{new Date(ann.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
            </div>
            <p style={{ color: dark ? '#cbd5e1' : '#475569', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{ann.message}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

        {profile ? (
          <>
            <div className="cu-fade" style={{ background:'rgba(52,211,153,0.05)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:'16px', padding:'20px 28px', marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color: subtext, fontSize:'15px' }}>Customer ID</span>
              <span style={{ color:'#34d399', fontFamily:'monospace', fontSize:'22px', fontWeight:700 }}>{profile.customer_id}</span>
            </div>

            <Section title="Personal Info" grid={g3}>
              <Row label="Initial"    value={profile.initial} />
              <Row label="First Name" value={profile.first_name} />
              <Row label="Last Name"  value={profile.last_name} />
              <Row label="Mobile"     value={profile.mobile_number} />
              <Row label="Email"      value={profile.email} />
            </Section>

            <Section title="Address" grid={g3}>
              <Row label="Door No"  value={profile.door_no} />
              <Row label="Street"   value={profile.street_name} />
              <Row label="Town"     value={profile.town_name} />
              <Row label="City"     value={profile.city_name} />
              <Row label="District" value={profile.district} />
              <Row label="State"    value={profile.state} />
            </Section>

            <Section title="Identity" grid={g2}>
              <Row label="Aadhaar No" value={profile.aadhaar_no} mono />
              <Row label="PAN No"     value={profile.pan_no}     mono />
            </Section>

            <Section title="Occupation" grid={g3}>
              <Row label="Occupation"    value={profile.occupation} />
              <Row label="Detail"        value={profile.occupation_detail} />
              <Row label="Annual Salary" value={profile.annual_salary} />
            </Section>

            <Section title="Promotor Info" grid={g3}>
              <Row label="Promotor Name"    value={profile.promotor_name} />
              <Row label="Promotor ID"      value={profile.promotor_id} mono />
              <Row label="Promotor Contact" value={profile.promotor_contact_no} />
            </Section>
          </>
        ) : (
          <p style={{ color: subtext, textAlign:'center', padding:'80px 0', fontSize:'16px' }}>Loading profile...</p>
        )}
      </div>
    </div>
  )
}