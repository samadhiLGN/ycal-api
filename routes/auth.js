const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

function publicUser(u) {
  return {
    name: u.name, email: u.email, dailyGoal: u.daily_goal,
    heightCm: u.height_cm, weightKg: u.weight_kg,
    age: u.age, gender: u.gender, activityLevel: u.activity_level,
  }
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' })
  try {
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)
       RETURNING id, name, email, daily_goal, height_cm, weight_kg, age, gender, activity_level`,
      [name.trim(), email.trim().toLowerCase(), hash]
    )
    const user = rows[0]
    res.json({ token: makeToken(user), user: publicUser(user) })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' })
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    )
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid email or password' })
    res.json({ token: makeToken(user), user: publicUser(user) })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/me', require('../middleware/auth'), async (req, res) => {
  const { rows } = await pool.query(
    'SELECT name, email, daily_goal, height_cm, weight_kg, age, gender, activity_level FROM users WHERE id = $1',
    [req.user.id]
  )
  const user = rows[0]
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(publicUser(user))
})

module.exports = router
