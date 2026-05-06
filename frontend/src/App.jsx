import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar       from './components/Navbar'
import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Clients      from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Appointments from './pages/Appointments'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Layout><Dashboard /></Layout></Protected>} />
          <Route path="/clients" element={<Protected><Layout><Clients /></Layout></Protected>} />
          <Route path="/clients/:id" element={<Protected><Layout><ClientDetail /></Layout></Protected>} />
          <Route path="/appointments" element={<Protected><Layout><Appointments /></Layout></Protected>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
