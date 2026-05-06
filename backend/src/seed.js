// Run once to create tables and the stylist account
// Usage: node src/seed.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const pool   = require('./db')
const bcrypt = require('bcryptjs')

async function seed() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      username      VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name          VARCHAR(100),
      created_at    TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS clients (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name       VARCHAR(100) NOT NULL,
      phone      VARCHAR(30),
      email      VARCHAR(100),
      notes      TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      client_id  INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      date       DATE NOT NULL,
      time       TIME NOT NULL,
      service    VARCHAR(150),
      notes      TEXT,
      status     VARCHAR(20) DEFAULT 'upcoming',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS color_formulas (
      id         SERIAL PRIMARY KEY,
      client_id  INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      formula    TEXT NOT NULL,
      date       DATE NOT NULL,
      notes      TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS photos (
      id             SERIAL PRIMARY KEY,
      client_id      INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      url            VARCHAR(500) NOT NULL,
      cloudinary_id  VARCHAR(255),
      caption        VARCHAR(200),
      created_at     TIMESTAMP DEFAULT NOW()
    );
  `)

  const hash = await bcrypt.hash('stylesync123', 10)
  await pool.query(
    `INSERT INTO users (username, password_hash, name)
     VALUES ('stylist', $1, 'Your Name')
     ON CONFLICT (username) DO NOTHING`,
    [hash]
  )

  console.log('✓ Tables created')
  console.log('✓ Login: username=stylist  password=stylesync123')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
