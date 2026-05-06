import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          Style<span style={{ color: '#c084fc' }}>Sync</span>
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/"            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
          <NavLink to="/clients"     className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Clients</NavLink>
          <NavLink to="/appointments"className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Appointments</NavLink>
        </div>
        <div className="navbar-user">
          <span>Hi, {user?.name || user?.username}</span>
          <button className="btn btn-secondary btn-sm" onClick={logout}>Log out</button>
        </div>
      </div>
    </nav>
  )
}
