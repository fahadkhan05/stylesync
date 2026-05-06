import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Clients() {
  const [clients, setClients]   = useState([])
  const [search, setSearch]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ name: '', phone: '', email: '', notes: '' })
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/clients').then(r => setClients(r.data)).finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    const { data } = await api.post('/clients', form)
    setClients(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setForm({ name: '', phone: '', email: '', notes: '' })
    setShowForm(false)
    navigate(`/clients/${data.id}`)
  }

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="loading">Loading clients...</div>

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Clients</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ New Client'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-title">New Client</div>
          <form onSubmit={handleAdd}>
            <div className="grid-2">
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Jane Smith" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 000-0000" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@example.com" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Allergies, preferences..." />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Add Client</button>
          </form>
        </div>
      )}

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients by name, phone, or email..." />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>{search ? 'No clients match your search.' : 'No clients yet.'}</h3>
          <p>Add your first client to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map(c => (
            <Link key={c.id} to={`/clients/${c.id}`} className="client-row">
              <div className="client-avatar">{c.name[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {[c.phone, c.email].filter(Boolean).join(' · ')}
                </div>
              </div>
              {c.upcoming_count > 0 && (
                <span className="badge badge-upcoming">{c.upcoming_count} upcoming</span>
              )}
              {c.last_visit && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Last: {new Date(c.last_visit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
