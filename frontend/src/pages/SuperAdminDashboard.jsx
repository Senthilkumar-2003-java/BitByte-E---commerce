import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const OCCUPATION_OPTIONS = ['employee', 'business', 'others']

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, size: Math.random() * 60 + 10, x: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 12 + 15, opacity: Math.random() * 0.2 + 0.05,
}))

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    name:'', mobile_number:'', door_no:'', street_name:'', town_name:'',
    city_name:'', district:'', state:'', email:'', password:'',
    aadhaar_no:'', pan_no:'', occupation:'employee', occupation_detail:'',
    annual_salary:'', admin_name:'', admin_id:'', admin_contact_no:''
  })
  const canvasRef = useRef(null)

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
      draw() { ctx.fillStyle='rgba(34,211,238,0.5)'; ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill() }
    }
    function init(){particlesArray=[];for(let i=0;i<60;i++)particlesArray.push(new Particle())}
    function connect(){
      for(let a=0;a<particlesArray.length;a++) for(let b=a;b<particlesArray.length;b++){
        let dx=particlesArray[a].x-particlesArray[b].x,dy=particlesArray[a].y-particlesArray[b].y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<150){ctx.strokeStyle=`rgba(34,211,238,${1-d/150})`;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(particlesArray[a].x,particlesArray[a].y);ctx.lineTo(particlesArray[b].x,particlesArray[b].y);ctx.stroke()}
      }
    }
    function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);particlesArray.forEach(p=>{p.update();p.draw()});connect();animationFrameId=requestAnimationFrame(animate)}
    init(); animate()
    return () => { window.removeEventListener('resize',handleResize); window.removeEventListener('mousemove',handleMouseMove); cancelAnimationFrame(animationFrameId) }
  }, [])

  const fetchAdmins = async () => {
    try { const res = await api.get('/admins/'); setAdmins(res.data) } catch {}
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

  const s = { // styles
    wrap: { minHeight:'100vh', background:'#020617', color:'#f8fafc', fontFamily:'"Inter",system-ui,sans-serif', position:'relative', overflow:'hidden' },
    orb1: { position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, top:'8%', left:'8%', width:'380px', height:'380px', background:'rgba(34,211,238,0.08)' },
    orb2: { position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, bottom:'10%', right:'4%', width:'460px', height:'460px', background:'rgba(236,72,153,0.05)', animationDelay:'-5s' },
    nav: { position:'relative', zIndex:10, background:'rgba(15,23,42,0.65)', borderBottom:'1px solid rgba(103,232,249,0.1)', padding:'14px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', backdropFilter:'blur(16px)' },
    content: { position:'relative', zIndex:10, padding:'24px 28px' },
    card: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(103,232,249,0.1)', borderRadius:'20px', padding:'22px 24px', marginBottom:'18px' },
    secHead: { color:'#a5f3fc', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 14px', paddingBottom:'10px', borderBottom:'1px solid rgba(103,232,249,0.1)' },
    lbl: { display:'block', color:'#6b7280', fontSize:'11px', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.04em' },
    inp: { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid #374151', borderRadius:'10px', padding:'10px 13px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box' },
  }

  const inp = s.inp
  const lbl = s.lbl

  return (
    <div style={s.wrap}>
      <style>{`
        @keyframes float-orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
        @keyframes antigravity{0%{transform:translateY(110vh) rotate(0deg);opacity:0}10%{opacity:var(--op)}90%{opacity:var(--op)}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .sa-inp:focus{border-color:#22d3ee !important}
        .sa-grad-btn{position:relative;overflow:hidden}
        .sa-grad-btn::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%)}
        .sa-grad-btn:hover::after{animation:shimmer 1s infinite}
        .sa-tr:hover td{background:rgba(255,255,255,.02)}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, pointerEvents:'none', zIndex:1, opacity:0.45 }} />
      <div style={s.orb1} /><div style={s.orb2} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, bottom:'-100px', width:p.size, height:p.size, borderRadius:'40% 60% 60% 40% / 40% 40% 60% 60%', border:'1px solid rgba(34,211,238,0.25)', opacity:p.opacity, animation:`antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op':p.opacity, pointerEvents:'none', zIndex:0 }} />
      ))}

      {/* Navbar */}
      <div style={s.nav}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:34, height:34, borderRadius:'10px', background:'#22d3ee', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#fff', fontSize:'15px' }}>B</div>
          <span style={{ fontWeight:800, fontSize:'16px' }}>BitByte</span>
          <span style={{ color:'#a5f3fc', fontWeight:700, fontSize:'13px', marginLeft:'6px' }}>🛡️ Super Admin</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ color:'#6b7280', fontSize:'12px' }}>{localStorage.getItem('email')}</span>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ padding:'6px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'10px', fontSize:'12px', cursor:'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={s.content}>
        {msg && (
          <div style={{ background: msg.includes('✅') ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('✅') ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.3)'}`, color: msg.includes('✅') ? '#4ade80' : '#f87171', borderRadius:'12px', padding:'12px 16px', fontSize:'13px', marginBottom:'16px' }}>
            {msg}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
          <h2 style={{ fontSize:'17px', fontWeight:800, margin:0 }}>Admin Management</h2>
          <button onClick={() => setShowForm(!showForm)} className="sa-grad-btn"
            style={{ padding:'9px 22px', background:'linear-gradient(90deg,#22d3ee,#4ade80)', border:'none', borderRadius:'12px', fontWeight:800, color:'#006165', fontSize:'13px', cursor:'pointer' }}>
            {showForm ? 'Cancel' : '+ Create Admin'}
          </button>
        </div>

        {showForm && (
          <div style={s.card}>
            <p style={s.secHead}>Create New Admin</p>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

              <p style={{ color:'#a5f3fc', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'4px 0 0', paddingBottom:'8px', borderBottom:'1px solid rgba(103,232,249,0.1)' }}>Account Info</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><label style={lbl}>Name *</label><input name="name" value={form.name} onChange={handleChange} required className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>Mobile *</label><input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required className="sa-inp" style={inp}/></div>
              </div>

              <p style={{ color:'#a5f3fc', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'4px 0 0', paddingBottom:'8px', borderBottom:'1px solid rgba(103,232,249,0.1)' }}>📍 Address</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                <div><label style={lbl}>Door No</label><input name="door_no" value={form.door_no} onChange={handleChange} required className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>Street Name</label><input name="street_name" value={form.street_name} onChange={handleChange} required className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>Town</label><input name="town_name" value={form.town_name} onChange={handleChange} required className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>City</label><input name="city_name" value={form.city_name} onChange={handleChange} required className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>District</label><input name="district" value={form.district} onChange={handleChange} required className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>State</label><input name="state" value={form.state} onChange={handleChange} required className="sa-inp" style={inp}/></div>
              </div>

              <p style={{ color:'#a5f3fc', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'4px 0 0', paddingBottom:'8px', borderBottom:'1px solid rgba(103,232,249,0.1)' }}>🪪 Identity</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><label style={lbl}>Aadhaar No</label><input name="aadhaar_no" maxLength={12} value={form.aadhaar_no} onChange={handleChange} required className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>PAN No</label><input name="pan_no" maxLength={10} value={form.pan_no} onChange={handleChange} required className="sa-inp" style={inp}/></div>
              </div>

              <p style={{ color:'#a5f3fc', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'4px 0 0', paddingBottom:'8px', borderBottom:'1px solid rgba(103,232,249,0.1)' }}>💼 Occupation</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                <div><label style={lbl}>Occupation</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} className="sa-inp" style={{ ...inp, cursor:'pointer' }}>
                    {OCCUPATION_OPTIONS.map(o => <option key={o} value={o} style={{ background:'#1a1f26' }}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required className="sa-inp" style={inp}/></div>
              </div>

              <p style={{ color:'#a5f3fc', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'4px 0 0', paddingBottom:'8px', borderBottom:'1px solid rgba(103,232,249,0.1)' }}>🛡️ Admin Info</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                <div><label style={lbl}>Admin Name *</label><input name="admin_name" value={form.admin_name} onChange={handleChange} required className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>Admin ID *</label><input name="admin_id" value={form.admin_id} onChange={handleChange} required className="sa-inp" style={inp}/></div>
                <div><label style={lbl}>Admin Contact *</label><input name="admin_contact_no" maxLength={10} value={form.admin_contact_no} onChange={handleChange} required className="sa-inp" style={inp}/></div>
              </div>

              <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                <button type="submit" className="sa-grad-btn"
                  style={{ padding:'10px 24px', background:'linear-gradient(90deg,#22d3ee,#4ade80)', border:'none', borderRadius:'12px', fontWeight:800, color:'#006165', fontSize:'13px', cursor:'pointer' }}>
                  Create Admin
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding:'10px 20px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#9ca3af', fontSize:'13px', cursor:'pointer' }}>
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
            <p style={{ color:'#4b5563', textAlign:'center', padding:'40px 0' }}>No admins yet!</p>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #1f2937' }}>
                    {['Name','Email','Mobile','Admin ID','City'].map(h => (
                      <th key={h} style={{ padding:'10px 12px', textAlign:'left', color:'#6b7280', fontSize:'11px', fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a, i) => (
                    <tr key={i} className="sa-tr" style={{ borderBottom:'1px solid rgba(31,41,55,0.6)' }}>
                      <td style={{ padding:'10px 12px' }}>{a.name}</td>
                      <td style={{ padding:'10px 12px', color:'#6b7280' }}>{a.email}</td>
                      <td style={{ padding:'10px 12px', color:'#6b7280' }}>{a.mobile_number}</td>
                      <td style={{ padding:'10px 12px', color:'#22d3ee', fontFamily:'monospace' }}>{a.admin_id}</td>
                      <td style={{ padding:'10px 12px', color:'#6b7280' }}>{a.city_name}</td>
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