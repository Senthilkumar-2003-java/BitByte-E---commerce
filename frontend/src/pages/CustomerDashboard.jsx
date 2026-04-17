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

  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ color: '#a7abb2', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ color: '#eaeef6', fontSize: '0.9rem' }}>{value || '—'}</span>
    </div>
  )

  const Section = ({ title, children }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(161,250,255,0.1)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ color: '#a1faff', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(161,250,255,0.1)' }}>{title}</h3>
      {children}
    </div>
  )

  const Grid = ({ children, cols = 2 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem' }}>
      {children}
    </div>
  )

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
        {profile ? (
          <>
            {/* Customer ID Banner */}
            <div style={{ background: 'rgba(0,255,171,0.05)', border: '1px solid rgba(0,255,171,0.2)', borderRadius: '1rem', padding: '1rem 2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#a7abb2' }}>Customer ID</span>
              <span style={{ color: '#00ffab', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700 }}>{profile.customer_id}</span>
            </div>

            <Section title="Personal Info">
              <Grid>
                <InfoRow label="Full Name" value={profile.name} />
                <InfoRow label="Mobile Number" value={profile.mobile_number} />
                <InfoRow label="Email" value={profile.email} />
              </Grid>
            </Section>

            <Section title="Address">
              <Grid cols={3}>
                <InfoRow label="Door No" value={profile.door_no} />
                <InfoRow label="Street Name" value={profile.street_name} />
                <InfoRow label="Town" value={profile.town_name} />
                <InfoRow label="City" value={profile.city_name} />
                <InfoRow label="District" value={profile.district} />
                <InfoRow label="State" value={profile.state} />
              </Grid>
            </Section>

            <Section title="Identity">
              <Grid>
                <InfoRow label="Aadhaar No" value={profile.aadhaar_no} />
                <InfoRow label="PAN No" value={profile.pan_no} />
              </Grid>
            </Section>

            <Section title="Occupation">
              <Grid cols={3}>
                <InfoRow label="Occupation" value={profile.occupation} />
                <InfoRow label="Detail" value={profile.occupation_detail} />
                <InfoRow label="Annual Salary" value={profile.annual_salary} />
              </Grid>
            </Section>

            <Section title="Admin Info">
              <Grid cols={3}>
                <InfoRow label="Admin Name" value={profile.admin_name} />
                <InfoRow label="Admin ID" value={profile.admin_id} />
                <InfoRow label="Admin Contact No" value={profile.admin_contact_no} />
              </Grid>
            </Section>
          </>
        ) : (
          <p style={{ color: '#a7abb2', textAlign: 'center', padding: '3rem' }}>Loading profile...</p>
        )}
      </div>
    </div>
  )
}