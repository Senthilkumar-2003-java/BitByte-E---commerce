import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// Even more organic particles
const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  size: Math.random() * 70 + 10,
  x: Math.random() * 100,
  delay: Math.random() * 8,
  duration: Math.random() * 12 + 15,
  opacity: Math.random() * 0.25 + 0.05,
  blur: Math.random() * 6,
}))

export default function LandingPage() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  const canvasRef = useRef(null)

  // ── ANTI-GRAVITY NODE ENGINE ──
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particlesArray = []
    const mouse = { x: null, y: null, radius: 150 }

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e) => {
      mouse.x = e.x
      mouse.y = e.y
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    handleResize()

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 1
        this.speedX = (Math.random() - 0.5) * 0.8
        this.speedY = (Math.random() - 0.5) * 0.8
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1

        // Mouse interaction (push away effect)
        let dx = mouse.x - this.x
        let dy = mouse.y - this.y
        let distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance
          const forceDirectionY = dy / distance
          const force = (mouse.radius - distance) / mouse.radius
          this.x -= forceDirectionX * force * 5
          this.y -= forceDirectionY * force * 5
        }
      }
      draw() {
        ctx.fillStyle = dark ? 'rgba(34, 211, 238, 0.5)' : 'rgba(37, 99, 235, 0.4)'
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function init() {
      particlesArray = []
      for (let i = 0; i < 80; i++) particlesArray.push(new Particle())
    }

    function connect() {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x
          let dy = particlesArray[a].y - particlesArray[b].y
          let distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < 150) {
            ctx.strokeStyle = dark ? `rgba(34, 211, 238, ${1 - distance/150})` : `rgba(37, 99, 235, ${0.5 - distance/300})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y)
            ctx.stroke()
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesArray.forEach(p => { p.update(); p.draw() })
      connect()
      animationFrameId = requestAnimationFrame(animate)
    }

    init()
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [dark])

  // Elite Color Palette
  const bg      = dark ? '#020617' : '#f8fafc'
  const text     = dark ? '#f8fafc' : '#020617'
  const subtext  = dark ? '#94a3b8' : '#64748b'
  const accent   = dark ? '#22d3ee' : '#2563eb'
  const border   = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const glass    = dark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)'

  return (
    <div style={{ 
      minHeight: '100vh', background: bg, color: text, 
      transition: 'background 0.8s ease', position: 'relative', 
      overflow: 'hidden', fontFamily: '"Inter", system-ui, sans-serif' 
    }}>

      {/* ── ADVANCED CSS ENGINE ── */}
      <style>{`
        @keyframes float-orb {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes antigravity {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          10% { opacity: var(--op); }
          90% { opacity: var(--op); }
          100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
        }
        @keyframes text-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .grain-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.05; pointer-events: none; z-index: 50;
        }
        .liquid-orb {
          position: absolute; border-radius: 50%; filter: blur(80px);
          animation: float-orb 20s infinite ease-in-out; z-index: 0;
        }
        .hero-title {
          background: linear-gradient(90deg, ${text}, ${accent}, #ec4899, ${text});
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: text-flow 8s infinite linear;
        }
        .btn-shimmer {
          position: relative; overflow: hidden;
        }
        .btn-shimmer::after {
          content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
        }
        .btn-shimmer:hover::after {
          animation: shimmer 1s infinite;
        }
      `}</style>

      {/* Grainy Texture */}
      <div className="grain-overlay" />

      {/* ── ANTI-GRAVITY CANVAS NODES ── */}
      <canvas 
        ref={canvasRef} 
        style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.6 }} 
      />

      {/* ── BACKGROUND LIQUID ORBS ── */}
      <div className="liquid-orb" style={{ top: '10%', left: '10%', width: '400px', height: '400px', background: `${accent}22` }} />
      <div className="liquid-orb" style={{ bottom: '10%', right: '5%', width: '500px', height: '500px', background: '#ec489911', animationDelay: '-5s' }} />

      {/* ── ANTI-GRAVITY CSS PARTICLES (Your Original) ── */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, bottom: '-100px',
          width: p.size, height: p.size, borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%',
          border: `1px solid ${accent}44`,
          opacity: p.opacity, filter: `blur(${p.blur}px)`,
          animation: `antigravity ${p.duration}s ${p.delay}s infinite linear`,
          '--op': p.opacity, pointerEvents: 'none', zIndex: 0
        }} />
      ))}

      {/* ── FLOATING GLASS NAV ── */}
      <nav style={{
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        width: '90%', maxWidth: '1000px', zIndex: 100,
        background: glass, backdropFilter: 'blur(16px)',
        border: `1px solid ${border}`, borderRadius: '24px',
        padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '10px', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>B</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>BitByte</span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setDark(!dark)} style={{ padding: '8px 16px', borderRadius: '16px', border: 'none', background: 'transparent', color: text, cursor: 'pointer', fontWeight: 600 }}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={() => navigate('/login')} className="btn-shimmer" style={{ padding: '8px 20px', borderRadius: '16px', border: 'none', background: text, color: bg, cursor: 'pointer', fontWeight: 700 }}>
            Login
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: '12rem', textAlign: 'center', paddingLeft: '20px', paddingRight: '20px' }}>
        <h1 className="hero-title" style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.9, marginBottom: '2rem' }}>
          Gravity is<br />Optional.
        </h1>
        
        <p style={{ color: subtext, maxWidth: '600px', margin: '0 auto 3rem', fontSize: '1.2rem', lineHeight: 1.6 }}>
          The next evolution of BitByte Technology. We don't just build software; we craft digital atmospheres.
        </p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/login')} className="btn-shimmer" style={{
            padding: '18px 36px', background: accent, color: '#fff', border: 'none', 
            borderRadius: '20px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
            boxShadow: `0 20px 40px ${accent}33`
          }}>
            Launch Now
          </button>
        </div>
      </div>

      {/* ── GLASS CARDS ── */}
      <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '100px 5% 50px', maxWidth: '1200px', margin: '0 auto' }}>
        {[
          { t: 'Super Admin', d: 'Total sovereignty over your digital ecosystem.', i: '🔮' },
          { t: 'Smart Analytics', d: 'AI-driven insights that float above the noise.', i: '📈' },
          { t: 'Quantum Security', d: 'Encryption so heavy it bends light.', i: '🛡️' }
        ].map(card => (
          <div key={card.t} style={{
            padding: '40px', background: glass, backdropFilter: 'blur(20px)',
            border: `1px solid ${border}`, borderRadius: '32px',
            transition: 'transform 0.4s ease', cursor: 'pointer'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'}
             onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{card.i}</div>
            <h3 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '10px' }}>{card.t}</h3>
            <p style={{ color: subtext, lineHeight: 1.6 }}>{card.d}</p>
          </div>
        ))}
      </div>

      <footer style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '40px', color: subtext, fontSize: '0.9rem', opacity: 0.6 }}>
        © 2026 BitByte Technologies. Bending the rules of the web.
      </footer>
    </div>
  )
}