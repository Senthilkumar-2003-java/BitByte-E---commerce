import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const OCCUPATION_OPTIONS = ['employee', 'business', 'others']

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    name:'', mobile_number:'', door_no:'', street_name:'', town_name:'',
    city_name:'', district:'', state:'', email:'', password:'',
    aadhaar_no:'', pan_no:'', occupation:'employee', occupation_detail:'',
    annual_salary:'', admin_name:'', admin_id:'', admin_contact_no:''
  })

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admins/')
      setAdmins(res.data)
    } catch { }
  }

  useEffect(() => { fetchAdmins() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/admins/', form)
      setMsg('✅ Admin created successfully!')
      setShowForm(false)
      fetchAdmins()
      setForm({name:'',mobile_number:'',door_no:'',street_name:'',town_name:'',city_name:'',district:'',state:'',email:'',password:'',aadhaar_no:'',pan_no:'',occupation:'employee',occupation_detail:'',annual_salary:'',admin_name:'',admin_id:'',admin_contact_no:''})
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data))
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const inputStyle = {width:'100%',padding:'0.65rem 0.875rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(67,72,78,0.5)',borderRadius:'0.5rem',color:'#eaeef6',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}
  const labelStyle = {display:'block',marginBottom:'0.35rem',color:'#a7abb2',fontSize:'0.8rem'}
  const fieldBox = {marginBottom:'1rem'}

  return (
    <div style={{minHeight:'100vh',background:'#0a0f14',color:'#eaeef6'}}>
      {/* Header */}
      <div style={{background:'rgba(255,255,255,0.03)',borderBottom:'1px solid rgba(161,250,255,0.1)',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1 style={{fontFamily:'Space Grotesk',color:'#a1faff',fontWeight:900,fontSize:'1.5rem'}}>Super Admin Dashboard</h1>
        <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
          <span style={{color:'#a7abb2',fontSize:'0.875rem'}}>{localStorage.getItem('email')}</span>
          <button onClick={logout} style={{padding:'0.5rem 1rem',background:'rgba(255,113,108,0.1)',border:'1px solid rgba(255,113,108,0.3)',borderRadius:'0.5rem',color:'#ff716c',cursor:'pointer',fontSize:'0.875rem'}}>Logout</button>
        </div>
      </div>

      <div style={{padding:'2rem'}}>
        {msg && <div style={{background:'rgba(0,255,171,0.1)',border:'1px solid rgba(0,255,171,0.3)',borderRadius:'0.5rem',padding:'0.75rem 1rem',marginBottom:'1.5rem',color:'#00ffab'}}>{msg}</div>}

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
          <h2 style={{fontSize:'1.25rem',fontWeight:700}}>Admin Management</h2>
          <button onClick={() => setShowForm(!showForm)} style={{padding:'0.65rem 1.5rem',background:'linear-gradient(to right,#a1faff,#00ffab)',border:'none',borderRadius:'0.5rem',fontWeight:700,cursor:'pointer',color:'#006165',fontSize:'0.875rem'}}>
            {showForm ? 'Cancel' : '+ Create Admin'}
          </button>
        </div>

        {/* Create Admin Form */}
        {showForm && (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(161,250,255,0.1)',borderRadius:'1rem',padding:'2rem',marginBottom:'2rem'}}>
            <h3 style={{marginBottom:'1.5rem',color:'#a1faff',fontFamily:'Space Grotesk'}}>Create New Admin</h3>
            <form onSubmit={handleSubmit}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 1.5rem'}}>
                <div style={fieldBox}><label style={labelStyle}>Name *</label><input maxLength={100} name="name" value={form.name} onChange={handleChange} required style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>Mobile Number *</label><input maxLength={10} name="mobile_number" value={form.mobile_number} onChange={handleChange} required style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required style={inputStyle}/></div>
              </div>

              <p style={{color:'#a1faff',fontSize:'0.875rem',marginBottom:'1rem',marginTop:'0.5rem',fontWeight:600}}>📍 Address</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 1.5rem'}}>
                <div style={fieldBox}><label style={labelStyle}>Door No</label><input maxLength={25} name="door_no" value={form.door_no} onChange={handleChange} required style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>Street Name</label><input maxLength={100} name="street_name" value={form.street_name} onChange={handleChange} required style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>Town Name</label><input maxLength={100} name="town_name" value={form.town_name} onChange={handleChange} required style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>City Name</label><input maxLength={25} name="city_name" value={form.city_name} onChange={handleChange} required style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>District</label><input maxLength={25} name="district" value={form.district} onChange={handleChange} required style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>State</label><input maxLength={25} name="state" value={form.state} onChange={handleChange} required style={inputStyle}/></div>
              </div>

              <p style={{color:'#a1faff',fontSize:'0.875rem',marginBottom:'1rem',marginTop:'0.5rem',fontWeight:600}}>🪪 Identity</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 1.5rem'}}>
                <div style={fieldBox}><label style={labelStyle}>Aadhaar No</label><input maxLength={12} name="aadhaar_no" value={form.aadhaar_no} onChange={handleChange} required style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>PAN No</label><input maxLength={25} name="pan_no" value={form.pan_no} onChange={handleChange} required style={inputStyle}/></div>
              </div>

              <p style={{color:'#a1faff',fontSize:'0.875rem',marginBottom:'1rem',marginTop:'0.5rem',fontWeight:600}}>💼 Occupation</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0 1.5rem'}}>
                <div style={fieldBox}>
                  <label style={labelStyle}>Occupation</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} style={{...inputStyle}}>
                    {OCCUPATION_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
                <div style={fieldBox}><label style={labelStyle}>Occupation Detail</label><input maxLength={25} name="occupation_detail" value={form.occupation_detail} onChange={handleChange} style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>Annual Salary</label><input maxLength={10} name="annual_salary" value={form.annual_salary} onChange={handleChange} required style={inputStyle}/></div>
              </div>

              <p style={{color:'#a1faff',fontSize:'0.875rem',marginBottom:'1rem',marginTop:'0.5rem',fontWeight:600}}>🛡️ Admin Info</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0 1.5rem'}}>
                <div style={fieldBox}><label style={labelStyle}>Admin Name</label><input maxLength={50} name="admin_name" value={form.admin_name} onChange={handleChange} required style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>Admin ID</label><input maxLength={25} name="admin_id" value={form.admin_id} onChange={handleChange} required style={inputStyle}/></div>
                <div style={fieldBox}><label style={labelStyle}>Admin Contact No</label><input maxLength={10} name="admin_contact_no" value={form.admin_contact_no} onChange={handleChange} required style={inputStyle}/></div>
              </div>

              <button type="submit" style={{padding:'0.75rem 2rem',background:'linear-gradient(to right,#a1faff,#00ffab)',border:'none',borderRadius:'0.5rem',fontWeight:700,cursor:'pointer',color:'#006165',fontSize:'0.875rem',marginTop:'0.5rem'}}>
                Create Admin
              </button>
            </form>
          </div>
        )}

        {/* Admins List */}
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(161,250,255,0.1)',borderRadius:'1rem',padding:'1.5rem'}}>
          <h3 style={{marginBottom:'1rem',color:'#a1faff'}}>All Admins ({admins.length})</h3>
          {admins.length === 0 ? (
            <p style={{color:'#a7abb2',textAlign:'center',padding:'2rem'}}>No admins yet. Create one!</p>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem'}}>
              <thead>
                <tr style={{borderBottom:'1px solid rgba(67,72,78,0.5)'}}>
                  {['Name','Email','Mobile','Admin ID','City'].map(h => (
                    <th key={h} style={{padding:'0.75rem',textAlign:'left',color:'#a7abb2',fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.map((a, i) => (
                  <tr key={i} style={{borderBottom:'1px solid rgba(67,72,78,0.2)'}}>
                    <td style={{padding:'0.75rem'}}>{a.name}</td>
                    <td style={{padding:'0.75rem',color:'#a7abb2'}}>{a.email}</td>
                    <td style={{padding:'0.75rem',color:'#a7abb2'}}>{a.mobile_number}</td>
                    <td style={{padding:'0.75rem',color:'#00ffab'}}>{a.admin_id}</td>
                    <td style={{padding:'0.75rem',color:'#a7abb2'}}>{a.city_name}</td>
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