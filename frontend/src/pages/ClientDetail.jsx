import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const SERVICES = ['Haircut', 'Color', 'Highlights', 'Balayage', 'Blowout', 'Perm', 'Keratin', 'Trim', 'Other']

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [client, setClient]         = useState(null)
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(false)
  const [editForm, setEditForm]     = useState({})
  const [tab, setTab]               = useState('appointments')
  const [error, setError]           = useState('')

  // Appointment form
  const [showApptForm, setShowApptForm] = useState(false)
  const [apptForm, setApptForm]         = useState({ date: '', time: '', service: '', notes: '', status: 'upcoming' })

  // Color formula form
  const [showFormulaForm, setShowFormulaForm] = useState(false)
  const [formulaForm, setFormulaForm]         = useState({ formula: '', date: new Date().toISOString().slice(0, 10), notes: '' })

  // Photo upload
  const [uploading, setUploading] = useState(false)
  const [photoCaption, setPhotoCaption] = useState('')
  const fileRef = useRef(null)

  useEffect(() => { fetchClient() }, [id])

  const fetchClient = async () => {
    try {
      const { data } = await api.get(`/clients/${id}`)
      setClient(data)
      setEditForm({ name: data.name, phone: data.phone || '', email: data.email || '', notes: data.notes || '' })
    } catch { navigate('/clients') }
    finally { setLoading(false) }
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    const { data } = await api.put(`/clients/${id}`, editForm)
    setClient(prev => ({ ...prev, ...data }))
    setEditing(false)
  }

  const deleteClient = async () => {
    if (!confirm(`Delete ${client.name}? This cannot be undone.`)) return
    await api.delete(`/clients/${id}`)
    navigate('/clients')
  }

  const addAppointment = async (e) => {
    e.preventDefault()
    const { data } = await api.post('/appointments', { ...apptForm, client_id: id })
    setClient(prev => ({ ...prev, appointments: [data, ...prev.appointments] }))
    setApptForm({ date: '', time: '', service: '', notes: '', status: 'upcoming' })
    setShowApptForm(false)
  }

  const updateApptStatus = async (apptId, status) => {
    const { data } = await api.put(`/appointments/${apptId}`, {
      ...client.appointments.find(a => a.id === apptId), status
    })
    setClient(prev => ({ ...prev, appointments: prev.appointments.map(a => a.id === apptId ? data : a) }))
  }

  const deleteAppt = async (apptId) => {
    if (!confirm('Delete this appointment?')) return
    await api.delete(`/appointments/${apptId}`)
    setClient(prev => ({ ...prev, appointments: prev.appointments.filter(a => a.id !== apptId) }))
  }

  const addFormula = async (e) => {
    e.preventDefault()
    const { data } = await api.post(`/clients/${id}/color-formulas`, formulaForm)
    setClient(prev => ({ ...prev, color_formulas: [data, ...prev.color_formulas] }))
    setFormulaForm({ formula: '', date: new Date().toISOString().slice(0, 10), notes: '' })
    setShowFormulaForm(false)
  }

  const deleteFormula = async (fid) => {
    if (!confirm('Delete this formula?')) return
    await api.delete(`/clients/${id}/color-formulas/${fid}`)
    setClient(prev => ({ ...prev, color_formulas: prev.color_formulas.filter(f => f.id !== fid) }))
  }

  const uploadPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('photo', file)
      form.append('caption', photoCaption)
      const { data } = await api.post(`/clients/${id}/photos`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setClient(prev => ({ ...prev, photos: [data, ...prev.photos] }))
      setPhotoCaption('')
    } catch { setError('Photo upload failed.') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const deletePhoto = async (pid) => {
    if (!confirm('Delete this photo?')) return
    await api.delete(`/clients/${id}/photos/${pid}`)
    setClient(prev => ({ ...prev, photos: prev.photos.filter(p => p.id !== pid) }))
  }

  if (loading) return <div className="loading">Loading client...</div>
  if (!client) return null

  const statusColor = { upcoming: '#a855f7', completed: 'var(--success)', cancelled: 'var(--text-muted)' }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="client-avatar" style={{ width: 56, height: 56, fontSize: '1.5rem' }}>{client.name[0].toUpperCase()}</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{client.name}</h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {[client.phone, client.email].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(v => !v)}>{editing ? 'Cancel' : 'Edit'}</button>
          <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={deleteClient}>Delete</button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={saveEdit}>
            <div className="grid-2">
              <div className="form-group"><label>Name</label><input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="form-group"><label>Phone</label><input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="form-group"><label>Email</label><input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="form-group"><label>Notes</label><input value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      )}

      {/* Notes banner */}
      {client.notes && !editing && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--primary-light)', borderLeft: '3px solid #a855f7' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a855f7', marginBottom: '0.25rem' }}>NOTES</div>
          <div style={{ fontSize: '0.9rem' }}>{client.notes}</div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {['appointments', 'color formulas', 'photos'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="tab-count">
              {t === 'appointments' ? client.appointments.length
                : t === 'color formulas' ? client.color_formulas.length
                : client.photos.length}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments tab */}
      {tab === 'appointments' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setShowApptForm(v => !v)}>
              {showApptForm ? 'Cancel' : '+ New Appointment'}
            </button>
          </div>

          {showApptForm && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <form onSubmit={addAppointment}>
                <div className="grid-2">
                  <div className="form-group"><label>Date *</label><input type="date" value={apptForm.date} onChange={e => setApptForm(p => ({ ...p, date: e.target.value }))} required /></div>
                  <div className="form-group"><label>Time *</label><input type="time" value={apptForm.time} onChange={e => setApptForm(p => ({ ...p, time: e.target.value }))} required /></div>
                  <div className="form-group">
                    <label>Service</label>
                    <select value={apptForm.service} onChange={e => setApptForm(p => ({ ...p, service: e.target.value }))}>
                      <option value="">Select...</option>
                      {SERVICES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Notes</label><input value={apptForm.notes} onChange={e => setApptForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." /></div>
                </div>
                <button type="submit" className="btn btn-primary">Add Appointment</button>
              </form>
            </div>
          )}

          {client.appointments.length === 0 ? (
            <div className="empty-state"><h3>No appointments yet.</h3></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {client.appointments.map(a => (
                <div key={a.id} className={`appt-item ${a.status}`}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.service || 'Appointment'}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {new Date(`${String(a.date).slice(0, 10)}T00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {new Date(`2000-01-01T${a.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                    {a.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{a.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: statusColor[a.status], textTransform: 'capitalize' }}>{a.status}</span>
                    {a.status === 'upcoming' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => updateApptStatus(a.id, 'completed')}>Mark Done</button>
                    )}
                    <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteAppt(a.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Color formulas tab */}
      {tab === 'color formulas' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setShowFormulaForm(v => !v)}>
              {showFormulaForm ? 'Cancel' : '+ Add Formula'}
            </button>
          </div>

          {showFormulaForm && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <form onSubmit={addFormula}>
                <div className="form-group"><label>Date</label><input type="date" value={formulaForm.date} onChange={e => setFormulaForm(p => ({ ...p, date: e.target.value }))} required /></div>
                <div className="form-group">
                  <label>Color Formula *</label>
                  <textarea value={formulaForm.formula} onChange={e => setFormulaForm(p => ({ ...p, formula: e.target.value }))} rows={3} placeholder="e.g. 6N 50% + 7G 50%, 20vol..." required style={{ width: '100%', resize: 'vertical' }} />
                </div>
                <div className="form-group"><label>Notes</label><input value={formulaForm.notes} onChange={e => setFormulaForm(p => ({ ...p, notes: e.target.value }))} placeholder="Processing time, results..." /></div>
                <button type="submit" className="btn btn-primary">Save Formula</button>
              </form>
            </div>
          )}

          {client.color_formulas.length === 0 ? (
            <div className="empty-state"><h3>No color formulas yet.</h3></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {client.color_formulas.map(f => (
                <div key={f.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(`${String(f.date).slice(0, 10)}T00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteFormula(f.id)}>✕</button>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem', background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius)', whiteSpace: 'pre-wrap' }}>{f.formula}</div>
                  {f.notes && <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{f.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Photos tab */}
      {tab === 'photos' && (
        <>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-title">Upload Photo</div>
            <div className="form-group">
              <label>Caption (optional)</label>
              <input value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} placeholder="e.g. After balayage, June 2025" />
            </div>
            <label className="btn btn-primary" style={{ display: 'inline-block', cursor: 'pointer' }}>
              {uploading ? 'Uploading...' : 'Choose Photo'}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadPhoto} disabled={uploading} />
            </label>
          </div>

          {client.photos.length === 0 ? (
            <div className="empty-state"><h3>No photos yet.</h3></div>
          ) : (
            <div className="photo-grid">
              {client.photos.map(p => (
                <div key={p.id} className="photo-card">
                  <img src={p.url} alt={p.caption || 'Client photo'} />
                  <div className="photo-footer">
                    <span>{p.caption || new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <button onClick={() => deletePhoto(p.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
