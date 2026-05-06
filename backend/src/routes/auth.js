const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const pool    = require('../db')

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username])
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Invalid username or password.' })
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, username: user.username, name: user.name } })
})

router.get('/me', require('../auth'), async (req, res) => {
  const { rows } = await pool.query('SELECT id, username, name FROM users WHERE id = $1', [req.user.id])
  res.json(rows[0])
})

module.exports = router
