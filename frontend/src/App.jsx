import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import AdminDashboard from './pages/AdminDashboard'
import DealerDashboard from './pages/DealerDashboard'
import SubDealerDashboard from './pages/SubDealerDashboard'

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')
  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />
  }
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/super-admin" element={
          <ProtectedRoute role="super_admin"><SuperAdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/dealer" element={
          <ProtectedRoute role="dealer"><DealerDashboard /></ProtectedRoute>
        } />
        <Route path="/sub-dealer" element={
          <ProtectedRoute role="sub_dealer"><SubDealerDashboard /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}