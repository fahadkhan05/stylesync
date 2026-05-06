const router     = require('express').Router({ mergeParams: true })
const pool       = require('../db')
const auth       = require('../auth')
const cloudinary = require('cloudinary').v2
const multer     = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'stylesync', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
})

const upload = multer({ storage })

router.use(auth)

router.post('/', upload.single('photo'), async (req, res) => {
  const { caption } = req.body
  const { rows } = await pool.query(
    'INSERT INTO photos (client_id, url, cloudinary_id, caption) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.params.clientId, req.file.path, req.file.filename, caption || '']
  )
  res.status(201).json(rows[0])
})

router.delete('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT cloudinary_id FROM photos WHERE id=$1', [req.params.id])
  if (rows[0]?.cloudinary_id) {
    await cloudinary.uploader.destroy(rows[0].cloudinary_id).catch(() => {})
  }
  await pool.query('DELETE FROM photos WHERE id=$1', [req.params.id])
  res.status(204).end()
})

module.exports = router
