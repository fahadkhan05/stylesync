const router = require('express').Router()
const pool   = require('../db')
const auth   = require('../auth')

router.use(auth)

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.*, c.name AS client_name
     FROM appointments a
     JOIN clients c ON c.id = a.client_id
     WHERE a.user_id = $1
     ORDER BY a.date DESC, a.time DESC`,
    [req.user.id]
  )
  res.json(rows)
})

router.post('/', async (req, res) => {
  const { client_id, date, time, service, notes, status } = req.body
  const { rows } = await pool.query(
    `INSERT INTO appointments (user_id, client_id, date, time, service, notes, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.user.id, client_id, date, time, service, notes, status || 'upcoming']
  )
  res.status(201).json(rows[0])
})

router.put('/:id', async (req, res) => {
  const { date, time, service, notes, status } = req.body
  const { rows } = await pool.query(
    `UPDATE appointments SET date=$1,time=$2,service=$3,notes=$4,status=$5
     WHERE id=$6 AND user_id=$7 RETURNING *`,
    [date, time, service, notes, status, req.params.id, req.user.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Appointment not found' })
  res.json(rows[0])
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM appointments WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id])
  res.status(204).end()
})

module.exports = router
