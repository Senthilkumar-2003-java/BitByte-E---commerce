import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const logout = () => { localStorage.clear(); navigate('/login') }

  useEffect(() => {
    api.get('/dashboard/').then(res => setProfile(res.data)).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f14', color: '#eaeef6' }}>
      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(161,250,255,0.1)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'Space Grotesk', color: '#00ffab', fontWeight: 900, fontSize: '1.5rem' }}>👤 Customer Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#a7abb2', fontSize: '0.875rem' }}>{localStorage.getItem('email')}</span>
          <button onClick={logout} style={{ padding: '0.5rem 1rem', background: 'rgba(255,113,108,0.1)', border: '1px solid rgba(255,113,108,0.3)', borderRadius: '0.5rem', color: '#ff716c', cursor: 'pointer', fontSize: '0.875rem' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(161,250,255,0.1)', borderRadius: '1rem', padding: '2rem' }}>
          <h2 style={{ color: '#00ffab', marginBottom: '1.5rem' }}>My Profile</h2>
          {/* Add profile fields display here once your /dashboard/ API returns customer profile data */}
          <p style={{ color: '#a7abb2' }}>Welcome! Your profile will be displayed here.</p>
        </div>
      </div>
    </div>
  )
}