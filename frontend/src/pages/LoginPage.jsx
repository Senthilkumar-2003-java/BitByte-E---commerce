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
    <div className="min-h-screen bg-[#0a0f14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white/5 border border-cyan-300/10 rounded-2xl p-6 md:p-10 backdrop-blur-xl">
        <h2 className="text-2xl md:text-3xl font-black text-cyan-200 text-center mb-1">
          Bit Byte Technology
        </h2>
        <p className="text-gray-400 text-center text-sm mb-6">Access Portal</p>

        {error && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-400 text-sm rounded-lg p-3 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-white/5 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-white/5 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-300 to-green-300 rounded-lg font-bold text-[#006165] text-sm uppercase tracking-widest hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}