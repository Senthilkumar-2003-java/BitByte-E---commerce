import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ name:'', mobile_number:'', email:'', password:'' })

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/')
      setCustomers(res.data)
    } catch {}
  }

  useEffect(() => { fetchCustomers() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/customers/', form)
      setMsg('✅ Customer created!')
      setShowForm(false)
      fetchCustomers()
      setForm({ name:'', mobile_number:'', email:'', password:'' })
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data))
    }
  }

  const logout = () => { localStorage.clear(); navigate('/login') }
  const inputStyle = {width:'100%',padding:'0.65rem 0.875rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(67,72,78,0.5)',borderRadius:'0.5rem',color:'#eaeef6',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0a0f14',color:'#eaeef6'}}>
      <div style={{background:'rgba(255,255,255,0.03)',borderBottom:'1px solid rgba(161,250,255,0.1)',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1 style={{fontFamily:'Space Grotesk',color:'#00ffab',fontWeight:900,fontSize:'1.5rem'}}>🛡️ Admin Dashboard</h1>
        <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
          <span style={{color:'#a7abb2',fontSize:'0.875rem'}}>{localStorage.getItem('email')}</span>
          <button onClick={logout} style={{padding:'0.5rem 1rem',background:'rgba(255,113,108,0.1)',border:'1px solid rgba(255,113,108,0.3)',borderRadius:'0.5rem',color:'#ff716c',cursor:'pointer',fontSize:'0.875rem'}}>Logout</button>
        </div>
      </div>

      <div style={{padding:'2rem'}}>
        {msg && <div style={{background:'rgba(0,255,171,0.1)',border:'1px solid rgba(0,255,171,0.3)',borderRadius:'0.5rem',padding:'0.75rem',marginBottom:'1.5rem',color:'#00ffab'}}>{msg}</div>}

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
          <h2 style={{fontSize:'1.25rem',fontWeight:700}}>Customer Management</h2>
          <button onClick={() => setShowForm(!showForm)} style={{padding:'0.65rem 1.5rem',background:'linear-gradient(to right,#a1faff,#00ffab)',border:'none',borderRadius:'0.5rem',fontWeight:700,cursor:'pointer',color:'#006165',fontSize:'0.875rem'}}>
            {showForm ? 'Cancel' : '+ Create Customer'}
          </button>
        </div>

        {showForm && (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(161,250,255,0.1)',borderRadius:'1rem',padding:'2rem',marginBottom:'2rem'}}>
            <h3 style={{marginBottom:'1.5rem',color:'#00ffab'}}>Create New Customer</h3>
            <form onSubmit={handleSubmit}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <div><label style={{display:'block',marginBottom:'0.35rem',color:'#a7abb2',fontSize:'0.8rem'}}>Name *</label><input name="name" value={form.name} onChange={handleChange} required style={inputStyle}/></div>
                <div><label style={{display:'block',marginBottom:'0.35rem',color:'#a7abb2',fontSize:'0.8rem'}}>Mobile Number *</label><input maxLength={10} name="mobile_number" value={form.mobile_number} onChange={handleChange} required style={inputStyle}/></div>
                <div><label style={{display:'block',marginBottom:'0.35rem',color:'#a7abb2',fontSize:'0.8rem'}}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle}/></div>
                <div><label style={{display:'block',marginBottom:'0.35rem',color:'#a7abb2',fontSize:'0.8rem'}}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required style={inputStyle}/></div>
              </div>
              <button type="submit" style={{marginTop:'1rem',padding:'0.75rem 2rem',background:'linear-gradient(to right,#a1faff,#00ffab)',border:'none',borderRadius:'0.5rem',fontWeight:700,cursor:'pointer',color:'#006165',fontSize:'0.875rem'}}>Create Customer</button>
            </form>
          </div>
        )}

        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(161,250,255,0.1)',borderRadius:'1rem',padding:'1.5rem'}}>
          <h3 style={{marginBottom:'1rem',color:'#00ffab'}}>My Customers ({customers.length})</h3>
          {customers.length === 0 ? (
            <p style={{color:'#a7abb2',textAlign:'center',padding:'2rem'}}>No customers yet!</p>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem'}}>
              <thead>
                <tr style={{borderBottom:'1px solid rgba(67,72,78,0.5)'}}>
                  {['Name','Email','Mobile','Created'].map(h => (
                    <th key={h} style={{padding:'0.75rem',textAlign:'left',color:'#a7abb2',fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={i} style={{borderBottom:'1px solid rgba(67,72,78,0.2)'}}>
                    <td style={{padding:'0.75rem'}}>{c.name}</td>
                    <td style={{padding:'0.75rem',color:'#a7abb2'}}>{c.email}</td>
                    <td style={{padding:'0.75rem',color:'#a7abb2'}}>{c.mobile_number}</td>
                    <td style={{padding:'0.75rem',color:'#a7abb2'}}>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}