import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

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

  const _now       = new Date()
  const today      = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`
  const todayAppts = appointments
    .filter(a => String(a.date).slice(0, 10) === today)
    .sort((a, b) => a.time > b.time ? 1 : -1)
  const upcoming   = appointments
    .filter(a => a.status === 'upcoming' && String(a.date).slice(0, 10) > today)
    .sort((a, b) => a.date > b.date ? 1 : -1)
    .slice(0, 6)

  const fmtTime = t => new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const fmtDate = d => new Date(`${String(d).slice(0, 10)}T00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const dayName  = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr  = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="page">

      {/* Editorial date header */}
      <div className="dash-header">
        <div className="dash-dayname">{dayName}</div>
        <div className="dash-date">{dateStr}</div>
      </div>

      {/* Stat pills */}
      <div className="stat-pills">
        <div className="stat-pill">
          <span className="stat-pill-num">{clients.length}</span>
          <span className="stat-pill-label">Clients</span>
        </div>
        <div className="stat-pill-divider" />
        <div className="stat-pill">
          <span className="stat-pill-num">{todayAppts.length}</span>
          <span className="stat-pill-label">Today</span>
        </div>
        <div className="stat-pill-divider" />
        <div className="stat-pill">
          <span className="stat-pill-num">{appointments.filter(a => a.status === 'upcoming').length}</span>
          <span className="stat-pill-label">Upcoming</span>
        </div>
      </div>

      <div className="dash-columns">

        {/* Today's schedule */}
        <div className="dash-col">
          <div className="dash-col-heading">Today's Schedule</div>
          {todayAppts.length === 0 ? (
            <div className="dash-empty">No appointments today</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {todayAppts.map(a => (
                <Link key={a.id} to={`/clients/${a.client_id}`} className="schedule-item">
                  <div className="schedule-time">{fmtTime(a.time)}</div>
                  <div className="schedule-line" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{a.client_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{a.service || 'Service TBD'}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="dash-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="dash-col-heading">Coming Up</div>
            <Link to="/appointments" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="dash-empty">No upcoming appointments</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {upcoming.map(a => (
                <Link key={a.id} to={`/clients/${a.client_id}`} className="upcoming-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.client_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.service || 'Service TBD'}</div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    <div>{fmtDate(a.date)}</div>
                    <div style={{ color: 'var(--primary)', marginTop: '0.1rem' }}>{fmtTime(a.time)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
