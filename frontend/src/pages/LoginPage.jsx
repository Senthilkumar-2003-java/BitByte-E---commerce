import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, size: Math.random() * 60 + 10, x: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 12 + 15, opacity: Math.random() * 0.2 + 0.05,
}))

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particlesArray = []
    const mouse = { x: null, y: null, radius: 150 }
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    const handleMouseMove = (e) => { mouse.x = e.x; mouse.y = e.y }
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    handleResize()
    class Particle {
      constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.size = Math.random() * 2 + 1; this.speedX = (Math.random() - 0.5) * 0.8; this.speedY = (Math.random() - 0.5) * 0.8 }
      update() {
        this.x += this.speedX; this.y += this.speedY
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1
        let dx = mouse.x - this.x, dy = mouse.y - this.y, distance = Math.sqrt(dx*dx+dy*dy)
        if (distance < mouse.radius) { const fx = dx/distance, fy = dy/distance, f = (mouse.radius-distance)/mouse.radius; this.x -= fx*f*5; this.y -= fy*f*5 }
      }
      draw() { ctx.fillStyle = 'rgba(34,211,238,0.5)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill() }
    }
    function init() { particlesArray = []; for (let i=0;i<60;i++) particlesArray.push(new Particle()) }
    function connect() {
      for (let a=0;a<particlesArray.length;a++) for (let b=a;b<particlesArray.length;b++) {
        let dx=particlesArray[a].x-particlesArray[b].x, dy=particlesArray[a].y-particlesArray[b].y, d=Math.sqrt(dx*dx+dy*dy)
        if (d<150) { ctx.strokeStyle=`rgba(34,211,238,${1-d/150})`; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(particlesArray[a].x,particlesArray[a].y); ctx.lineTo(particlesArray[b].x,particlesArray[b].y); ctx.stroke() }
      }
    }
    function animate() { ctx.clearRect(0,0,canvas.width,canvas.height); particlesArray.forEach(p=>{p.update();p.draw()}); connect(); animationFrameId=requestAnimationFrame(animate) }
    init(); animate()
    return () => { window.removeEventListener('resize',handleResize); window.removeEventListener('mousemove',handleMouseMove); cancelAnimationFrame(animationFrameId) }
  }, [])

const pingInterval = useRef(null)

useEffect(() => {
  const wakeUp = async () => {
    try {
      await fetch('https://bitbyte-e-commerce.onrender.com/api/ping/')
      clearInterval(pingInterval.current)
    } catch {
      // retry continue
    }
  }
  wakeUp()
  pingInterval.current = setInterval(wakeUp, 3000)
  return () => clearInterval(pingInterval.current)
}, [])

const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  const attemptLogin = () => api.post('/login/', { email, password })

  try {
    let res
    try {
      res = await attemptLogin()
    } catch (firstErr) {
      const isServerSleep = !firstErr.response || firstErr.response?.status >= 500
      if (isServerSleep) {
        setError('⏳ Server starting... Retrying')
        await new Promise(resolve => setTimeout(resolve, 2000)) // 4s → 2s
        res = await attemptLogin()
      } else {
        throw firstErr
      }
    }

    localStorage.clear()
    localStorage.setItem('token', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)
    localStorage.setItem('role', res.data.role)
    localStorage.setItem('email', res.data.email)

    // ❌ 50ms delay remove பண்ணிட்டோம் — directly navigate
    const role = res.data.role
    if (role === 'super_admin') navigate('/super-admin', { replace: true })
    else if (role === 'admin') navigate('/admin', { replace: true })
    else navigate('/customer', { replace: true })

  } catch (err) {
    const msg = err.response?.data?.error || err.response?.data?.detail || 'Invalid email or password'
    setError(msg)
  }

  setLoading(false)
}

  return (
    <div style={{ minHeight:'100vh', background:'#020617', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', overflow:'hidden', fontFamily:'"Inter",system-ui,sans-serif' }}>
      <style>{`
        @keyframes float-orb { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.9)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes antigravity { 0%{transform:translateY(110vh) rotate(0deg);opacity:0} 10%{opacity:var(--op)} 90%{opacity:var(--op)} 100%{transform:translateY(-20vh) rotate(360deg);opacity:0} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .liquid-orb { position:absolute; border-radius:50%; filter:blur(80px); animation:float-orb 20s infinite ease-in-out; z-index:0; }
        .btn-shimmer { position:relative; overflow:hidden; }
        .btn-shimmer::after { content:""; position:absolute; top:0;left:0;width:100%;height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent); transform:translateX(-100%); }
        .btn-shimmer:hover::after { animation:shimmer 1s infinite; }
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, pointerEvents:'none', zIndex:1, opacity:0.5 }} />
      <div className="liquid-orb" style={{ top:'5%', left:'5%', width:'400px', height:'400px', background:'rgba(34,211,238,0.08)' }} />
      <div className="liquid-orb" style={{ bottom:'5%', right:'5%', width:'500px', height:'500px', background:'rgba(236,72,153,0.06)', animationDelay:'-5s' }} />

      {PARTICLES.map(p => (
        <div key={p.id} style={{ position:'absolute', left:`${p.x}%`, bottom:'-100px', width:p.size, height:p.size, borderRadius:'40% 60% 60% 40% / 40% 40% 60% 60%', border:'1px solid rgba(34,211,238,0.3)', opacity:p.opacity, animation:`antigravity ${p.duration}s ${p.delay}s infinite linear`, '--op':p.opacity, pointerEvents:'none', zIndex:0 }} />
      ))}

      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:'420px', background:'rgba(15,23,42,0.7)', border:'1px solid rgba(103,232,249,0.15)', borderRadius:'28px', padding:'40px 36px', backdropFilter:'blur(20px)', boxShadow:'0 32px 64px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:48, height:48, borderRadius:'14px', background:'#22d3ee', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#fff', fontSize:'20px', margin:'0 auto 14px' }}>B</div>
          <h2 style={{ fontSize:'1.6rem', fontWeight:900, color:'#a5f3fc', margin:'0 0 6px' }}>Bit Byte Technology</h2>
          <p style={{ color:'#6b7280', fontSize:'13px', margin:0 }}>Access Portal</p>
        </div>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'12px', padding:'12px', fontSize:'13px', textAlign:'center', marginBottom:'16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div>
            <label style={{ display:'block', color:'#9ca3af', fontSize:'12px', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email"
              style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid #374151', borderRadius:'12px', padding:'13px 16px', color:'#fff', fontSize:'14px', outline:'none', transition:'border .2s', boxSizing:'border-box' }}
              onFocus={e => e.target.style.borderColor='#22d3ee'} onBlur={e => e.target.style.borderColor='#374151'} />
          </div>
          <div>
            <label style={{ display:'block', color:'#9ca3af', fontSize:'12px', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password"
              style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid #374151', borderRadius:'12px', padding:'13px 16px', color:'#fff', fontSize:'14px', outline:'none', transition:'border .2s', boxSizing:'border-box' }}
              onFocus={e => e.target.style.borderColor='#22d3ee'} onBlur={e => e.target.style.borderColor='#374151'} />
          </div>
          <button type="submit" disabled={loading} className="btn-shimmer"
            style={{ padding:'14px', background:'linear-gradient(90deg,#22d3ee,#4ade80)', border:'none', borderRadius:'14px', fontWeight:800, color:'#006165', fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', marginTop:'4px', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}