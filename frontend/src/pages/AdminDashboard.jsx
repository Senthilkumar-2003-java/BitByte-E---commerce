import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const OCCUPATION_CHOICES = ['employee', 'business', 'others']

const emptyForm = {
  name: '', mobile_number: '', email: '', password: '',
  door_no: '', street_name: '', town_name: '', city_name: '',
  district: '', state: '', aadhaar_no: '', pan_no: '',
  occupation: '', occupation_detail: '', annual_salary: ''
}

const inputStyle = {
  width: '100%', padding: '0.65rem 0.875rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(67,72,78,0.5)',
  borderRadius: '0.5rem', color: '#eaeef6',
  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box'
}

const Label = ({ children }) => (
  <label style={{ display: 'block', marginBottom: '0.35rem', color: '#a7abb2', fontSize: '0.8rem' }}>
    {children}
  </label>
)

const Field = ({ label, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
)

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  // ✅ இந்த 2 lines add பண்ணு:
const [admins, setAdmins] = useState([])
const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success') // 'success' | 'error'
  const [form, setForm] = useState(emptyForm)

const fetchCustomers = async () => {
  try {
    const res = await api.get('/customers/')
    console.log('Customers:', res.data)  // ✅ Debug log
    setCustomers(res.data)
  } catch (err) {
    console.error('fetchCustomers error:', err.response?.status, err.response?.data)
  }
}

const fetchAdmins = async () => {
  try {
    const res = await api.get('/admins/list/')
    console.log('Admins:', res.data)  // ✅ Debug log
    setAdmins(res.data)
  } catch (err) {
    console.error('fetchAdmins error:', err.response?.status, err.response?.data)
  }
}

  useEffect(() => { fetchCustomers(); fetchAdmins() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAdminChange = (e) => {
  const adminId = parseInt(e.target.value)
  const admin = admins.find(a => a.id === adminId)
  setSelectedAdmin(admin || null)
  setForm({ ...form, assigned_admin_id: adminId })
}

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/customers/', form)
      setMsg('✅ Customer created successfully!')
      setMsgType('success')
      setShowForm(false)
      fetchCustomers()
      setForm(emptyForm)
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data))
      setMsgType('error')
    }
  }

  const logout = () => { localStorage.clear(); navigate('/login') }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f14', color: '#eaeef6' }}>
      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(161,250,255,0.1)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'Space Grotesk', color: '#00ffab', fontWeight: 900, fontSize: '1.5rem' }}>🛡️ Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#a7abb2', fontSize: '0.875rem' }}>{localStorage.getItem('email')}</span>
          <button onClick={logout} style={{ padding: '0.5rem 1rem', background: 'rgba(255,113,108,0.1)', border: '1px solid rgba(255,113,108,0.3)', borderRadius: '0.5rem', color: '#ff716c', cursor: 'pointer', fontSize: '0.875rem' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        {msg && (
          <div style={{
            background: msgType === 'success' ? 'rgba(0,255,171,0.1)' : 'rgba(255,113,108,0.1)',
            border: `1px solid ${msgType === 'success' ? 'rgba(0,255,171,0.3)' : 'rgba(255,113,108,0.3)'}`,
            borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1.5rem',
            color: msgType === 'success' ? '#00ffab' : '#ff716c'
          }}>{msg}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Customer Management</h2>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(to right,#a1faff,#00ffab)', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', color: '#006165', fontSize: '0.875rem' }}>
            {showForm ? 'Cancel' : '+ Create Customer'}
          </button>
        </div>

        {/* CREATE FORM */}
        {showForm && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(161,250,255,0.1)', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#00ffab' }}>Create New Customer</h3>
            <form onSubmit={handleSubmit}>

              {/* Section: Account */}
              <SectionTitle>Account Info</SectionTitle>
              <Grid>
                <Field label="Full Name *">
                  <input name="name" value={form.name} onChange={handleChange} required maxLength={100} style={inputStyle} placeholder="Customer name" />
                </Field>
                <Field label="Mobile Number *">
                  <input name="mobile_number" value={form.mobile_number} onChange={handleChange} required maxLength={10} style={inputStyle} placeholder="10-digit mobile" />
                </Field>
                <Field label="Email *">
                  <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} placeholder="email@example.com" />
                </Field>
                <Field label="Password *">
                  <input type="password" name="password" value={form.password} onChange={handleChange} required style={inputStyle} placeholder="Set password" />
                </Field>
              </Grid>

              {/* Section: Address */}
              <SectionTitle>Address</SectionTitle>
              <Grid cols={3}>
                <Field label="Door No *">
                  <input name="door_no" value={form.door_no} onChange={handleChange} required maxLength={25} style={inputStyle} />
                </Field>
                <Field label="Street Name *">
                  <input name="street_name" value={form.street_name} onChange={handleChange} required maxLength={100} style={inputStyle} />
                </Field>
                <Field label="Town Name *">
                  <input name="town_name" value={form.town_name} onChange={handleChange} required maxLength={100} style={inputStyle} />
                </Field>
                <Field label="City *">
                  <input name="city_name" value={form.city_name} onChange={handleChange} required maxLength={25} style={inputStyle} />
                </Field>
                <Field label="District *">
                  <input name="district" value={form.district} onChange={handleChange} required maxLength={25} style={inputStyle} />
                </Field>
                <Field label="State *">
                  <input name="state" value={form.state} onChange={handleChange} required maxLength={25} style={inputStyle} />
                </Field>
              </Grid>

              {/* Section: Identity */}
              <SectionTitle>Identity</SectionTitle>
              <Grid>
                <Field label="Aadhaar No *">
                  <input name="aadhaar_no" value={form.aadhaar_no} onChange={handleChange} required maxLength={12} style={inputStyle} placeholder="12-digit Aadhaar" />
                </Field>
                <Field label="PAN No *">
                  <input name="pan_no" value={form.pan_no} onChange={handleChange} required maxLength={10} style={inputStyle} placeholder="ABCDE1234F" />
                </Field>
              </Grid>

              {/* Section: Occupation */}
              <SectionTitle>Occupation</SectionTitle>
              <Grid>
                <Field label="Occupation *">
                  <select name="occupation" value={form.occupation} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select occupation</option>
                    {OCCUPATION_CHOICES.map(o => (
                      <option key={o} value={o} style={{ background: '#1a1f26' }}>
                        {o.charAt(0).toUpperCase() + o.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Occupation Detail">
                  <input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} maxLength={25} style={inputStyle} placeholder="Company name / Business type / etc." />
                </Field>
                <Field label="Annual Salary *">
                  <input name="annual_salary" value={form.annual_salary} onChange={handleChange} required maxLength={10} style={inputStyle} placeholder="e.g. 500000" />
                </Field>
              </Grid>

<SectionTitle>Admin Info</SectionTitle>
<Grid cols={3}>
  <Field label="Admin ID *">
    <select onChange={handleAdminChange} style={{ ...inputStyle, cursor: 'pointer' }}>
      <option value="">Select Admin ID</option>
      {admins.map(a => (
        <option key={a.id} value={a.id} style={{ background: '#1a1f26' }}>
          {a.admin_id}
        </option>
      ))}
    </select>
  </Field>
  <Field label="Admin Name">
    <input
      value={selectedAdmin?.name || ''}
      readOnly
      style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
      placeholder="Auto fetch"
    />
  </Field>
  <Field label="Admin Contact No">
    <input
      value={selectedAdmin?.admin_contact_no || ''}
      readOnly
      style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
      placeholder="Auto fetch"
    />
  </Field>
</Grid>

              <button type="submit" style={{ marginTop: '1.5rem', padding: '0.75rem 2.5rem', background: 'linear-gradient(to right,#a1faff,#00ffab)', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', color: '#006165', fontSize: '0.875rem' }}>
                Create Customer
              </button>
            </form>
          </div>
        )}

        {/* CUSTOMER TABLE */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(161,250,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#00ffab' }}>My Customers ({customers.length})</h3>
          {customers.length === 0 ? (
            <p style={{ color: '#a7abb2', textAlign: 'center', padding: '2rem' }}>No customers yet!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(67,72,78,0.5)' }}>
                    {['Customer ID', 'Name', 'Email', 'Mobile', 'City', 'Created'].map(h => (
                      <th key={h} style={{ padding: '0.75rem', textAlign: 'left', color: '#a7abb2', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(67,72,78,0.2)' }}>
                      <td style={{ padding: '0.75rem', color: '#00ffab', fontFamily: 'monospace', fontSize: '0.8rem' }}>{c.customer_id}</td>
                      <td style={{ padding: '0.75rem' }}>{c.name}</td>
                      <td style={{ padding: '0.75rem', color: '#a7abb2' }}>{c.email}</td>
                      <td style={{ padding: '0.75rem', color: '#a7abb2' }}>{c.mobile_number}</td>
                      <td style={{ padding: '0.75rem', color: '#a7abb2' }}>{c.city_name}</td>
                      <td style={{ padding: '0.75rem', color: '#a7abb2' }}>{new Date(c.created_at).toLocaleDateString()}</td>
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

// Helper components
function SectionTitle({ children }) {
  return (
    <div style={{ margin: '1.5rem 0 0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(161,250,255,0.1)', color: '#a1faff', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </div>
  )
}

function Grid({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem' }}>
      {children}
    </div>
  )
}