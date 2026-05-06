import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const fmt = (dt, t) => {
  if (!dt) return ''
  const d = new Date(`${dt}T${t || '00:00'}`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    (t ? ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '')
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState([])
  const [clients, setClients]           = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([api.get('/appointments'), api.get('/clients')])
      .then(([a, c]) => { setAppointments(a.data); setClients(c.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  const today     = new Date().toISOString().slice(0, 10)
  const todayAppts = appointments.filter(a => a.date?.slice(0, 10) === today).sort((a, b) => a.time > b.time ? 1 : -1)
  const upcoming   = appointments.filter(a => a.status === 'upcoming' && a.date?.slice(0, 10) >= today).slice(0, 5)

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-title">Total Clients</div>
          <div className="stat-number" style={{ color: '#a855f7' }}>{clients.length}</div>
        </div>
        <div className="card">
          <div className="card-title">Today's Appointments</div>
          <div className="stat-number" style={{ color: '#a855f7' }}>{todayAppts.length}</div>
        </div>
        <div className="card">
          <div className="card-title">Upcoming</div>
          <div className="stat-number" style={{ color: '#a855f7' }}>{appointments.filter(a => a.status === 'upcoming').length}</div>
        </div>
      </div>

      <div className="dashboard-main">
        {/* Today */}
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title" style={{ marginBottom: '1rem' }}>Today — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          {todayAppts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No appointments today.</p>
          ) : (
            todayAppts.map(a => (
              <Link key={a.id} to={`/clients/${a.client_id}`} className="appt-row">
                <div>
                  <div style={{ fontWeight: 600 }}>{a.client_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.service || 'Service TBD'}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#a855f7', fontWeight: 500 }}>
                  {new Date(`2000-01-01T${a.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Upcoming */}
        <div className="card" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="card-title" style={{ margin: 0 }}>Upcoming</div>
            <Link to="/appointments" style={{ fontSize: '0.8rem', color: '#a855f7', textDecoration: 'none' }}>View all →</Link>
          </div>
          {upcoming.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No upcoming appointments.</p>
          ) : (
            upcoming.map(a => (
              <Link key={a.id} to={`/clients/${a.client_id}`} className="appt-row">
                <div>
                  <div style={{ fontWeight: 600 }}>{a.client_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.service || 'Service TBD'}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fmt(a.date, a.time)}</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
