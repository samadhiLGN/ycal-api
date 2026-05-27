require('dotenv').config()
const express = require('express')
const cors = require('cors')
const pool = require('./db')

const app = express()
app.use(cors())
app.use(express.json())

pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    daily_goal INTEGER DEFAULT 2000,
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    food VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL,
    unit VARCHAR(20) NOT NULL,
    calories NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS workout_plans (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{"days":[]}',
    updated_at TIMESTAMP DEFAULT NOW()
  );
`).then(() => pool.query(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm NUMERIC;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS weight_kg NUMERIC;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_level VARCHAR(20);
`)).catch(err => console.error('DB init error:', err.message))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/entries', require('./routes/entries'))
app.use('/api/goal', require('./routes/goal'))
app.use('/api/workout', require('./routes/workout'))
app.use('/api/profile', require('./routes/profile'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`ycal-api running on :${PORT}`))
