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
    <div className="flex flex-col gap-1">
      <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-white text-sm">{value || '—'}</span>
    </div>
  )

  const Section = ({ title, children, cols = 2 }) => (
    <div className="bg-white/3 border border-cyan-300/10 rounded-2xl p-4 md:p-6 mb-4">
      <h3 className="text-cyan-200 text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-cyan-300/10">{title}</h3>
      <div className={`grid grid-cols-1 sm:grid-cols-${cols} gap-4`}>{children}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white">
      {/* Navbar */}
      <div className="bg-white/3 border-b border-cyan-300/10 px-4 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-green-400 font-black text-base md:text-xl">👤 My Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs hidden sm:block">{localStorage.getItem('email')}</span>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            className="px-3 py-1.5 bg-red-500/10 border border-red-400/30 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition">
            Logout
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {profile ? (
          <>
            {/* Customer ID Banner */}
            <div className="bg-green-400/5 border border-green-400/20 rounded-2xl px-5 py-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-gray-400 text-sm">Customer ID</span>
              <span className="text-green-400 font-mono text-lg font-bold">{profile.customer_id}</span>
            </div>

            <Section title="Personal Info" cols={2}>
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
          <p className="text-gray-500 text-center py-20">Loading profile...</p>
        )}
      </div>
    </div>
  )
}