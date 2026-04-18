import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const OCCUPATIONS = ['employee', 'business', 'others']
const emptyForm = {
  name:'', mobile_number:'', email:'', password:'',
  door_no:'', street_name:'', town_name:'', city_name:'',
  district:'', state:'', aadhaar_no:'', pan_no:'',
  occupation:'', occupation_detail:'', annual_salary:''
}

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, size: Math.random() * 60 + 10, x: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 12 + 15, opacity: Math.random() * 0.2 + 0.05,
}))

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [admins, setAdmins] = useState([])
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const [form, setForm] = useState(emptyForm)
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
        let dx=mouse.x-this.x,dy=mouse.y-this.y,d=Math.sqrt(dx*dx+dy*dy)
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

  const fetchCustomers = async () => {
    try { const res = await api.get('/customers/'); setCustomers(res.data) } catch (err) { console.error('customers error:', err.response?.status) }
  }
  const fetchAdmins = async () => {
    try { const res = await api.get('/admins/list/'); setAdmins(res.data) } catch (err) { console.error('admins error:', err.response?.status) }
  }
  useEffect(() => { fetchCustomers(); fetchAdmins() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleAdminChange = (e) => {
    const id = parseInt(e.target.value)
    const admin = admins.find(a => a.id === id)
    setSelectedAdmin(admin || null)
    setForm({ ...form, assigned_admin_id: id })
  }
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/customers/', form)
      setMsg('✅ Customer created successfully!'); setMsgType('success')
      setShowForm(false); fetchCustomers(); setForm(emptyForm); setSelectedAdmin(null)
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data)); setMsgType('error')
    }
  }

  const card = { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(103,232,249,0.1)', borderRadius:'20px', padding:'22px 24px', marginBottom:'18px' }
  const secHead = (color='#a5f3fc') => ({ color, fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 14px', paddingBottom:'10px', borderBottom:'1px solid rgba(103,232,249,0.1)' })
  const secLabel = (color='#a5f3fc') => ({ color, fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'4px 0 0', paddingBottom:'8px', borderBottom:'1px solid rgba(103,232,249,0.1)' })
  const inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid #374151', borderRadius:'10px', padding:'10px 13px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box' }
  const lbl = { display:'block', color:'#6b7280', fontSize:'11px', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.04em' }

  return (
    <div style={{ minHeight:'100vh', background:'#020617', color:'#f8fafc', fontFamily:'"Inter",system-ui,sans-serif', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes float-orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
        @keyframes antigravity{0%{transform:translateY(110vh) rotate(0deg);opacity:0}10%{opacity:var(--op)}90%{opacity:var(--op)}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .ad-inp:focus{border-color:#22d3ee !important}
        .ad-grad-btn{position:relative;overflow:hidden}
        .ad-grad-btn::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%)}
        .ad-grad-btn:hover::after{animation:shimmer 1s infinite}
        .ad-tr:hover td{background:rgba(255,255,255,.02)}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, pointerEvents:'none', zIndex:1, opacity:0.45 }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, top:'8%', left:'8%', width:'380px', height:'380px', background:'rgba(34,211,238,0.08)' }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, bottom:'10%', right:'4%', width:'460px', height:'460px', background:'rgba(74,222,128,0.06)', animationDelay:'-5s' }} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, bottom:'-100px', width:p.size, height:p.size, borderRadius:'40% 60% 60% 40% / 40% 40% 60% 60%', border:'1px solid rgba(34,211,238,0.25)', opacity:p.opacity, animation:`antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op':p.opacity, pointerEvents:'none', zIndex:0 }} />
      ))}

      {/* Navbar */}
      <div style={{ position:'relative', zIndex:10, background:'rgba(15,23,42,0.65)', borderBottom:'1px solid rgba(103,232,249,0.1)', padding:'14px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', backdropFilter:'blur(16px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:34, height:34, borderRadius:'10px', background:'#4ade80', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#065f46', fontSize:'15px' }}>B</div>
          <span style={{ fontWeight:800, fontSize:'16px' }}>BitByte</span>
          <span style={{ color:'#86efac', fontWeight:700, fontSize:'13px', marginLeft:'6px' }}>🛡️ Admin Dashboard</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ color:'#6b7280', fontSize:'12px' }}>{localStorage.getItem('email')}</span>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ padding:'6px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'10px', fontSize:'12px', cursor:'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ position:'relative', zIndex:10, padding:'24px 28px' }}>
        {msg && (
          <div style={{ background: msgType==='success' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msgType==='success' ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.3)'}`, color: msgType==='success' ? '#4ade80' : '#f87171', borderRadius:'12px', padding:'12px 16px', fontSize:'13px', marginBottom:'16px' }}>
            {msg}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
          <h2 style={{ fontSize:'17px', fontWeight:800, margin:0 }}>Customer Management</h2>
          <button onClick={() => setShowForm(!showForm)} className="ad-grad-btn"
            style={{ padding:'9px 22px', background:'linear-gradient(90deg,#4ade80,#22d3ee)', border:'none', borderRadius:'12px', fontWeight:800, color:'#006165', fontSize:'13px', cursor:'pointer' }}>
            {showForm ? 'Cancel' : '+ Create Customer'}
          </button>
        </div>

        {showForm && (
          <div style={card}>
            <p style={secHead('#86efac')}>Create New Customer</p>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

              <p style={secLabel('#86efac')}>Account Info</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><label style={lbl}>Full Name *</label><input name="name" value={form.name} onChange={handleChange} required placeholder="Customer name" className="ad-inp" style={inp}/></div>
                <div><label style={lbl}>Mobile *</label><input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required placeholder="10-digit" className="ad-inp" style={inp}/></div>
                <div><label style={lbl}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" className="ad-inp" style={inp}/></div>
                <div><label style={lbl}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required className="ad-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#86efac')}>Address</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                <div><label style={lbl}>Door No *</label><input name="door_no" value={form.door_no} onChange={handleChange} required maxLength={25} className="ad-inp" style={inp}/></div>
                <div><label style={lbl}>Street Name *</label><input name="street_name" value={form.street_name} onChange={handleChange} required maxLength={100} className="ad-inp" style={inp}/></div>
                <div><label style={lbl}>Town *</label><input name="town_name" value={form.town_name} onChange={handleChange} required maxLength={100} className="ad-inp" style={inp}/></div>
                <div><label style={lbl}>City *</label><input name="city_name" value={form.city_name} onChange={handleChange} required maxLength={25} className="ad-inp" style={inp}/></div>
                <div><label style={lbl}>District *</label><input name="district" value={form.district} onChange={handleChange} required maxLength={25} className="ad-inp" style={inp}/></div>
                <div><label style={lbl}>State *</label><input name="state" value={form.state} onChange={handleChange} required maxLength={25} className="ad-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#86efac')}>Identity</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><label style={lbl}>Aadhaar No *</label><input name="aadhaar_no" value={form.aadhaar_no} onChange={handleChange} required maxLength={12} placeholder="12-digit" className="ad-inp" style={inp}/></div>
                <div><label style={lbl}>PAN No *</label><input name="pan_no" value={form.pan_no} onChange={handleChange} required maxLength={10} placeholder="ABCDE1234F" className="ad-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#86efac')}>Occupation</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                <div><label style={lbl}>Occupation *</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} required className="ad-inp" style={{ ...inp, cursor:'pointer' }}>
                    <option value="" style={{ background:'#1a1f26' }}>Select</option>
                    {OCCUPATIONS.map(o => <option key={o} value={o} style={{ background:'#1a1f26' }}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} maxLength={25} className="ad-inp" style={inp}/></div>
                <div><label style={lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required maxLength={10} placeholder="e.g. 500000" className="ad-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#86efac')}>Admin Info</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                <div><label style={lbl}>Admin ID *</label>
                  <select onChange={handleAdminChange} className="ad-inp" style={{ ...inp, cursor:'pointer' }}>
                    <option value="" style={{ background:'#1a1f26' }}>Select Admin ID</option>
                    {admins.map(a => <option key={a.id} value={a.id} style={{ background:'#1a1f26' }}>{a.admin_id}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Admin Name</label>
                  <input value={selectedAdmin?.name || ''} readOnly placeholder="Auto fetch" style={{ ...inp, opacity:0.5, cursor:'not-allowed' }}/>
                </div>
                <div><label style={lbl}>Admin Contact</label>
                  <input value={selectedAdmin?.admin_contact_no || ''} readOnly placeholder="Auto fetch" style={{ ...inp, opacity:0.5, cursor:'not-allowed' }}/>
                </div>
              </div>

              <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                <button type="submit" className="ad-grad-btn"
                  style={{ padding:'10px 24px', background:'linear-gradient(90deg,#4ade80,#22d3ee)', border:'none', borderRadius:'12px', fontWeight:800, color:'#006165', fontSize:'13px', cursor:'pointer' }}>
                  Create Customer
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding:'10px 20px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#9ca3af', fontSize:'13px', cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Customers Table */}
        <div style={card}>
          <p style={secHead('#86efac')}>My Customers ({customers.length})</p>
          {customers.length === 0 ? (
            <p style={{ color:'#4b5563', textAlign:'center', padding:'40px 0' }}>No customers yet!</p>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #1f2937' }}>
                    {['Customer ID','Name','Email','Mobile','City','Created'].map(h => (
                      <th key={h} style={{ padding:'10px 12px', textAlign:'left', color:'#6b7280', fontSize:'11px', fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={i} className="ad-tr" style={{ borderBottom:'1px solid rgba(31,41,55,0.6)' }}>
                      <td style={{ padding:'10px 12px', color:'#4ade80', fontFamily:'monospace', fontSize:'12px' }}>{c.customer_id}</td>
                      <td style={{ padding:'10px 12px' }}>{c.name}</td>
                      <td style={{ padding:'10px 12px', color:'#6b7280', fontSize:'12px' }}>{c.email}</td>
                      <td style={{ padding:'10px 12px', color:'#6b7280' }}>{c.mobile_number}</td>
                      <td style={{ padding:'10px 12px', color:'#6b7280' }}>{c.city_name}</td>
                      <td style={{ padding:'10px 12px', color:'#6b7280', whiteSpace:'nowrap' }}>{new Date(c.created_at).toLocaleDateString()}</td>
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