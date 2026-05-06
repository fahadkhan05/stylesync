const router = require('express').Router()
const pool   = require('../db')
const auth   = require('../auth')

router.use(auth)

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.*,
       COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'upcoming') AS upcoming_count,
       MAX(a.date)                                                 AS last_visit
     FROM clients c
     LEFT JOIN appointments a ON a.client_id = c.id
     WHERE c.user_id = $1
     GROUP BY c.id
     ORDER BY c.name`,
    [req.user.id]
  )
  res.json(rows)
})

router.post('/', async (req, res) => {
  const { name, phone, email, notes } = req.body
  const { rows } = await pool.query(
    'INSERT INTO clients (user_id, name, phone, email, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.user.id, name, phone, email, notes]
  )
  res.status(201).json(rows[0])
})

router.get('/:id', async (req, res) => {
  const { id } = req.params
  const [clientRes, apptRes, formulaRes, photoRes] = await Promise.all([
    pool.query('SELECT * FROM clients WHERE id=$1 AND user_id=$2', [id, req.user.id]),
    pool.query('SELECT * FROM appointments WHERE client_id=$1 ORDER BY date DESC, time DESC', [id]),
    pool.query('SELECT * FROM color_formulas WHERE client_id=$1 ORDER BY date DESC', [id]),
    pool.query('SELECT * FROM photos WHERE client_id=$1 ORDER BY created_at DESC', [id]),
  ])
  if (!clientRes.rows[0]) return res.status(404).json({ error: 'Client not found' })
  res.json({
    ...clientRes.rows[0],
    appointments: apptRes.rows,
    color_formulas: formulaRes.rows,
    photos: photoRes.rows,
  })
})

router.put('/:id', async (req, res) => {
  const { name, phone, email, notes } = req.body
  const { rows } = await pool.query(
    'UPDATE clients SET name=$1,phone=$2,email=$3,notes=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
    [name, phone, email, notes, req.params.id, req.user.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Client not found' })
  res.json(rows[0])
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM clients WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id])
  res.status(204).end()
})

module.exports = router
