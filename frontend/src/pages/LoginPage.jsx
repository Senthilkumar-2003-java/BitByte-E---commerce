import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/login/', { email, password })
      localStorage.setItem('token', res.data.access)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('email', res.data.email)
      if (res.data.role === 'super_admin') navigate('/super-admin')
      else if (res.data.role === 'admin') navigate('/admin')
      else navigate('/customer')
    } catch {
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0f14',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(161,250,255,0.1)',borderRadius:'1rem',padding:'2.5rem',width:'100%',maxWidth:'420px',backdropFilter:'blur(24px)'}}>
        <h2 style={{fontFamily:'Space Grotesk',fontSize:'1.75rem',fontWeight:900,color:'#a1faff',marginBottom:'0.5rem',textAlign:'center'}}>Bit Byte Technology</h2>
        <p style={{color:'#a7abb2',textAlign:'center',marginBottom:'2rem',fontSize:'0.875rem'}}>Access Portal</p>

        {error && <div style={{background:'rgba(255,113,108,0.1)',border:'1px solid rgba(255,113,108,0.3)',borderRadius:'0.5rem',padding:'0.75rem',marginBottom:'1rem',color:'#ff716c',fontSize:'0.875rem',textAlign:'center'}}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',marginBottom:'0.5rem',color:'#a7abb2',fontSize:'0.875rem'}}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{width:'100%',padding:'0.75rem 1rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(67,72,78,0.5)',borderRadius:'0.5rem',color:'#eaeef6',fontSize:'1rem',outline:'none'}}
              placeholder="Enter your email"
            />
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block',marginBottom:'0.5rem',color:'#a7abb2',fontSize:'0.875rem'}}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{width:'100%',padding:'0.75rem 1rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(67,72,78,0.5)',borderRadius:'0.5rem',color:'#eaeef6',fontSize:'1rem',outline:'none'}}
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{width:'100%',padding:'0.875rem',background:'linear-gradient(to right,#a1faff,#00ffab)',border:'none',borderRadius:'0.5rem',fontWeight:700,fontFamily:'Space Grotesk',textTransform:'uppercase',letterSpacing:'0.1em',cursor:'pointer',color:'#006165',fontSize:'0.875rem'}}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}