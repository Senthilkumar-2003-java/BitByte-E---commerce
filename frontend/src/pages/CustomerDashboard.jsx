import { useNavigate } from 'react-router-dom'

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const logout = () => { localStorage.clear(); navigate('/login') }

  return (
    <div style={{minHeight:'100vh',background:'#0a0f14',color:'#eaeef6',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(161,250,255,0.1)',borderRadius:'1rem',padding:'3rem',textAlign:'center',maxWidth:'480px',width:'90%'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>👤</div>
        <h1 style={{fontFamily:'Space Grotesk',fontSize:'1.75rem',fontWeight:900,color:'#a1faff',marginBottom:'0.5rem'}}>Customer Dashboard</h1>
        <p style={{color:'#a7abb2',marginBottom:'0.5rem',fontSize:'0.875rem'}}>Welcome back!</p>
        <p style={{color:'#00ffab',marginBottom:'2rem',fontSize:'0.875rem'}}>{localStorage.getItem('email')}</p>
        <p style={{color:'#a7abb2',marginBottom:'2rem',lineHeight:1.7}}>Bit Byte Technology platform la welcome! Ungalukku assigned features vera release aagum.</p>
        <button onClick={logout} style={{padding:'0.75rem 2rem',background:'rgba(255,113,108,0.1)',border:'1px solid rgba(255,113,108,0.3)',borderRadius:'0.5rem',color:'#ff716c',cursor:'pointer',fontWeight:600}}>Logout</button>
      </div>
    </div>
  )
}