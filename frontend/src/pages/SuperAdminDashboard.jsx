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
    try { const res = await api.get('/admins/'); setAdmins(res.data) } catch {}
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
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data))
    }
  }

  const inp = "w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-cyan-400 transition"
  const lbl = "block text-gray-400 text-xs mb-1"

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white">
      {/* Navbar */}
      <div className="bg-white/3 border-b border-cyan-300/10 px-4 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-cyan-300 font-black text-base md:text-xl">🛡️ Super Admin</h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs hidden sm:block">{localStorage.getItem('email')}</span>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            className="px-3 py-1.5 bg-red-500/10 border border-red-400/30 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition">
            Logout
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {msg && (
          <div className={`rounded-lg p-3 mb-4 text-sm ${msg.includes('✅') ? 'bg-green-500/10 border border-green-400/30 text-green-400' : 'bg-red-500/10 border border-red-400/30 text-red-400'}`}>
            {msg}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Admin Management</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-300 to-green-300 rounded-lg font-bold text-[#006165] text-sm hover:opacity-90 transition">
            {showForm ? 'Cancel' : '+ Create Admin'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white/3 border border-cyan-300/10 rounded-2xl p-4 md:p-6 mb-6">
            <h3 className="text-cyan-300 font-bold mb-4">Create New Admin</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className={lbl}>Name *</label><input name="name" value={form.name} onChange={handleChange} required className={inp}/></div>
                <div><label className={lbl}>Mobile *</label><input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required className={inp}/></div>
                <div><label className={lbl}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required className={inp}/></div>
                <div><label className={lbl}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required className={inp}/></div>
              </div>

              <p className="text-cyan-300 text-xs font-bold pt-2">📍 Address</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div><label className={lbl}>Door No</label><input name="door_no" value={form.door_no} onChange={handleChange} required className={inp}/></div>
                <div><label className={lbl}>Street Name</label><input name="street_name" value={form.street_name} onChange={handleChange} required className={inp}/></div>
                <div><label className={lbl}>Town</label><input name="town_name" value={form.town_name} onChange={handleChange} required className={inp}/></div>
                <div><label className={lbl}>City</label><input name="city_name" value={form.city_name} onChange={handleChange} required className={inp}/></div>
                <div><label className={lbl}>District</label><input name="district" value={form.district} onChange={handleChange} required className={inp}/></div>
                <div><label className={lbl}>State</label><input name="state" value={form.state} onChange={handleChange} required className={inp}/></div>
              </div>

              <p className="text-cyan-300 text-xs font-bold pt-2">🪪 Identity</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className={lbl}>Aadhaar No</label><input name="aadhaar_no" maxLength={12} value={form.aadhaar_no} onChange={handleChange} required className={inp}/></div>
                <div><label className={lbl}>PAN No</label><input name="pan_no" maxLength={10} value={form.pan_no} onChange={handleChange} required className={inp}/></div>
              </div>

              <p className="text-cyan-300 text-xs font-bold pt-2">💼 Occupation</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className={lbl}>Occupation</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} className={inp + " cursor-pointer"}>
                    {OCCUPATION_OPTIONS.map(o => <option key={o} value={o} className="bg-[#1a1f26]">{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} className={inp}/></div>
                <div><label className={lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required className={inp}/></div>
              </div>

              <p className="text-cyan-300 text-xs font-bold pt-2">🛡️ Admin Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className={lbl}>Admin Name *</label><input name="admin_name" value={form.admin_name} onChange={handleChange} required className={inp}/></div>
                <div><label className={lbl}>Admin ID *</label><input name="admin_id" value={form.admin_id} onChange={handleChange} required className={inp}/></div>
                <div><label className={lbl}>Admin Contact *</label><input name="admin_contact_no" maxLength={10} value={form.admin_contact_no} onChange={handleChange} required className={inp}/></div>
              </div>

              <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-cyan-300 to-green-300 rounded-lg font-bold text-[#006165] text-sm hover:opacity-90 transition">
                Create Admin
              </button>
            </form>
          </div>
        )}

        {/* Admins Table */}
        <div className="bg-white/3 border border-cyan-300/10 rounded-2xl p-4 md:p-6">
          <h3 className="text-cyan-300 font-bold mb-4">All Admins ({admins.length})</h3>
          {admins.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No admins yet!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    {['Name','Email','Mobile','Admin ID','City'].map(h => (
                      <th key={h} className="p-3 text-left text-gray-400 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a, i) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-white/3 transition">
                      <td className="p-3">{a.name}</td>
                      <td className="p-3 text-gray-400">{a.email}</td>
                      <td className="p-3 text-gray-400">{a.mobile_number}</td>
                      <td className="p-3 text-cyan-400 font-mono">{a.admin_id}</td>
                      <td className="p-3 text-gray-400">{a.city_name}</td>
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