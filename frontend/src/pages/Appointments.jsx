import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const STATUS_COLORS = { upcoming: '#a855f7', completed: 'var(--success)', cancelled: 'var(--text-muted)' }

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter]             = useState('upcoming')
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    api.get('/appointments').then(r => setAppointments(r.data)).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    const appt = appointments.find(a => a.id === id)
    const { data } = await api.put(`/appointments/${id}`, { ...appt, status })
    setAppointments(prev => prev.map(a => a.id === id ? data : a))
  }

  const deleteAppt = async (id) => {
    if (!confirm('Delete this appointment?')) return
    await api.delete(`/appointments/${id}`)
    setAppointments(prev => prev.filter(a => a.id !== id))
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  if (loading) return <div className="loading">Loading appointments...</div>

  return (
    <div className="page">
      <h1 className="page-title">Appointments</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['upcoming', 'completed', 'cancelled', 'all'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><h3>No {filter} appointments.</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(a => (
            <div key={a.id} className={`appt-item ${a.status}`}>
              <div>
                <Link to={`/clients/${a.client_id}`} style={{ fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
                  {a.client_name}
                </Link>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {a.service || 'Service TBD'} · {new Date(`${String(a.date).slice(0, 10)}T00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {new Date(`2000-01-01T${a.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
                {a.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{a.notes}</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: STATUS_COLORS[a.status], textTransform: 'capitalize' }}>{a.status}</span>
                {a.status === 'upcoming' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(a.id, 'completed')}>Mark Done</button>
                )}
                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteAppt(a.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
