import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const OCCUPATIONS = ['employee', 'business', 'others']
const emptyForm = {
  name:'', mobile_number:'', email:'', password:'',
  door_no:'', street_name:'', town_name:'', city_name:'',
  district:'', state:'', aadhaar_no:'', pan_no:'',
  occupation:'', occupation_detail:'', annual_salary:''
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [admins, setAdmins] = useState([])
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const [form, setForm] = useState(emptyForm)

  const fetchCustomers = async () => {
    try { const res = await api.get('/customers/'); setCustomers(res.data) }
    catch (err) { console.error('customers error:', err.response?.status) }
  }
  const fetchAdmins = async () => {
    try { const res = await api.get('/admins/list/'); setAdmins(res.data) }
    catch (err) { console.error('admins error:', err.response?.status) }
  }
  useEffect(() => { fetchCustomers(); fetchAdmins() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleAdminChange = (e) => {
    const id = parseInt(e.target.value)
    const admin = admins.find(a => a.id === id)
    setSelectedAdmin(admin || null)
    setForm({ ...form, assigned_admin_id: id })
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
      setSelectedAdmin(null)
    } catch (err) {
      setMsg('❌ Error: ' + JSON.stringify(err.response?.data))
      setMsgType('error')
    }
  }

  const inp = "w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-cyan-400 transition"
  const lbl = "block text-gray-400 text-xs mb-1"
  const sec = "text-cyan-200 text-xs font-bold uppercase tracking-wider pt-4 pb-2 border-b border-cyan-300/10 mb-3"

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white">
      {/* Navbar */}
      <div className="bg-white/3 border-b border-cyan-300/10 px-4 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-green-400 font-black text-base md:text-xl">🛡️ Admin Dashboard</h1>
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
          <div className={`rounded-lg p-3 mb-4 text-sm ${msgType === 'success' ? 'bg-green-500/10 border border-green-400/30 text-green-400' : 'bg-red-500/10 border border-red-400/30 text-red-400'}`}>
            {msg}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Customer Management</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-300 to-green-300 rounded-lg font-bold text-[#006165] text-sm hover:opacity-90 transition">
            {showForm ? 'Cancel' : '+ Create Customer'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white/3 border border-cyan-300/10 rounded-2xl p-4 md:p-6 mb-6">
            <h3 className="text-green-400 font-bold mb-4">Create New Customer</h3>
            <form onSubmit={handleSubmit} className="space-y-2">

              <p className={sec}>Account Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className={lbl}>Full Name *</label><input name="name" value={form.name} onChange={handleChange} required className={inp} placeholder="Customer name"/></div>
                <div><label className={lbl}>Mobile *</label><input name="mobile_number" maxLength={10} value={form.mobile_number} onChange={handleChange} required className={inp} placeholder="10-digit"/></div>
                <div><label className={lbl}>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required className={inp} placeholder="email@example.com"/></div>
                <div><label className={lbl}>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required className={inp}/></div>
              </div>

              <p className={sec}>Address</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div><label className={lbl}>Door No *</label><input name="door_no" value={form.door_no} onChange={handleChange} required maxLength={25} className={inp}/></div>
                <div><label className={lbl}>Street Name *</label><input name="street_name" value={form.street_name} onChange={handleChange} required maxLength={100} className={inp}/></div>
                <div><label className={lbl}>Town *</label><input name="town_name" value={form.town_name} onChange={handleChange} required maxLength={100} className={inp}/></div>
                <div><label className={lbl}>City *</label><input name="city_name" value={form.city_name} onChange={handleChange} required maxLength={25} className={inp}/></div>
                <div><label className={lbl}>District *</label><input name="district" value={form.district} onChange={handleChange} required maxLength={25} className={inp}/></div>
                <div><label className={lbl}>State *</label><input name="state" value={form.state} onChange={handleChange} required maxLength={25} className={inp}/></div>
              </div>

              <p className={sec}>Identity</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className={lbl}>Aadhaar No *</label><input name="aadhaar_no" value={form.aadhaar_no} onChange={handleChange} required maxLength={12} className={inp} placeholder="12-digit"/></div>
                <div><label className={lbl}>PAN No *</label><input name="pan_no" value={form.pan_no} onChange={handleChange} required maxLength={10} className={inp} placeholder="ABCDE1234F"/></div>
              </div>

              <p className={sec}>Occupation</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className={lbl}>Occupation *</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} required className={inp + " cursor-pointer"}>
                    <option value="" className="bg-[#1a1f26]">Select</option>
                    {OCCUPATIONS.map(o => <option key={o} value={o} className="bg-[#1a1f26]">{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Detail</label><input name="occupation_detail" value={form.occupation_detail} onChange={handleChange} maxLength={25} className={inp}/></div>
                <div><label className={lbl}>Annual Salary *</label><input name="annual_salary" value={form.annual_salary} onChange={handleChange} required maxLength={10} className={inp} placeholder="e.g. 500000"/></div>
              </div>

              <p className={sec}>Admin Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className={lbl}>Admin ID *</label>
                  <select onChange={handleAdminChange} className={inp + " cursor-pointer"}>
                    <option value="" className="bg-[#1a1f26]">Select Admin ID</option>
                    {admins.map(a => <option key={a.id} value={a.id} className="bg-[#1a1f26]">{a.admin_id}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Admin Name</label>
                  <input value={selectedAdmin?.name || ''} readOnly className={inp + " opacity-50 cursor-not-allowed"} placeholder="Auto fetch"/>
                </div>
                <div><label className={lbl}>Admin Contact</label>
                  <input value={selectedAdmin?.admin_contact_no || ''} readOnly className={inp + " opacity-50 cursor-not-allowed"} placeholder="Auto fetch"/>
                </div>
              </div>

              <button type="submit" className="mt-4 px-6 py-2.5 bg-gradient-to-r from-cyan-300 to-green-300 rounded-lg font-bold text-[#006165] text-sm hover:opacity-90 transition">
                Create Customer
              </button>
            </form>
          </div>
        )}

        {/* Customer Table */}
        <div className="bg-white/3 border border-cyan-300/10 rounded-2xl p-4 md:p-6">
          <h3 className="text-green-400 font-bold mb-4">My Customers ({customers.length})</h3>
          {customers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No customers yet!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    {['Customer ID','Name','Email','Mobile','City','Created'].map(h => (
                      <th key={h} className="p-3 text-left text-gray-400 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-white/3 transition">
                      <td className="p-3 text-green-400 font-mono text-xs">{c.customer_id}</td>
                      <td className="p-3">{c.name}</td>
                      <td className="p-3 text-gray-400 text-xs">{c.email}</td>
                      <td className="p-3 text-gray-400">{c.mobile_number}</td>
                      <td className="p-3 text-gray-400">{c.city_name}</td>
                      <td className="p-3 text-gray-400 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
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