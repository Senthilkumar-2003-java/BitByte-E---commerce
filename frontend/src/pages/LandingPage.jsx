import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#0a0f14] text-white relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-400/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-400/10 blur-[120px] rounded-full" />

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-5 md:px-10 py-5">
        <h1 className="text-cyan-400 font-black text-base md:text-xl uppercase tracking-wider">
          Bit Byte Technology
        </h1>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 border border-cyan-300/30 rounded-full text-cyan-300 text-sm hover:bg-cyan-300/10 transition"
        >
          Login
        </button>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-5 pt-20 md:pt-32 pb-20">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase bg-gradient-to-r from-cyan-300 via-green-300 to-cyan-300 text-transparent bg-clip-text mb-6 leading-tight">
          Future of Shopping
        </h1>
        <p className="text-gray-400 max-w-md mb-10 text-sm md:text-base">
          Experience next-gen commerce powered by Bit Byte Technology.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-6 md:px-8 py-3 bg-gradient-to-r from-cyan-300 to-green-300 rounded-full text-black font-bold text-sm md:text-base hover:opacity-90 transition"
          >
            Start Now
          </button>
          <button className="px-6 md:px-8 py-3 border border-gray-500 rounded-full text-sm md:text-base hover:border-gray-300 transition">
            Explore
          </button>
        </div>
      </div>

      {/* Cards row */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 px-5 md:px-16 pb-16">
        {['Super Admin', 'Admin', 'Customer'].map((role) => (
          <div key={role} className="bg-white/5 border border-cyan-300/10 rounded-xl p-6 text-center backdrop-blur-md">
            <p className="text-cyan-300 font-bold mb-1">{role}</p>
            <p className="text-gray-500 text-sm">Dashboard Access</p>
          </div>
        ))}
      </div>
    </div>
  )
}