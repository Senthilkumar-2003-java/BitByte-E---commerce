import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    api.get('/dashboard/').then(res => setProfile(res.data)).catch(() => {})
  }, [])

  const Row = ({ label, value }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
      <span style={{ color:'#6b7280', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
      <span style={{ color:'#f1f5f9', fontSize:'14px' }}>{value || '—'}</span>
    </div>
  )

  const Section = ({ title, children, cols = 2 }) => (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(103,232,249,0.1)', borderRadius:'20px', padding:'20px 24px', marginBottom:'16px' }}>
      <h3 style={{ color:'#a5f3fc', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px', paddingBottom:'10px', borderBottom:'1px solid rgba(103,232,249,0.1)', margin:'0 0 14px' }}>{title}</h3>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:'16px' }}>{children}</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f14', color:'#f8fafc', fontFamily:'"Inter",system-ui,sans-serif' }}>
      {/* Navbar */}
      <div style={{ background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(103,232,249,0.1)', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1 style={{ color:'#4ade80', fontWeight:900, fontSize:'16px', margin:0 }}>👤 My Dashboard</h1>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ color:'#6b7280', fontSize:'12px' }}>{localStorage.getItem('email')}</span>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ padding:'6px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'10px', fontSize:'12px', cursor:'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding:'24px', maxWidth:'900px', margin:'0 auto' }}>
        {profile ? (
          <>
            {/* Customer ID Banner */}
            <div style={{ background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'16px', padding:'16px 20px', marginBottom:'20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'#9ca3af', fontSize:'13px' }}>Customer ID</span>
              <span style={{ color:'#4ade80', fontFamily:'monospace', fontSize:'18px', fontWeight:700 }}>{profile.customer_id}</span>
            </div>

            <Section title="Personal Info" cols={3}>
              <Row label="Full Name" value={profile.name} />
              <Row label="Mobile" value={profile.mobile_number} />
              <Row label="Email" value={profile.email} />
            </Section>

            <Section title="Address" cols={3}>
              <Row label="Door No" value={profile.door_no} />
              <Row label="Street" value={profile.street_name} />
              <Row label="Town" value={profile.town_name} />
              <Row label="City" value={profile.city_name} />
              <Row label="District" value={profile.district} />
              <Row label="State" value={profile.state} />
            </Section>

            <Section title="Identity" cols={2}>
              <Row label="Aadhaar No" value={profile.aadhaar_no} />
              <Row label="PAN No" value={profile.pan_no} />
            </Section>

            <Section title="Occupation" cols={3}>
              <Row label="Occupation" value={profile.occupation} />
              <Row label="Detail" value={profile.occupation_detail} />
              <Row label="Annual Salary" value={profile.annual_salary} />
            </Section>

            <Section title="Admin Info" cols={3}>
              <Row label="Admin Name" value={profile.admin_name} />
              <Row label="Admin ID" value={profile.admin_id} />
              <Row label="Admin Contact" value={profile.admin_contact_no} />
            </Section>
          </>
        ) : (
          <p style={{ color:'#6b7280', textAlign:'center', padding:'80px 0' }}>Loading profile...</p>
        )}
      </div>
    </div>
  )
}