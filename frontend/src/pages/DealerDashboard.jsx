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

export default function DealerDashboard() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  const [subDealers, setSubDealers] = useState([])
  const [dealers, setDealers] = useState([])         // for dropdown — dealer picks themselves
  const [selectedDealer, setSelectedDealer] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showHierarchy, setShowHierarchy] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const [form, setForm] = useState(emptyForm)
  const canvasRef = useRef(null)

  const bg      = dark ? '#020617' : '#f8fafc'
  const text     = dark ? '#f8fafc' : '#020617'
  const subtext  = dark ? '#94a3b8' : '#64748b'
  const accent   = dark ? '#22d3ee' : '#2563eb'
  const border   = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const glass    = dark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.7)'
  const cardBg   = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const cardBorder = dark ? '1px solid rgba(103,232,249,0.1)' : '1px solid rgba(0,0,0,0.1)'
  const inpBg    = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
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
      constructor() { this.x=Math.random()*canvas.width; this.y=Math.random()*canvas.height; this.size=Math.random()*2+1; this.speedX=(Math.random()-.5)*.8; this.speedY=(Math.random()-.5)*.8 }
      update() {
        this.x+=this.speedX; this.y+=this.speedY
        if(this.x>canvas.width||this.x<0) this.speedX*=-1
        if(this.y>canvas.height||this.y<0) this.speedY*=-1
        let dx=mouse.x-this.x,dy=mouse.y-this.y,d=Math.sqrt(dx*dx+dy*dy)
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

  const fetchSubDealers = async () => {
    try { const res = await api.get('/sub-dealers/'); setSubDealers(res.data) } catch (err) { console.error(err) }
  }
  const fetchDealers = async () => {
    try { const res = await api.get('/dealers/list/'); setDealers(res.data) } catch (err) { console.error(err) }
  }
  useEffect(() => { fetchSubDealers(); fetchDealers() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleDealerChange = (e) => {
    const id = parseInt(e.target.value)
    const dealer = dealers.find(d => d.id === id)
    setSelectedDealer(dealer || null)
    setForm({ ...form, assigned_dealer_id: id })
  }
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/sub-dealers/', form)
      setMsg('✅ Sub Dealer created successfully!'); setMsgType('success')
      setShowForm(false); fetchSubDealers(); setForm(emptyForm); setSelectedDealer(null)
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data)); setMsgType('error')
    }
  }

  const card = { background: cardBg, border: cardBorder, borderRadius:'20px', padding:'32px 36px', marginBottom:'24px' }
  const secHead = (color='#a5f3fc') => ({ color, fontSize:'13px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 20px', paddingBottom:'14px', borderBottom: cardBorder })
  const secLabel = (color='#a5f3fc') => ({ color, fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'4px 0 0', paddingBottom:'10px', borderBottom: cardBorder })
  const inp = { width:'100%', background: inpBg, border:`1px solid ${inpBorder}`, borderRadius:'10px', padding:'12px 16px', color: text, fontSize:'14px', outline:'none', boxSizing:'border-box' }
  const lbl = { display:'block', color: subtext, fontSize:'12px', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.04em' }

  return (
    <div style={{ minHeight:'100vh', background: bg, color: text, transition:'background 0.8s ease, color 0.4s ease', fontFamily:'"Inter",system-ui,sans-serif', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes float-orb{0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)}}
        @keyframes antigravity{0%{transform:translateY(110vh) rotate(0deg);opacity:0}10%{opacity:var(--op)}90%{opacity:var(--op)}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .dl-inp:focus{border-color:#22d3ee !important}
        .dl-grad-btn{position:relative;overflow:hidden}
        .dl-grad-btn::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%)}
        .dl-grad-btn:hover::after{animation:shimmer 1s infinite}
        .dl-tr:hover td{background:rgba(255,255,255,.02)}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, pointerEvents:'none', zIndex:1, opacity:0.45 }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, top:'8%', left:'8%', width:'380px', height:'380px', background: dark ? 'rgba(34,211,238,0.08)' : 'rgba(37,99,235,0.08)' }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', animation:'float-orb 20s infinite ease-in-out', zIndex:0, bottom:'10%', right:'4%', width:'460px', height:'460px', background: dark ? 'rgba(74,222,128,0.06)' : 'rgba(16,185,129,0.06)', animationDelay:'-5s' }} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, bottom:'-100px', width:p.size, height:p.size, borderRadius:'40% 60% 60% 40% / 40% 40% 60% 60%', border:`1px solid ${accent}44`, opacity:p.opacity, animation:`antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op':p.opacity, pointerEvents:'none', zIndex:0 }} />
      ))}

      {/* Navbar */}
      <div style={{ position:'relative', zIndex:10, background: glass, borderBottom:`1px solid ${border}`, padding:'18px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', backdropFilter:'blur(16px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:38, height:38, borderRadius:'10px', background:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#fff', fontSize:'17px' }}>B</div>
          <span style={{ fontWeight:800, fontSize:'18px' }}>BitByte</span>
          <span style={{ color:'#fcd34d', fontWeight:700, fontSize:'14px', marginLeft:'6px' }}>🏪 Dealer Dashboard</span>
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
          <div style={{ background: msgType==='success' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${msgType==='success' ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.3)'}`, color: msgType==='success' ? '#4ade80' : '#f87171', borderRadius:'12px', padding:'14px 20px', fontSize:'14px', marginBottom:'20px' }}>
            {msg}
          </div>
        )}

<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
  <h2 style={{ fontSize:'22px', fontWeight:800, margin:0 }}>Sub Dealer Management</h2>
  <div style={{ display:'flex', gap:'12px' }}>
    <button onClick={() => setShowHierarchy(true)}
      style={{ padding:'11px 28px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'12px', fontWeight:700, color:'#fcd34d', fontSize:'14px', cursor:'pointer' }}>
      🏢 Sub Dealer Hierarchy
    </button>
    <button onClick={() => setShowForm(!showForm)} className="dl-grad-btn"
      style={{ padding:'11px 28px', background:'linear-gradient(90deg,#f59e0b,#22d3ee)', border:'none', borderRadius:'12px', fontWeight:800, color:'#003b40', fontSize:'14px', cursor:'pointer' }}>
      {showForm ? 'Cancel' : '+ Create Sub Dealer'}
    </button>
  </div>
</div>

{/* ── SUB DEALER HIERARCHY MODAL ── */}
{showHierarchy && (
  <div onClick={() => setShowHierarchy(false)}
    style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div onClick={e => e.stopPropagation()}
      style={{ background:'#0f172a', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'20px', padding:'32px', maxWidth:'960px', width:'95%', maxHeight:'80vh', overflowY:'auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', paddingBottom:'14px', borderBottom:'1px solid rgba(245,158,11,0.1)' }}>
        <span style={{ color:'#fcd34d', fontSize:'13px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>🏢 Sub Dealer Hierarchy</span>
        <button onClick={() => setShowHierarchy(false)}
          style={{ background:'transparent', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'8px', padding:'6px 14px', cursor:'pointer', fontSize:'12px' }}>
          ✕ Close
        </button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ background:'rgba(245,158,11,0.12)', border:'1px solid #f59e0b', borderRadius:'14px', padding:'14px 48px', fontWeight:800, fontSize:'15px', color:'#f59e0b' }}>
          🏪 Dealer
        </div>
        <div style={{ width:2, height:28, background:'linear-gradient(180deg,#f59e0b,rgba(245,158,11,0.3))' }} />
        <div style={{ position:'relative', width:'100%', display:'flex', justifyContent:'center' }}>
          <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:2, background:'linear-gradient(90deg,transparent,rgba(245,158,11,0.4),transparent)' }} />
          <div style={{ display:'flex', gap:'20px', flexWrap:'wrap', justifyContent:'center' }}>
            {subDealers.map((d, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{ width:2, height:28, background:'rgba(245,158,11,0.5)' }} />
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'16px 20px', minWidth:'190px' }}>
                  <div style={{ color:'#f59e0b', fontFamily:'monospace', fontSize:'11px', marginBottom:'6px' }}>{d.sub_dealer_id}</div>
                  <div style={{ color:'#f8fafc', fontWeight:700, fontSize:'14px', marginBottom:'6px' }}>{d.name}</div>
                  <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'3px' }}>📞 {d.mobile_number}</div>
                  <div style={{ color:'#94a3b8', fontSize:'12px' }}>📍 {d.city_name}</div>
                </div>
              </div>
            ))}
            {subDealers.length === 0 && (
              <div style={{ color:'#94a3b8', padding:'40px', textAlign:'center' }}>No sub dealers created yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {showForm && (
          <div style={card}>
            <p style={secHead('#fcd34d')}>Create New Sub Dealer</p>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

              <p style={secLabel('#fcd34d')}>Account Info</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Full Name *</label><input name="name" value={form.name} onChange={handleChange} required placeholder="Sub Dealer name" className="dl-inp" style={inp}/></div>
                <div><label style={lbl}>Mobile *</label><input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required className="dl-inp" style={inp}/></div>
                <div><label style={lbl}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required className="dl-inp" style={inp}/></div>
                <div><label style={lbl}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required className="dl-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#fcd34d')}>Address</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Door No *</label><input name="door_no" value={form.door_no} onChange={handleChange} required maxLength={25} className="dl-inp" style={inp}/></div>
                <div><label style={lbl}>Street Name *</label><input name="street_name" value={form.street_name} onChange={handleChange} required maxLength={100} className="dl-inp" style={inp}/></div>
                <div><label style={lbl}>Town *</label><input name="town_name" value={form.town_name} onChange={handleChange} required maxLength={100} className="dl-inp" style={inp}/></div>
                <div><label style={lbl}>City *</label><input name="city_name" value={form.city_name} onChange={handleChange} required maxLength={25} className="dl-inp" style={inp}/></div>
                <div><label style={lbl}>District *</label><input name="district" value={form.district} onChange={handleChange} required maxLength={25} className="dl-inp" style={inp}/></div>
                <div><label style={lbl}>State *</label><input name="state" value={form.state} onChange={handleChange} required maxLength={25} className="dl-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#fcd34d')}>Identity</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Aadhaar No *</label><input name="aadhaar_no" value={form.aadhaar_no} onChange={handleChange} required maxLength={12} className="dl-inp" style={inp}/></div>
                <div><label style={lbl}>PAN No *</label><input name="pan_no" value={form.pan_no} onChange={handleChange} required maxLength={10} className="dl-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#fcd34d')}>Occupation</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Occupation *</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} required className="dl-inp" style={{ ...inp, cursor:'pointer' }}>
                    <option value="" style={{ background:'#1a1f26' }}>Select</option>
                    {OCCUPATIONS.map(o => <option key={o} value={o} style={{ background:'#1a1f26' }}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} maxLength={25} className="dl-inp" style={inp}/></div>
                <div><label style={lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required maxLength={10} className="dl-inp" style={inp}/></div>
              </div>

              <p style={secLabel('#fcd34d')}>Dealer Info</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                <div><label style={lbl}>Dealer ID *</label>
                  <select onChange={handleDealerChange} className="dl-inp" style={{ ...inp, cursor:'pointer' }}>
                    <option value="" style={{ background:'#1a1f26' }}>Select Dealer ID</option>
                    {dealers.map(d => <option key={d.id} value={d.id} style={{ background:'#1a1f26' }}>{d.dealer_id}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Dealer Name</label>
                  <input value={selectedDealer?.name || ''} readOnly placeholder="Auto fetch" style={{ ...inp, opacity:0.5, cursor:'not-allowed' }}/>
                </div>
                <div><label style={lbl}>Dealer Contact</label>
                  <input value={selectedDealer?.mobile_number || ''} readOnly placeholder="Auto fetch" style={{ ...inp, opacity:0.5, cursor:'not-allowed' }}/>
                </div>
              </div>

              <div style={{ display:'flex', gap:'12px', marginTop:'6px' }}>
                <button type="submit" className="dl-grad-btn"
                  style={{ padding:'12px 28px', background:'linear-gradient(90deg,#f59e0b,#22d3ee)', border:'none', borderRadius:'12px', fontWeight:800, color:'#003b40', fontSize:'14px', cursor:'pointer' }}>
                  Create Sub Dealer
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding:'12px 24px', background: inpBg, border:`1px solid ${border}`, borderRadius:'12px', color: subtext, fontSize:'14px', cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sub Dealers Table */}
        <div style={card}>
          <p style={secHead('#fcd34d')}>My Sub Dealers ({subDealers.length})</p>
          {subDealers.length === 0 ? (
            <p style={{ color: subtext, textAlign:'center', padding:'60px 0', fontSize:'15px' }}>No sub dealers yet!</p>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'15px' }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${inpBorder}` }}>
                    {['Sub Dealer ID','Name','Email','Mobile','City','Created'].map(h => (
                      <th key={h} style={{ padding:'14px 16px', textAlign:'left', color: subtext, fontSize:'13px', fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subDealers.map((s, i) => (
                    <tr key={i} className="dl-tr" style={{ borderBottom:`1px solid ${border}` }}>
                      <td style={{ padding:'14px 16px', color:'#f59e0b', fontFamily:'monospace', fontSize:'13px' }}>{s.sub_dealer_id}</td>
                      <td style={{ padding:'14px 16px', color: text }}>{s.name}</td>
                      <td style={{ padding:'14px 16px', color: subtext }}>{s.email}</td>
                      <td style={{ padding:'14px 16px', color: subtext }}>{s.mobile_number}</td>
                      <td style={{ padding:'14px 16px', color: subtext }}>{s.city_name}</td>
                      <td style={{ padding:'14px 16px', color: subtext, whiteSpace:'nowrap' }}>{new Date(s.created_at).toLocaleDateString()}</td>
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