const router = require('express').Router({ mergeParams: true })
const pool   = require('../db')
const auth   = require('../auth')

router.use(auth)

router.post('/', async (req, res) => {
  const { formula, date, notes } = req.body
  const { rows } = await pool.query(
    'INSERT INTO color_formulas (client_id, formula, date, notes) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.params.clientId, formula, date, notes]
  )
  res.status(201).json(rows[0])
})

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM color_formulas WHERE id=$1', [req.params.id])
  res.status(204).end()
})

module.exports = router
