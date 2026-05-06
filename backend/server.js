require('dotenv').config()
require('express-async-errors')

const express = require('express')
const cors    = require('cors')

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

app.use('/api/auth',                           require('./src/routes/auth'))
app.use('/api/clients',                        require('./src/routes/clients'))
app.use('/api/appointments',                   require('./src/routes/appointments'))
app.use('/api/clients/:clientId/photos',       require('./src/routes/photos'))
app.use('/api/clients/:clientId/color-formulas', require('./src/routes/colorFormulas'))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong.' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`StyleSync backend running on port ${PORT}`))
